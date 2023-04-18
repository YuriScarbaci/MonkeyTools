"use strict";

// packages/html-injectors-tools/src/index.ts
function TM_unsafe_UID() {
  const firstPart = Math.random() * 46656 | 0;
  const secondPart = Math.random() * 46656 | 0;
  return ("000" + firstPart.toString(36)).slice(-3) + ("000" + secondPart.toString(36)).slice(-3);
}
var TM_upsertElement = (uniqueId, nodeToAdd, parent = globalThis.document.body) => {
  let elem = globalThis.document.getElementById(uniqueId);
  const didInsert = !elem;
  if (didInsert) {
    nodeToAdd.id = uniqueId;
    parent.append(nodeToAdd);
    elem = globalThis.document.getElementById(uniqueId);
  }
  return { elem, didInsert };
};
var css_safe_document = globalThis.document;
var TM_AppendCss = (cssString, uniqueId = `TM-css-${TM_unsafe_UID()}`) => {
  const { elem: css } = TM_upsertElement(
    uniqueId,
    css_safe_document.createElement("style")
  );
  css.type = "text/css";
  css.appendChild(document.createTextNode(cssString));
  css_safe_document.getElementsByTagName("head")[0].appendChild(css);
};
