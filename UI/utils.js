// https://stackoverflow.com/a/6248722
function TM_unsafe_UID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function TM_upsertElement(
  uniqueId,
  nodeToAdd,
  parent = globalThis.document.body
) {
  let elem = globalThis.document.getElementById(uniqueId);
  const didInsert = !Boolean(elem);
  if (didInsert) {
    nodeToAdd.id = uniqueId;
    parent.append(nodeToAdd);
    elem = globalThis.document.getElementById(uniqueId);
  }
  return { elem, didInsert };
}

// tamper-monkey based way to expose functions across scripts via globalThis
if (globalThis) {
  if (!globalThis.TMTools) globalThis.TMTools = {};
  if (!globalThis.TMTools.utils) globalThis.TMTools.utils = {};
  globalThis.TMTools.utils.TM_unsafe_UID = TM_unsafe_UID;
  globalThis.TMTools.utils.TM_upsertElement = TM_upsertElement;
}
