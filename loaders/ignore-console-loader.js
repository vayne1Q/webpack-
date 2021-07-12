const reg = /(console.log\()(.*)(\))/g

module.exports = function (sourceCode) {
 return sourceCode.replace(reg, '')
}
