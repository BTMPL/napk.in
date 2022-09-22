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

type OnPersistorStateChangeCallback = (state: PersistorState) => void

export class Persist {

  syncTracker = 0;
  state = PersistorState.IDLE;
  lastSync: Date | null = null

  callbacks: {
    stateChange: Array<OnPersistorStateChangeCallback>
  } = {
    stateChange: []
  }

  setState = (state: PersistorState) => {
    this.state = state;
    this.callbacks.stateChange.forEach(callback => callback(this.state))    
  }

  persist = async (data: string, storeId: string) => {
    window.localStorage.setItem(`store-${storeId}`, data);
  }
  
  retreive = async (storeId: string) => {
    return window.localStorage.getItem(`store-${storeId}`);
  }
  

  retreiveData = async (storeId: string, salt: string): Promise<Store | null> => {
    this.setState(PersistorState.LOADING)
    const store = await this.retreive(storeId);
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
    const payload = await encryptPayload(storeToPersist, salt);
    this.persist(payload, storeId);
  };  

  sync = (store: Store, storeId: string, salt: string) => {
    window.clearInterval(this.syncTracker);
    this.syncTracker = setInterval(async () => {
      this.setState(PersistorState.SAVING)
      await this.storeData(store, storeId, salt)
      setTimeout(() => {
        this.setState(PersistorState.IDLE)
        this.lastSync = new Date()
      }, 1000)
    }, 5000) as unknown as number // TODO fixme
  
    return () => window.clearInterval(this.syncTracker);
  }

  onPersistorStateChange = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange.push(callback)
  }
  onPersistorStateChangeRemove = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange = this.callbacks.stateChange.filter(cb => cb !== callback)
  }
}