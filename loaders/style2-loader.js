const { getOptions, stringifyRequest } = require('loader-utils')

function loader(source) {
  let script = `
    let style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
  `
  return script
}

loader.pitch = (remainingRequest, previousRequest, data) => {
  let script = `
    let style = document.createElement('style');
    style.innerHTML = require(${stringifyRequest(
      this,
      '!!' + remainingRequest
    )})
    document.head.appendChild(style)
  `
  return script
}

module.exports = loader
