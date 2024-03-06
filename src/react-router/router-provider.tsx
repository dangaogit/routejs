import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WebHistoryRouter, type RouterConfig, type RouteConfig, type WebRouterChangeEventListener, type WebRouteMatchResult } from './web-history-router'
import { RouterView } from './router-view'

export interface MatchedRoute {
  query: Record<string, string>;
  params: Record<string, string>;
  originURI: string;
  parentRoute?: RouteConfig | null;
  route: RouteConfig;
}

export function useCurrentRender(): MatchedRoute | null {
  const matchedResult = useContext(RouteMatchedContext)
  const renderRoutes = useMemo(() => matchedResult ? [...matchedResult.parents, matchedResult.route] : [], [matchedResult])
  const parentRoute = useContext(RouteParentMatchedContext)
  const route = useMemo<RouteConfig | null>(() => {
    if (renderRoutes.length === 0) {
      return null
    }
    if (!parentRoute) {
      return renderRoutes[0]
    }
    const parentIndex = renderRoutes.findIndex(r => r === parentRoute.route)
    return renderRoutes[parentIndex + 1]
  }, [parentRoute, renderRoutes])

  if (!matchedResult || !route) {
    return null
  }
  return toMatchedRoute(route, matchedResult)

  function toMatchedRoute(route: RouteConfig, matchedResult: WebRouteMatchResult): MatchedRoute {
    return {
      route,
      query: matchedResult.matchResult.getQueryParams(),
      params: matchedResult.matchResult.getPathParams(),
      originURI: matchedResult.matchResult.getOriginURI(),
      parentRoute: parentRoute?.route
    }
  }
}

export const RouterContext = createContext<WebHistoryRouter | null>(null)
export const RouteMatchedContext = createContext<WebRouteMatchResult | null>(null)
export const RouteParentMatchedContext = createContext<MatchedRoute | null>(null)
export const RouterProvider: React.FC<RouterConfig> = ({ routes }) => {
  const router = useMemo(() => new WebHistoryRouter({ routes }), [])
  const [routeMatchedResult, setRouteMatchedResult] = useState<WebRouteMatchResult | null>(null)

  useEffect(() => {
    setRouteMatchedResult(router.getCurrentMatched())
    const changeHandler: WebRouterChangeEventListener = (source, target) => {
      setRouteMatchedResult(target)
    }
    router.addEventListener('change', changeHandler)
    return () => {
      router.destroy()
      router.removeEventListener('change', changeHandler)
    }
  }, [])
  return (
    <RouterContext.Provider value={router}>
      <RouteMatchedContext.Provider value={routeMatchedResult}>
        <RouterView />
      </RouteMatchedContext.Provider>
    </RouterContext.Provider>
  )
}
