export async function persist(data: string, storeId: string) {
  window.localStorage.setItem(`store-${storeId}`, data);
}

export async function retreive(storeId: string) {
  return window.localStorage.getItem(`store-${storeId}`);
}
