export interface URIMatchResult {
  getPathParams(): Record<string, string>;
  getQueryParams(): Record<string, string>;
}

export class URIMatcher {
  public constructor(private readonly pathConfig: string) {
  }

  public test(targetURI: string): boolean {
    const reg = analysisPathConfigToRegExp(this.pathConfig, true)
    return reg.test(targetURI)
  }

  public match(targetURI: string): URIMatchResult {
    if (!this.test(targetURI)) {
      throw new Error('URI not match')
    }
    return new URIMatchResultImpl(this.pathConfig, targetURI)
  }
}

function analysisURIPathParams(pathConfig: string, targetURI: string): Record<string, string> {
  const reg = analysisPathConfigToRegExp(pathConfig, true)
  return {
    ...targetURI.match(reg)?.groups
  }
}

function analysisPathConfigToRegExp(path: string, absoluteMatch = false): RegExp {
  return new RegExp(`^${ path }/?${ absoluteMatch ? '$' : '' }`.replace(/\/:([^\\/]+)/g, (match) => {
    return `\\/(?<${ match.slice(2) }>[^\\/]+)`
  }))
}

function analysisURIQueryParams(queryString: string): Record<string, string> {
  const searchParams = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  for (const [ key, value ] of searchParams) {
    result[key] = value
  }
  return result
}

class URIMatchResultImpl implements URIMatchResult {
  private readonly pathParams: Record<string, string> = {}
  private readonly queryParams: Record<string, string> = {}

  public constructor(pathConfig: string, targetURI: string) {
    const [ pathname, queryString ] = targetURI.split('?')
    this.pathParams = analysisURIPathParams(pathConfig, pathname)
    this.queryParams = analysisURIQueryParams(queryString)
  }

  public getPathParams(): Record<string, string> {
    return {
      ...this.pathParams
    }
  }

  public getQueryParams(): Record<string, string> {
    return {
      ...this.queryParams
    }
  }
}
