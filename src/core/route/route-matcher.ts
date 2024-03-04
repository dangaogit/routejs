import type { RouteMatchResult } from './route'

export interface RouteMatcher {
  match(uri: string, exact?: boolean): RouteMatchResult | null;
}