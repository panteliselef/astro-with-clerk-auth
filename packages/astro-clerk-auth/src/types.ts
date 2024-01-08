import type { ClerkOptions, MultiDomainAndOrProxyPrimitives, Without } from '@clerk/types';
export type AstroClerkIntegrationParams = Without<
  ClerkOptions,
  'isSatellite' | 'sdkMetadata' | 'telemetry' | 'standardBrowser' | 'selectInitialSession'
> &
  MultiDomainAndOrProxyPrimitives;

declare global {
  interface Window {
    componentPropsMap?: Map<string, Map<string, Record<string, unknown>>>;
  }
}

export {};
