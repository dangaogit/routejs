import type { Route, RouteMatchResult } from './route'
import { join, URIMatcher } from '../uri/uri-matcher'

export class RouteMatcher {
  public constructor(private readonly routes: Route[], private readonly parents: Route[] = []) {
  }

  public match(uri: string): RouteMatchResult | null {
    let result: RouteMatchResult | null = null
    for (const r of this.routes) {
      if (r.children) {
        const subMatchResult = new RouteMatcher(r.children, [...this.parents, r]).match(uri)
        if (!subMatchResult) {
          continue
        }
        result = subMatchResult
        break
      }
      const m = new URIMatcher(r.path, join(this.parents.map(p => p.path)))
      if (m.test(uri)) {
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
