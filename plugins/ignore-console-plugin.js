// babel 版的工具库，提供了很多 AST 的 Node 节点相关的工具函数
const types = require("@babel/types");

const map = new Map();
map.set("console", "log");

module.exports = function declare() {
  return {
    name: "ignore-console-log",
    visitor: {
      ExpressionStatement(path) {
        const expression = path.node.expression;
        if (types.isCallExpression(expression)) {
          const callee = expression.callee;
          if (types.isMemberExpression(callee)) {
            // 获取到 console
            const objectName = callee.object.name;
            // 获取到 log
            const propertyName = callee.property.name;
            // 规则命中
            if (map.get(objectName) === propertyName) {
              // 移除
              path.remove();
            }
          }
        }
      },
    },
  };
};
