import type { Route, RouteMatchResult } from '../route/route'
import type { Router } from '../route/router'
import type { RouteMatcher } from '../route/route-matcher'

export interface HistoryRouterConfig<T> {
  routes: Route<T>[];
  baseURI: string;
  historyProvider: HistoryProvider;
  routeMatcherProvider: RouteMatcher<T>;
}

export type HistoryChangeEventListener = (source: string, target: string) => void

export interface HistoryProvider {
  getCurrentURI: () => string;
  navigateTo: (uri: string) => void;
  go: (delta: number) => void;
  addEventListener: (type: 'change', call: HistoryChangeEventListener) => void;
}

export class Stack<T> implements Iterable<T> {
  private stackQueue: T[] = []

  public constructor(initStackQueue: T[] = []) {
    this.stackQueue = [ ...initStackQueue ]
  }

  public get length(): number {
    return this.stackQueue.length
  }

  public [Symbol.iterator](): Iterator<T> {
    let index = 0
    return {
      next: () => {
        if (index < this.length) {
          return {
            value: this.stackQueue[index++],
            done: false
          }
        }
        return {
          value: null,
          done: true
        }

      }
    }
  }

  public push(...items: T[]): void {
    this.stackQueue.push(...items)
  }

  public clear(): void {
    this.stackQueue = []
  }

  public get(index: number): T {
    return this.stackQueue[index]
  }

  public getLatest(): T | undefined {
    return this.stackQueue[this.length - 1]
  }

  public pop(delta: number): T[] {
    const popped: T[] = []
    const count = delta > this.length ? this.length : delta
    for (let i = 0; i < count; i++) {
      popped.push(this.stackQueue.pop()!)
    }
    return popped
  }
}


export class HistoryRouter<T = {}> implements Router<T> {
  private readonly config: HistoryRouterConfig<T>
  private readonly historyStack = new Stack<RouteMatchResult<T>>()
  private readonly temporarilyStack = new Stack<RouteMatchResult<T>>()
  #cacheMatchResult: RouteMatchResult<T> | null = null

  public constructor(config: HistoryRouterConfig<T> & Partial<Pick<HistoryRouterConfig<T>, 'baseURI'>>) {
    this.config = {
      ...config,
      baseURI: config.baseURI ?? ''
    }
    this.config.historyProvider.addEventListener('change', this.changeEventListener.bind(this))
  }

  private get cacheMatchResult(): RouteMatchResult<T> | null {
    return this.#cacheMatchResult
  }

  private set cacheMatchResult(value: RouteMatchResult<T> | null) {
    this.#cacheMatchResult = value
  }

  private get currentMatchURI(): string | undefined {
    return this.cacheMatchResult?.matchResult.getOriginURI()
  }

  public getCurrentMatched(): RouteMatchResult<T> | null {
    const { historyProvider: { getCurrentURI }, routeMatcherProvider } = this.config
    const uri = getCurrentURI()
    if (this.currentMatchURI === uri) {
      return this.cacheMatchResult
    }
    this.cacheMatchResult = routeMatcherProvider.match(uri)
    if (this.cacheMatchResult) {
      this.historyStack.push(this.cacheMatchResult)
    }
    return this.cacheMatchResult
  }

  public getHistoryStack(): RouteMatchResult<T>[] {
    return [ ...this.historyStack ]
  }

  public getTemporarilyStack(): RouteMatchResult<T>[] {
    return [ ...this.temporarilyStack ]
  }

  public navigateTo(target: string): void {
    this.navToStack(target)
    this.config.historyProvider.navigateTo(target)
  }

  public go(delta: number): void {
    if (delta < 0) {
      const popped = this.historyStack.pop(Math.abs(delta))
      this.temporarilyStack.push(...popped)
    } else {
      const poppedTemporarily = this.temporarilyStack.pop(delta)
      this.historyStack.push(...poppedTemporarily)
    }
    const latest = this.historyStack.getLatest()
    if (latest) {
      this.cacheMatchResult = latest
      this.config.historyProvider.navigateTo(latest.matchResult.getOriginURI())
    }
    this.config.historyProvider.go(delta)
  }

  public registerRoutes(routes: Route[]): void {
    throw new Error('Method not implemented.');
  }

  public unregisterRoutes(routes: Route[]): void {
    throw new Error('Method not implemented.');
  }

  private navToStack(target: string): void {
    if (target === this.currentMatchURI) {
      return
    }
    const { routeMatcherProvider } = this.config
    this.cacheMatchResult = routeMatcherProvider.match(target)
    if (!this.cacheMatchResult) {
      return
    }
    this.historyStack.push(this.cacheMatchResult)
    this.temporarilyStack.clear()
  }

  private changeEventListener(source: string, target: string): void {
    this.navToStack(target)
  }
}