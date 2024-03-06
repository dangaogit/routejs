import { type HistoryChangeEventListener, HistoryRouter } from '../core/history-router/history-router'
import type React from 'react'
import type { Route, RouteMatchResult } from '../core/route/route'
import { RouteMatcherImpl } from '../core/route/route-matcher.impl'
import { createHistoryProvider } from '../core/history-router/create-history.provider'
import type { RouterChangeEventListener } from '../core/route/router'

interface RoutePayload {
  component: () => Promise<React.FC>;
}

export interface RouterConfig {
  routes: RouteConfig[];
  base?: string;
  historyProvider?: History;
}

export type WebRouterChangeEventListener = RouterChangeEventListener<RoutePayload>;

export type RouteConfig = Route<RoutePayload>

export type WebRouteMatchResult = RouteMatchResult<RoutePayload>

export class WebHistoryRouter extends HistoryRouter<RoutePayload> {
  private readonly historyChangeHandlers
  private readonly historyProvider: History
  private readonly originPushState
  private readonly originReplaceState

  public constructor (config: RouterConfig) {
    const { routes, base, historyProvider = history } = config
    const historyChangeHandlers = new Set<HistoryChangeEventListener>()
    super({
      routes,
      baseURI: base ?? '',
      historyProvider: createHistoryProvider({
        getCurrentURI: () => `${location.pathname}${location.search}`,
        navigateTo: (uri: string) => {
          history.pushState({}, '', uri)
        },
        go: (delta: number) => {
          history.go(delta)
        },
        addEventListener: (type: 'change', call: HistoryChangeEventListener) => {
          historyChangeHandlers.add(call)
        }
      }),
      routeMatcherProvider: new RouteMatcherImpl(routes)
    })
    this.historyChangeHandlers = historyChangeHandlers
    this.historyProvider = historyProvider
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originPushState = historyProvider.pushState
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originReplaceState = historyProvider.replaceState
    const { originReplaceState, originPushState } = this
    const dispatch = this.dispatchHistoryChange.bind(this)
    historyProvider.pushState = function (data, unused, url) {
      const source = `${location.pathname}${location.search}`
      originPushState.call(history, data, '', url)
      const target = `${location.pathname}${location.search}`
      dispatch(source, target)
    }
    historyProvider.replaceState = function (data, unused, url) {
      const source = `${location.pathname}${location.search}`
      originReplaceState.call(history, data, '', url)
      const target = `${location.pathname}${location.search}`
      dispatch(source, target)
    }
  }

  public destroy (): void {
    this.historyProvider.pushState = this.originPushState
    this.historyProvider.replaceState = this.originReplaceState
  }

  private dispatchHistoryChange (source: string, target: string): void {
    for (const handler of this.historyChangeHandlers) {
      handler(source, target)
    }
  }
}
