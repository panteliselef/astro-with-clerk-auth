import type { OptionalVerifyTokenOptions } from "@clerk/backend";
import type {
  MultiDomainAndOrProxy,
  PublishableKeyOrFrontendApi,
  SecretKeyOrApiKey,
} from "@clerk/types";

export type RequestLike = Request;

export type WithAuthOptions = Partial<PublishableKeyOrFrontendApi> &
  Partial<SecretKeyOrApiKey> &
  OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    signInUrl?: string;
  };
