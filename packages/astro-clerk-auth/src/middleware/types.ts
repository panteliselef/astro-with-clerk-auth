import type { OptionalVerifyTokenOptions } from "@clerk/backend";
import type {
  MultiDomainAndOrProxy,
  PublishableKeyOrFrontendApi,
  SecretKeyOrApiKey,
} from "@clerk/types";
// import type { IncomingMessage } from "http";

// Request contained in GetServerSidePropsContext, has cookies but not query
// type GsspRequest = IncomingMessage & {
//   cookies: Partial<{
//     [key: string]: string;
//   }>;
// };

export type RequestLike = Request;

export type WithAuthOptions = Partial<PublishableKeyOrFrontendApi> &
  Partial<SecretKeyOrApiKey> &
  OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    signInUrl?: string;
  };
