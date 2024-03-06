import React, { Suspense, createElement, lazy, useContext } from 'react'
import { RouteParentMatchedContext, useCurrentRender, type MatchedRoute } from './router-provider'

export function useRoute(): MatchedRoute | null {
  const route = useContext(RouteParentMatchedContext)
  return route
}

export const RouterView: React.FC = () => {
  const currentMatched = useCurrentRender()
  return (
    <RouteParentMatchedContext.Provider value={currentMatched}>
      <Suspense fallback={<>疯狂加载中...</>}>
        {currentMatched && createElement(getLazyRouteComponent(currentMatched.route.component))}
      </Suspense>
    </RouteParentMatchedContext.Provider>
  )
}

const lazyRouteComponents = new Map<() => Promise<React.ComponentType>, React.LazyExoticComponent<React.ComponentType>>()

function getLazyRouteComponent (asyncComponent: () => Promise<React.ComponentType>): React.LazyExoticComponent<React.ComponentType> {
  let lazyComponent = lazyRouteComponents.get(asyncComponent)
  if (!lazyComponent) {
    lazyComponent = toLazyComponent(asyncComponent)
    lazyRouteComponents.set(asyncComponent, lazyComponent)
  }
  return lazyComponent
}

function toLazyComponent<T extends React.ComponentType> (asyncComponent: () => Promise<T>): React.LazyExoticComponent<T> {
  return lazy(async () => {
    return {
      default: await asyncComponent()
    }
  })
}
