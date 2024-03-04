import type { RouteMatchResult } from './route'

export interface RouteMatcher<T = {}> {
  match(uri: string, exact?: boolean): RouteMatchResult<T> | null;
}