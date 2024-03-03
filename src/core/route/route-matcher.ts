import type { Route, RouteMatchResult } from './route'
import { URIMatcher } from '../uri/uri-matcher'

export class RouteMatcher {
  public constructor(private readonly routes: Route[], private readonly baseURI: string = '/') {
  }

  public match(uri: string): RouteMatchResult | null {
    let matchRoute: Route | undefined
    let matcher: URIMatcher | undefined
    for (const r of this.routes) {
      const m = new URIMatcher(r.path, this.baseURI)
      if (m.test(uri)) {
        matchRoute = r
        matcher = m
        break
      }
    }
    if (!matchRoute || !matcher) {
      return null
    }
    return {
      route: matchRoute,
      parent: undefined,
      matchResult: matcher.match(uri)
    }
  }
}
