import { v4 } from "uuid";

export type Store = {
  content: string;
  version: string;
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
    content: "",
    version: "0",
  };
}
