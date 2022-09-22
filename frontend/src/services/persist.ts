import { decryptPayload, encryptPayload } from "./crypto";
import { Store } from "./store";

export enum PersistorState {
  IDLE,
  SAVING,
  LOADING,
}

enum PersitorError {
  LOAD_ERROR,
  SAVE_ERROR
}

interface IPersistable {
  persist: (data: string, storeId: string) => Promise<boolean>
  retreive: (storeId: string) => Promise<string | null>
}

class PresistLocalStorage implements IPersistable {

  persist = async (data: string, storeId: string) => {
    window.localStorage.setItem(`store-${storeId}`, data);
    return true;
  }
  
  retreive = async (storeId: string) => {
    return window.localStorage.getItem(`store-${storeId}`);
  }  
}

type OnPersistorStateChangeCallback = (state: PersistorState) => void

export class Persist {

  syncTracker = 0;
  state = PersistorState.IDLE;
  lastSync: Date | null = null

  implementation: IPersistable = new PresistLocalStorage()

  callbacks: {
    stateChange: Array<OnPersistorStateChangeCallback>
  } = {
    stateChange: []
  }

  setState = (state: PersistorState) => {
    this.state = state;
    this.callbacks.stateChange.forEach(callback => callback(this.state))    
  }

  retreiveData = async (storeId: string, salt: string): Promise<Store | null> => {
    this.setState(PersistorState.LOADING)
    const store = await this.implementation.retreive(storeId);
    if (store) {
      try {
        const decrypted = await decryptPayload(store, salt);
        this.setState(PersistorState.IDLE)
        if (decrypted) {
          this.lastSync = new Date();
          return JSON.parse(decrypted);
        }
      } catch {
        this.setState(PersistorState.IDLE)
        throw new Error();
      }
    }
    this.setState(PersistorState.IDLE)
    throw new Error();
  };

  storeData = async (
    storeToPersist: Store,
    storeId: string,
    salt: string
  ) => {
    const payload = (await encryptPayload(storeToPersist, salt)).toString();
    this.implementation.persist(payload, storeId);
  };  

  syncNow = async (store: Store, storeId: string, salt: string) => {
    this.setState(PersistorState.SAVING)
    await this.storeData(store, storeId, salt)
    setTimeout(() => {
      this.setState(PersistorState.IDLE)
      this.lastSync = new Date()
    }, 1000)    
  }

  sync = (store: Store, storeId: string, salt: string) => {
    window.clearInterval(this.syncTracker);
    this.syncTracker = setInterval(async () => {  
      this.syncNow(store, storeId, salt)
    }, 5000) as unknown as number // TODO fixme
  
    return () => window.clearInterval(this.syncTracker);
  }

  stop = () => {
    this.setState(PersistorState.IDLE)
    window.clearInterval(this.syncTracker);
  }

  onPersistorStateChange = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange.push(callback)
  }
  onPersistorStateChangeRemove = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange = this.callbacks.stateChange.filter(cb => cb !== callback)
  }
}