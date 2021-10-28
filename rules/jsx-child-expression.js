"use strict";

/**
   This rule enforces code style for JSX elements that have a single child expression.

   Three styles are allowed:

   <SomeNode>{
     expression
   }</SomeNode>

   <SomeNode>
     {
     }
   </SomeNode>

   <SomeNode>
     { expression }
   </SomeNode>
*/

const astUtil = require("eslint-plugin-react/lib/util/ast");

module.exports = {
  meta: {
    docs: {
      description: "Validate JSX elements with a single child expression",
      category: "Stylistic Issues",
      recommended: false,
    },
    messages: {
      openBraceOnOwnLine: "Opening brace must be on its own line",
      closeBraceOnOwnLine: "Closing brace must be on its own line",
      closeBraceAligned: "Closing brace must be aligned to an opening brace",
    },
  },

  create(context) {
    function handleElement(node) {
      // skip self-closing tags
      if (node.closingElement == null && node.children.length === 0) {
        return;
      }

      const opening = node.openingElement;
      const closing = node.closingElement;

      // ignore single-line elements
      if (opening.loc.start.line === closing.loc.start.line) {
        return;
      }

      // no whitespace between tags and expression brackets - this style is acceptable, return immediately
      if (node.children.length === 1 &&
          node.children[0].type === "JSXExpressionContainer") {
        return;
      }

      if (node.children.length === 2 &&
          node.children[0].type === "JSXExpressionContainer" &&
          node.children[1].type === "JSXText"
         ) {
        const expr = node.children[0];
        context.report({ node: expr, messageId: "openBraceOnOwnLine", loc: expr.loc });
      }

      if (node.children.length === 2 &&
          node.children[0].type === "JSXText" &&
          node.children[1].type === "JSXExpressionContainer"
         ) {
        const expr = node.children[1];
        context.report({ node: expr, messageId: "closeBraceOnOwnLine", loc: expr.loc.end });
      }

      if (node.children.length === 3 &&
          node.children[0].type === "JSXText" &&
          node.children[1].type === "JSXExpressionContainer" &&
          node.children[2].type === "JSXText") {
        const expr = node.children[1];
        if (expr.loc.start.line === expr.loc.end.line) {
          return;
        }
        if (expr.loc.start.column !== expr.loc.end.column - 1) {
          context.report({ node: expr, messageId: "closeBraceAligned", loc: expr.loc.end });
          return;
        }
        if (expr.loc.start.line === expr.expression.loc.start.line) {
          context.report({ node: expr, messageId: "openBraceOnOwnLine", loc: expr.loc.start });
          return;
        }
      }
    }

    return {
      JSXElement: handleElement,
    };
  },
};
