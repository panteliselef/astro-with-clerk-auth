import { type Generated, Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';

interface GuestbookTable {
  id: Generated<number>;
  email: string;
  message: string;
  created_by: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Database {
  guestbook: GuestbookTable;
}

export const queryBuilder = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    url: import.meta.env.DATABASE_URL || '',
  }),
});
