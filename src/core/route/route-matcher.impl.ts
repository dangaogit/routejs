import type { Route, RouteMatchResult } from './route'
import { URIMatcher } from '../uri/uri-matcher'
import type { RouteMatcher } from './route-matcher'

export class RouteMatcherImpl<T> implements RouteMatcher<T> {
  public constructor(private readonly routes: Route<T>[], private readonly parents: Route<T>[] = []) {
  }

  public match(uri: string, exact = false): RouteMatchResult<T> | null {
    for (const r of this.routes) {
      const fullRoutes = [ ...this.parents, r ]
      const m = new URIMatcher(...fullRoutes.map(p => p.path))
      if (!m.test(uri, exact)) {
        continue
      }
      if (r.children && r.children.length > 0) {
        const subMatchResult = new RouteMatcherImpl<T>(r.children, fullRoutes).match(uri)
        if (subMatchResult) {
          return subMatchResult
        }
      }
      return {
        route: r,
        parents: this.parents,
        matchResult: m.match(uri)
      }
    }
    return null
  }
}
