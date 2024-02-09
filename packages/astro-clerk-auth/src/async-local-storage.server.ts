import { AsyncLocalStorage } from 'node:async_hooks';

function createAsyncLocalStorage<Store extends {}>(): AsyncLocalStorage<Store> {
  return new AsyncLocalStorage();
}


export const authAsyncStorage = createAsyncLocalStorage();