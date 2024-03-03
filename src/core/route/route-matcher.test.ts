import { assert, describe, expect, test } from 'vitest'
import type { Route } from './route'
import { RouteMatcher } from './route-matcher'

describe('route-matcher', () => {
  test('match uri', () => {
    const routes: Route[] = [
      {
        path: '/a'
      }
    ]
    const routeMatcher = new RouteMatcher(routes)
    const underTest = routeMatcher.match('/a')
    assert.equal(underTest?.parent, undefined)
    assert.equal(underTest?.route.path, routes[0].path)
  })
  test('match uri & baseURI', () => {
    const routes: Route[] = [
      {
        path: '/a'
      }
    ]
    const routeMatcher = new RouteMatcher(routes, '/base')
    const underTest = routeMatcher.match('/base/a')
    assert.equal(underTest?.parent, undefined)
    assert.equal(underTest?.route.path, routes[0].path)
  })
  test('match uri & multi route', () => {
    const routes: Route[] = [
      {
        path: '/b'
      },
      {
        path: '/a'
      }
    ]
    const routeMatcher = new RouteMatcher(routes)
    const underTest = routeMatcher.match('/a')
    assert.equal(underTest?.parent, undefined)
    assert.equal(underTest?.route.path, routes[1].path)
  })
  test('match uri & multi route & no match', () => {
    const routes: Route[] = [
      {
        path: '/b'
      },
      {
        path: '/a'
      }
    ]
    const routeMatcher = new RouteMatcher(routes)
    const underTest = routeMatcher.match('/c')
    assert.equal(underTest, null)
  })
  test('match uri & get params', () => {
    const routes: Route[] = [
      {
        path: '/a/:par1'
      }
    ]
    const routeMatcher = new RouteMatcher(routes)
    const underTest = routeMatcher.match('/a/par1value?q1=q1value&q2=q2value')
    assert.equal(underTest?.parent, undefined)
    assert.equal(underTest?.matchResult.getPathParams().par1, 'par1value')
    assert.equal(underTest?.matchResult.getQueryParams().q1, 'q1value')
    assert.equal(underTest?.matchResult.getQueryParams().q2, 'q2value')
  })
});