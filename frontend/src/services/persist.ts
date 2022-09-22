import { decryptPayload, encryptPayload } from "./crypto";
import { Store } from "./store";

export enum PersistorState {
  IDLE,
  SAVING,
  LOADING,
}

enum PersitorError {
  LOAD_ERROR,
  SAVE_ERROR,
}

interface IPersistable {
  persist: (data: Uint8Array, storeId: string) => Promise<boolean>;
  retreive: (storeId: string) => Promise<string | null>;
}

export class PresistLocalStorage implements IPersistable {
  persist = async (data: Uint8Array, storeId: string) => {
    window.localStorage.setItem(`store-${storeId}`, data.toString());
    return true;
  };

  retreive = async (storeId: string) => {
    return window.localStorage.getItem(`store-${storeId}`);
  };
}

export class PersistS3 implements IPersistable {
  storeUrl: string = "";
  s3Url: string = "";

  constructor(storeUrl: string, s3Url: string) {
    this.storeUrl = storeUrl;
    this.s3Url = s3Url;
  }

  persist = async (data: Uint8Array, storeId: string) => {
    console.log("try parsist");
    const shapeFileBlob = new Blob([data.toString()], {
      type: "text/plain",
    });

    const file = new File([shapeFileBlob], `${storeId}.bin`, {
      type: shapeFileBlob.type,
    });

    const formData = new FormData();
    formData.set("file", file);

    const request = await fetch(this.storeUrl, {
      body: formData,
      method: "POST",
    });
    const json = await request.json();
    if (!json.link) {
      throw new Error();
    }

    return true;
  };

  retreive = async (storeId: string) => {
    const request = await fetch(`${this.s3Url}/${storeId}.bin`);
    const response = request.text();
    return response;
  };
}

type OnPersistorStateChangeCallback = (state: PersistorState) => void;

export class Persist {
  constructor(implementation: IPersistable = new PresistLocalStorage()) {
    this.implementation = implementation;
  }

  syncTracker = 0;
  state = PersistorState.IDLE;
  lastSync: Date | null = null;

  implementation: IPersistable;

  callbacks: {
    stateChange: Array<OnPersistorStateChangeCallback>;
  } = {
    stateChange: [],
  };

  setState = (state: PersistorState) => {
    this.state = state;
    this.callbacks.stateChange.forEach((callback) => callback(this.state));
  };

  retreiveData = async (
    storeId: string,
    salt: string
  ): Promise<Store | null> => {
    this.setState(PersistorState.LOADING);
    const store = await this.implementation.retreive(storeId);
    if (store) {
      try {
        const decrypted = await decryptPayload(store, salt);
        this.setState(PersistorState.IDLE);
        if (decrypted) {
          this.lastSync = new Date();
          return JSON.parse(decrypted);
        }
      } catch {
        this.setState(PersistorState.IDLE);
        throw new Error();
      }
    }
    this.setState(PersistorState.IDLE);
    throw new Error();
  };

  storeData = async (storeToPersist: Store, storeId: string, salt: string) => {
    const payload = await encryptPayload(storeToPersist, salt);
    await this.implementation.persist(payload as Uint8Array, storeId);
  };

  syncNow = async (store: Store, storeId: string, salt: string) => {
    this.setState(PersistorState.SAVING);
    await this.storeData(store, storeId, salt);
    this.setState(PersistorState.IDLE);
    this.lastSync = new Date();
  };

  sync = (store: Store, storeId: string, salt: string) => {
    return;
    window.clearInterval(this.syncTracker);
    this.syncTracker = setInterval(async () => {
      this.syncNow(store, storeId, salt);
    }, 5000) as unknown as number; // TODO fixme

    return () => window.clearInterval(this.syncTracker);
  };

  stop = () => {
    this.setState(PersistorState.IDLE);
    window.clearInterval(this.syncTracker);
  };

  onPersistorStateChange = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange.push(callback);
  };
  onPersistorStateChangeRemove = (callback: OnPersistorStateChangeCallback) => {
    this.callbacks.stateChange = this.callbacks.stateChange.filter(
      (cb) => cb !== callback
    );
  };
}
