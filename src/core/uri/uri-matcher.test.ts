import { URIMatcher } from './uri-matcher'
import { assert, describe, test } from 'vitest'

describe('uri-matcher', () => {
  test('match normal uri', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2/2?par3=3&par4=4'
    const underTest = new URIMatcher(pathConfig)
    assert.equal(underTest.test(targetURI), true)
    assert.equal(underTest.test(targetURI), true)
  })
  test('match normal uri & baseURI', () => {
    const pathConfig = '/path'
    const targetURI = '/base/path1/path2'
    const underTest = new URIMatcher('/base', pathConfig)
    assert.equal(underTest.test(targetURI), true)
    assert.equal(underTest.test(targetURI), true)
  })
  test('not match uri', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2'
    const underTest = new URIMatcher(pathConfig)
    assert.equal(underTest.test(targetURI), false)
  })
  test('get path params', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2/2?par3=3&par4=4'
    const underTest = new URIMatcher(pathConfig).match(targetURI).getPathParams()
    assert.equal(underTest['par1'], '1')
    assert.equal(underTest['par2'], '2')
  })
  test('get path params safety', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2/2?par3=3&par4=4'
    const uriMatchResult = new URIMatcher(pathConfig).match(targetURI)
    const underTest = uriMatchResult.getPathParams()
    assert.equal(underTest['par1'], '1')
    underTest.par1 = '2'
    assert.equal(uriMatchResult.getPathParams()['par1'], '1')
  })
  test('get query params', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2/2?par3=3&par4=4'
    const underTest = new URIMatcher(pathConfig).match(targetURI).getQueryParams()
    assert.equal(underTest['par3'], '3')
    assert.equal(underTest['par4'], '4')
  })
  test('get query params safety', () => {
    const pathConfig = '/path/:par1/path2/:par2'
    const targetURI = '/path/1/path2/2?par3=3&par4=4'
    const uriMatchResult = new URIMatcher(pathConfig).match(targetURI)
    const underTest = uriMatchResult.getQueryParams()
    assert.equal(underTest['par3'], '3')
    underTest.par3 = '100'
    assert.equal(uriMatchResult.getQueryParams()['par3'], '3')
  })
})

