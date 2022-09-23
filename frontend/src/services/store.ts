import { v4 } from "uuid";

export type Store = {
  content: string;
  version: number;
  dirty: boolean;
};

export function getStoreIdFromUrl(url: string) {
  if (url.indexOf("/n/") === 0) {
    return url.substring(3);
  }

  return null;
}

export function generateNewStoreId() {
  return v4();
}

export function generateNewStore(): Store {
  return {
    content:
      "Hi. This notepad is yours. Save the URL, open it on other devices, share with your friends.\n\nThe data is encrypted on your machine and stored remotely. If you lose the store id and the password (both are in the URL) there's no going back.",
    version: 0,
    dirty: false,
  };
}
