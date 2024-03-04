import type { Route, RouteMatchResult } from './route'

export interface Router {
  /**
   * Get the current route of the router
   * @returns the current matched route, or null if no route matched
   */
  getCurrentMatched(): RouteMatchResult | null;
  /**
   * Get the current full history stack of the router
   */
  getHistoryStack(): RouteMatchResult[];
  /**
   * Get the current temporarily stack of the router
   * temporarily queue is the queue that will be cleared after the next push navigation
   */
  getTemporarilyStack(): RouteMatchResult[];
  /**
   * navigate to the route
   * before navigate, the router will push the current route to the history queue and clear the temporary queue
   * @param target the route to navigate to
   */
  navigateTo(target: string): void;
  /**
   * go back or forward in the history stack
   * if the delta out of the range of the history stack, the router will do nothing
   * @param delta
   */
  go(delta: number): void;
  /**
   * Register routes to the router
   * @param routes
   */
  registerRoutes(routes: Route[]): void;
  /**
   * Unregister routes from the router
   * @param routes
   */
  unregisterRoutes(routes: Route[]): void;
}
