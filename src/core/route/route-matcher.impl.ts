import type { Route, RouteMatchResult } from './route'
import { join, URIMatcher } from '../uri/uri-matcher'
import type { RouteMatcher } from './route-matcher'

export class RouteMatcherImpl<T> implements RouteMatcher<T> {
  public constructor(private readonly routes: Route<T>[], private readonly parents: Route<T>[] = []) {
  }

  public match(uri: string, exact = false): RouteMatchResult<T> | null {
    let result: RouteMatchResult<T> | null = null
    for (const r of this.routes) {
      if (r.children && r.children.length > 0) {
        const subMatchResult = new RouteMatcherImpl<T>(r.children, [ ...this.parents, r ]).match(uri)
        if (!subMatchResult) {
          continue
        }
        result = subMatchResult
        break
      }
      const m = new URIMatcher(r.path, join(this.parents.map(p => p.path)))
      if (m.test(uri, exact)) {
        result = {
          route: r,
          parent: this.parents[this.parents.length - 1],
          matchResult: m.match(uri)
        }
        break
      }
    }
    return result
  }
}
