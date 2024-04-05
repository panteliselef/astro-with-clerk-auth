import { AstroClerkIntegrationParams } from '../types';

type CreateClerkInstanceInternalFn = (options?: AstroClerkIntegrationParams) => Promise<unknown>;

export type { CreateClerkInstanceInternalFn };
