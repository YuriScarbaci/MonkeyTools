if (!TM_unsafe_UID)
  console.error(
    `required TM_unsafe_UID not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/UI/utils in your tampermonkey script before css!`
  );
if (!TM_upsertElement)
  console.error(
    `required TM_upsertElement not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/UI/utils in your tampermonkey script before css!`
  );

if (!safe_document) var safe_document = globalThis.document;

// Function to add style
// based on https://www.geeksforgeeks.org/how-to-create-a-style-tag-using-javascript/
const TM_AppendCss = (cssString, uniqueId = `TM-css-${TM_unsafe_UID()}`) => {
  /* Create style element */
  const { elem: css } = TM_upsertElement(
    uniqueId,
    safe_document.createElement("style")
  );
  css.type = "text/css";

  if (css.styleSheet) css.styleSheet.cssText = cssString;
  else css.appendChild(document.createTextNode(cssString));

  /* Append style to the head element */
  safe_document.getElementsByTagName("head")[0].appendChild(css);
};
