function _bem(
  prefixName: string,
  blockSuffix?: string,
  element?: string,
  modifier?: string,
) {
  if (blockSuffix) {
    prefixName += `-${blockSuffix}`
  }
  if (element) {
    prefixName += `__${element}`
  }
  if (modifier) {
    prefixName += `--${modifier}`
  }
  return prefixName
}

function createBEM(prefixName: string) {
  const b = (blockSuffix = '') => _bem(prefixName, blockSuffix)
  const e = (element = '') => element && _bem(prefixName, '', element)
  const m = (modifier = '') => modifier && _bem(prefixName, '', '', modifier)
  const be = (blockSuffix = '', element = '') =>
    blockSuffix && element && _bem(prefixName, blockSuffix, element)
  const bm = (blockSuffix = '', modifier = '') =>
    blockSuffix && modifier && _bem(prefixName, blockSuffix, '', modifier)
  const em = (element = '', modifier = '') =>
    element && modifier && _bem(prefixName, '', element, modifier)
  const bem = (blockSuffix = '', element = '', modifier = '') =>
    blockSuffix &&
    element &&
    modifier &&
    _bem(prefixName, blockSuffix, element, modifier)
  const is = (name: string, state = true) => (state ? `is-${name}` : '')
  return {
    b,
    e,
    m,
    be,
    bm,
    em,
    bem,
    is,
  }
}

export function createNamespace(name: string, prefix = 'el') {
  const prefixName = `${prefix}-${name}`
  return createBEM(prefixName)
}

// 测试
const bem = createNamespace('button')
// z-button
// z-button-box
// z-button__element
// z-button--disabled
console.log(bem.b())
console.log(bem.b('box'))
console.log(bem.e('element'))
console.log(bem.m('disabled'))
console.log(bem.is('checked'))
console.log(bem.bem('box', 'element', 'disabled'))
