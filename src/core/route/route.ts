import type { URIMatchResult } from '../uri/uri-matcher'

export type Route<T = {}> = T & {
  path: string;
  children?: Route<T>[];
}

export interface RouteMatchResult<T = {}> {
  route: Route<T>;
  parents: Route<T>[];
  matchResult: URIMatchResult;
}
