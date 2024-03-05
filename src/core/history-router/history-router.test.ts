import { assert, describe, test } from 'vitest'
import type { Route } from '../route/route'
import { type HistoryChangeEventListener, HistoryRouter } from './history-router'
import { createHistoryProvider } from './create-history.provider'
import { RouteMatcherImpl } from '../route/route-matcher.impl'

describe('history-router', () => {
  test('history-router & create history router', () => {
    const routes: Route[] = [
      {
        path: '/a'
      }
    ]
    const router = new HistoryRouter({
      routes,
      baseURI: '/base',
      historyProvider: createHistoryProvider({
        getCurrentURI: () => '/base/a?a=1',
        navigateTo: (uri: string) => {
        },
        go: (delta: number) => {
        },
        addEventListener: () => {
        }
      }),
      routeMatcherProvider: new RouteMatcherImpl(routes, [ { path: '/base' } ])
    })
    assert.equal(router.getCurrentMatched()?.route.path, routes[0].path)
  })

  test('history-router & cache matched current route', () => {
    const routes: Route[] = [
      {
        path: '/a'
      }
    ]
    let callRouteMatcherCount = 0
    const fakeCurrentURI = '/base/a?a=1'
    const router = new HistoryRouter({
      routes,
      baseURI: '/base',
      historyProvider: createHistoryProvider({
        getCurrentURI: () => {
          return fakeCurrentURI
        },
        navigateTo: (uri: string) => {
        },
        go: (delta: number) => {
        },
        addEventListener: () => {
        }
      }),
      routeMatcherProvider: {
        match: (uri: string) => {
          callRouteMatcherCount++
          return {
            route: routes[0],
            parents: [],
            matchResult: {
              getQueryParams(): Record<string, string> {
                return {}
              },
              getPathParams(): Record<string, string> {
                return {}
              },
              getOriginURI(): string {
                return fakeCurrentURI
              }
            }
          }
        }
      }
    })
    router.getCurrentMatched()
    assert.equal(callRouteMatcherCount, 1)
    router.getCurrentMatched()
    router.getCurrentMatched()
    assert.equal(callRouteMatcherCount, 1)
    assert.equal(router.getCurrentMatched()?.route.path, routes[0].path)
  })

  test('history-router & historyStack', () => {
    const routes: Route[] = [
      {
        path: '/a'
      },
      {
        path: '/b'
      },
      {
        path: '/c'
      }
    ]
    let currentURI = '/base/a?a=1'
    let callGoCount = 0
    const router = new HistoryRouter({
      routes,
      baseURI: '/base',
      historyProvider: createHistoryProvider({
        getCurrentURI: () => {
          return currentURI
        },
        navigateTo: (uri: string) => {
          currentURI = uri
        },
        go: (delta: number) => {
          callGoCount++
        },
        addEventListener: () => {
        }
      }),
      routeMatcherProvider: new RouteMatcherImpl(routes, [ { path: '/base' } ])
    })
    assert.equal(router.getCurrentMatched()?.route.path, routes[0].path)
    router.navigateTo('/base/b')
    assert.equal(router.getCurrentMatched()?.route.path, routes[1].path)
    assert.equal(router.getHistoryStack().length, 2)
    assert.equal(router.getHistoryStack()[1].route.path, routes[1].path)
    assert.equal(router.getTemporarilyStack().length, 0)
    router.navigateTo('/base/c')
    assert.equal(router.getTemporarilyStack().length, 0)
    router.go(-2)
    assert.equal(callGoCount, 1)
    assert.equal(router.getTemporarilyStack().length, 2)
    assert.equal(router.getCurrentMatched()?.route.path, routes[0].path)
    router.go(1)
    assert.equal(callGoCount, 2)
    assert.equal(router.getTemporarilyStack().length, 1)
    assert.equal(router.getCurrentMatched()?.route.path, '/b')
    router.navigateTo('/base/a')
    assert.equal(router.getTemporarilyStack().length, 0)
    assert.equal(router.getHistoryStack().length, 3)
  })
  test('history-router & history change event', () => {
    const routes: Route[] = [
      {
        path: '/a'
      },
      {
        path: '/b'
      },
      {
        path: '/c'
      }
    ]
    let currentURI = '/base/c'
    let callGoCount = 0
    const changeEventCalls: HistoryChangeEventListener[] = []
    const historyProvider = createHistoryProvider({
      getCurrentURI: () => {
        return currentURI
      },
      navigateTo: (uri: string) => {
        currentURI = uri
      },
      go: (delta: number) => {
        callGoCount++
      },
      addEventListener: (type: 'change', call: HistoryChangeEventListener) => {
        changeEventCalls.push(call)
      }
    })
    const router = new HistoryRouter({
      routes,
      baseURI: '/base',
      historyProvider: historyProvider,
      routeMatcherProvider: new RouteMatcherImpl(routes, [ { path: '/base' } ])
    })
    changeEventCalls.forEach((call) => {
      call('/base/a?a=1', '/base/c')
    })
    assert.equal(router.getCurrentMatched()?.route.path, '/c')
  })
})