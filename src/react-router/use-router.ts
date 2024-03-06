import { useContext } from 'react'
import type { WebHistoryRouter } from './web-history-router'
import { logger } from '@ghcloud/cube-mf-root/log'
import { RouterContext } from './router-provider'

export function useRouter (): WebHistoryRouter {
  const router = useContext(RouterContext)
  if (!router) {
    logger.error('Router context has not been initialized yet! please use `RouterProvider` initialization.')
    throw new Error('Router context has not been initialized yet! please use `RouterProvider` initialization.')
  }
  return router
}
