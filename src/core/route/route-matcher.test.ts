import { assert, describe, test } from 'vitest'
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
    const routeMatcher = new RouteMatcher(routes, [{ path: '/base'}])
    const underTest = routeMatcher.match('/base/a')
    assert.equal(underTest?.parent?.path, '/base')
    assert.equal(underTest?.route.path, routes[0].path)
  })
  test('match uri & match children route', () => {
    const routes: Route[] = [
      {
        path: '/a'
      },
      {
        path: '/b',
        children: [
          {
            path: '/b.1',
            children: [
              {
                path: '/b.1.1'
              }
            ]
          }
        ]
      },
    ]
    const routeMatcher = new RouteMatcher(routes, [{ path: '/base' }])
    const underTest = routeMatcher.match('/base/b/b.1/b.1.1')
    assert.equal(underTest?.parent?.path, '/b.1')
    assert.equal(underTest?.route.path, routes[1].children?.[0].children?.[0].path)
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