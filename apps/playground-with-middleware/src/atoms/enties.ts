import { atom } from 'nanostores';

export type Entry = {
  id: number;
  message: string;
  created_by: string;
};
export const entriesStore = atom([] as Entry[]);
