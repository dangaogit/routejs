import { type HistoryChangeEventListener, HistoryRouter } from '../core/history-router/history-router'
import React from 'react'
import type { Route } from '../core/route/route'
import { RouteMatcherImpl } from '../core/route/route-matcher.impl'
import { createHistoryProvider } from '../core/history-router/create-history.provider'

interface RoutePayload {
  component: () => Promise<React.FC>;
}

interface RouterConfig {
  routes: RouteConfig[];
  base?: string;
}

export type RouteConfig = Route<RoutePayload>;

export class WebHistoryRouter extends HistoryRouter<RoutePayload> {

  private historyChangeHandlers = new Set<HistoryChangeEventListener>();

  private readonly originPushState = history.pushState;

  private readonly originReplaceState = history.replaceState;

  public constructor(config: RouterConfig) {
    const { routes, base } = config
    super({
      routes,
      baseURI: config.base ?? '',
      historyProvider: createHistoryProvider({
        getCurrentURI: () => `${ location.pathname }${ location.search }`,
        navigateTo: (uri: string) => {
          history.pushState({}, '', uri)
        },
        go: (delta: number) => {
          history.go(delta)
        },
        addEventListener: (type: 'change', call: HistoryChangeEventListener) => {
          this.historyChangeHandlers.add(call)
        }
      }),
      routeMatcherProvider: new RouteMatcherImpl(routes)
    });
    const { originReplaceState, originPushState } = this
    const dispatch = this.dispatchHistoryChange.bind(this)
    history.pushState = function (data, unused, url) {
      const source = `${ location.pathname }${ location.search }`
      originPushState(data, '', url)
      const target = `${ location.pathname }${ location.search }`
      dispatch(source, target)
    }
    history.replaceState = function (data, unused, url) {
      const source = `${ location.pathname }${ location.search }`
      originReplaceState(data, '', url)
      const target = `${ location.pathname }${ location.search }`
      dispatch(source, target)
    }
  }

  public destroy(): void {
    history.pushState = this.originPushState
    history.replaceState = this.originReplaceState
  }

  private dispatchHistoryChange(source: string, target: string): void {
    for (const handler of this.historyChangeHandlers) {
      handler(source, target)
    }
  }
}