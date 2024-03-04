export interface URIMatchResult {
  getOriginURI(): string;
  getPathParams(): Record<string, string>;
  getQueryParams(): Record<string, string>;
}

export class URIMatcher {

  public constructor(private readonly pathConfig: string, private readonly baseURI: string = '') {
  }

  private get path(): string {
    return join([ this.baseURI, this.pathConfig ])
  }

  public test(targetURI: string, exact = false): boolean {
    const reg = analysisPathConfigToRegExp(this.path, exact)
    return reg.test(targetURI)
  }

  public match(targetURI: string): URIMatchResult {
    if (!this.test(targetURI)) {
      throw new Error('URI not match')
    }
    return new URIMatchResultImpl(this.path, targetURI)
  }
}

function analysisURIPathParams(pathConfig: string, targetURI: string): Record<string, string> {
  const reg = analysisPathConfigToRegExp(pathConfig, true)
  return {
    ...targetURI.match(reg)?.groups
  }
}

function analysisPathConfigToRegExp(path: string, exactMatch = false): RegExp {
  return new RegExp(`^${ path }/?${ exactMatch ? '$' : '' }`.replace(/\/:([^\\/]+)/g, (match) => {
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

  public constructor(pathConfig: string, private readonly targetURI: string) {
    const [ pathname, queryString ] = targetURI.split('?')
    this.pathParams = analysisURIPathParams(pathConfig, pathname)
    this.queryParams = analysisURIQueryParams(queryString)
  }

  public getOriginURI(): string {
    return this.targetURI
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

/**
 * 拼接多段路径
 * @param args 拼接的路径段
 * @param separator 分隔符，默认 '/'
 * @returns 拼接后的路径
 * ```typescript
 * join(['/a', 'b/', '/c']) => '/a/b/c'
 * ```
 */
export function join(args: string[], separator = '/'): string {
  return args.join(separator).replace(new RegExp(`${separator}+`, 'g'), separator)
}