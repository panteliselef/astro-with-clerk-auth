import { ClerkOptions, MultiDomainAndOrProxyPrimitives, Without } from '@clerk/types';
export type AstroClerkIntegrationParams = Without<
  ClerkOptions,
  'isSatellite' | 'sdkMetadata' | 'telemetry' | 'standardBrowser' | 'selectInitialSession'
> &
  MultiDomainAndOrProxyPrimitives;
