"use strict";

/**
   This rule is mostly similar to eslint-plugin-react/jsx-closing-tag-location. Differences:

   1. It skips JSX elements that have a single expression as a child, like in this example:

   <SomeNode>{ item =>
     <span></span>
   }</SomeNode>

   or:

   <SomeNode>{
     condition &&
     <span></span>
   }</SomeNode>

   2. It allows a closing React.Fragment tag to be indented to the left of the opening tag,
   because React.Fragment is essentialy just another type of the brace. Example:

   itemRenderer: ({item}) => <React.Fragment>
     <span></span>

   </React.Fragment>

 */

const astUtil = require("eslint-plugin-react/lib/util/ast");

module.exports = {
  meta: {
    docs: {
      description: "Validate closing tag location for multiline JSX",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "whitespace",
    messages: {
      onOwnLine: "Closing tag of a multiline JSX expression must be on its own line.",
      matchIndent: "Expected closing tag to match indentation of opening.",
    },
  },

  create(context) {
    function handleClosingElement(node) {
      if (!node.parent) {
        return;
      }

      const opening = node.parent.openingElement || node.parent.openingFragment;
      if (opening.loc.start.line === node.loc.start.line) {
        return;
      }

      if (opening.loc.start.column === node.loc.start.column) {
        return;
      }

      // <Elem>{ ... }<Elem>
      if (node.parent.children.length == 1 &&
          node.parent.children[0].type === "JSXExpressionContainer") {
        return;
      }

      if (node.name &&
          node.name.type === "JSXMemberExpression" &&
          node.name.object.type === "JSXIdentifier" &&
          node.name.object.name === "React" &&
          node.name.property.type === "JSXIdentifier" &&
          node.name.property.name === "Fragment") {
        return;
      }

      if (!node.name &&
          node.parent.type === "JSXFragment") {
        return;
      }

      const messageId = astUtil.isNodeFirstInLine(context, node)
        ? "matchIndent"
        : "onOwnLine";
      context.report({
        node,
        messageId,
        loc: node.loc,
        fix(fixer) {
          const indent = Array(opening.loc.start.column + 1).join(" ");
          if (astUtil.isNodeFirstInLine(context, node)) {
            return fixer.replaceTextRange(
              [node.range[0] - node.loc.start.column, node.range[0]],
              indent
            );
          }

          return fixer.insertTextBefore(node, `\n${indent}`);
        },
      });
    }

    return {
      JSXClosingElement: handleClosingElement,
      JSXClosingFragment: handleClosingElement,
    };
  },
};
