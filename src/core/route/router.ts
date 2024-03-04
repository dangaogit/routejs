import type { Route } from './route'

export interface Router {
  getCurrentRoute(): Route;
  /**
   * Get the current full history queue of the router
   */
  getHistoryQueue(): Route[];
  /**
   * Get the current temporarily queue of the router
   * temporarily queue is the queue that will be cleared after the next push navigation
   */
  getTemporarilyQueue(): Route[];
  /**
   * navigate to the route
   * before navigate, the router will push the current route to the history queue and clear the temporary queue
   * @param target the route to navigate to
   */
  navigateTo(target: Route | string): void;
  /**
   * go back or forward in the history queue
   * if the delta out of the range of the history queue, the router will do nothing
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
