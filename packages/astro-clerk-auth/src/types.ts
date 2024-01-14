import type {
  CheckAuthorizationWithCustomPermissions,
  ClerkOptions,
  MultiDomainAndOrProxyPrimitives,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  Without,
} from '@clerk/types';
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

export type ProtectComponentDefaultProps =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
    };

export {};
