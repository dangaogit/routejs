import type { URIMatchResult } from '../uri/uri-matcher'

export interface Route {
  path: string;
  children?: Route[];
}

export interface RouteMatchResult {
  route: Route;
  parent?: Route;
  matchResult: URIMatchResult;
}
