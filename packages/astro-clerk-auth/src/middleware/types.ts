import type { OptionalVerifyTokenOptions } from "@clerk/backend";
import type {
  MultiDomainAndOrProxy
} from "@clerk/types";
// import type { IncomingMessage } from "http";

// Request contained in GetServerSidePropsContext, has cookies but not query
// type GsspRequest = IncomingMessage & {
//   cookies: Partial<{
//     [key: string]: string;
//   }>;
// };

export type RequestLike = Request;

export type WithAuthOptions = 
  OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    publishableKey?: string;
    secretKey?: string;
    signInUrl?: string;
  };
