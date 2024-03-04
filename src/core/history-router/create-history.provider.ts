import { type HistoryProvider } from './history-router'

type CreateHistoryProviderConfig = HistoryProvider

export function createHistoryProvider(config: CreateHistoryProviderConfig): HistoryProvider {
  return {
    ...config
  }
}