// https://stackoverflow.com/a/6248722
function TM_unsafe_UID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  const firstPart = (Math.random() * 46656) | 0;
  const secondPart = (Math.random() * 46656) | 0;
  return (
    ('000' + firstPart.toString(36)).slice(-3) +
    ('000' + secondPart.toString(36)).slice(-3)
  );
}

// we define TM_upsertElement with dynamic types because we want to be able to use it with any HTMLElement
const TM_upsertElement = <T extends HTMLElement>(
  uniqueId: string,
  nodeToAdd: T,
  parent = globalThis.document.body
) => {
  let elem = globalThis.document.getElementById(uniqueId);
  const didInsert = !elem;
  if (didInsert) {
    nodeToAdd.id = uniqueId;
    parent.append(nodeToAdd);
    elem = globalThis.document.getElementById(uniqueId);
  }
  // this function is creating the element if it does not exist so we know elem is not null
  // we force the type to be HTMLElement so typescript does not complain
  return { elem, didInsert } as { elem: T; didInsert: boolean };
};

const css_safe_document = globalThis.document;

// Function to add style
// based on https://www.geeksforgeeks.org/how-to-create-a-style-tag-using-javascript/
const TM_AppendCss = (
  cssString: string,
  uniqueId = `TM-css-${TM_unsafe_UID()}`
) => {
  /* Create style element */
  const { elem: css } = TM_upsertElement(
    uniqueId,
    css_safe_document.createElement('style')
  );
  css.type = 'text/css';

  // we don't support IE so we avoid the IE specific code
  css.appendChild(document.createTextNode(cssString));

  /* Append style to the head element */
  css_safe_document.getElementsByTagName('head')[0].appendChild(css);
};
