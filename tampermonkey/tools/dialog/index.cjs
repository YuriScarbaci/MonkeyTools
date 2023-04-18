"use strict";

// packages/dialog/src/index.ts
if (!TM_unsafe_UID || !TM_upsertElement || !TM_AppendCss)
  console.error(
    `required TM_unsafe_UID not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/tampermonkey/tools/html-injectors-tools/index.cjs in your tampermonkey script before css!`
  );
var dialog_safe_document = globalThis.document;
var TM_modal_style_Id = `TM-css-modal-${TM_unsafe_UID()}`;
var TM_modal_fader_Id = `TM-css-modal-fader-${TM_unsafe_UID()}`;
var TM_modal_css = `.${TM_modal_style_Id}-modal-fader {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 99998;
  background: rgba(0,0,0,0.8);
}
.${TM_modal_style_Id}-modal-fader.active {
  display: block;
}
.${TM_modal_style_Id}-modal-window {
  display: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  font-family: sans-serif;
  top: 50px;
  color:black;
  background:white;
}
.${TM_modal_style_Id}-modal-window.active {
  display: block;
}
.${TM_modal_style_Id}-modal-window h1,
.${TM_modal_style_Id}-modal-window h2,
.${TM_modal_style_Id}-modal-window h3,
.${TM_modal_style_Id}-modal-window h4,
.${TM_modal_style_Id}-modal-window h5,
.${TM_modal_style_Id}-modal-window h6 {
  margin: 0;
}
.${TM_modal_style_Id}-modal-btn {
  background: #36a5a5;
  border: none;
  color: #fff;
  padding: 10px 15px;
  box-shadow: none;
  border-radius: 3px;
  text-decoration: none;
}`;
var TM_createModal = (uniqueId, htmlString) => {
  TM_AppendCss(TM_modal_css, TM_modal_style_Id);
  const newModalFader = dialog_safe_document.createElement("div");
  newModalFader.className = `${TM_modal_style_Id}-modal-fader`;
  const { elem: modalFader } = TM_upsertElement(
    TM_modal_fader_Id,
    newModalFader
  );
  const modalClass = `${TM_modal_style_Id}-modal-window`;
  const newModal = dialog_safe_document.createElement("div");
  newModal.className = modalClass;
  newModal.innerHTML = `${htmlString}
<button class="modal-btn tm-modal-hide">Close</button>`;
  const { elem: modalNode, didInsert } = TM_upsertElement(uniqueId, newModal);
  const closeModal = () => {
    const modalWindows = dialog_safe_document.querySelectorAll(
      `.${modalClass}`
    );
    if (modalFader.className.indexOf("active") !== -1)
      modalFader.className = modalFader.className.replace("active", "");
    modalWindows.forEach(function(modalWindow) {
      if (modalWindow.className.indexOf("active") !== -1)
        modalWindow.className = modalWindow.className.replace("active", "");
    });
  };
  const openModal = () => {
    modalFader.className += " active";
    newModal.className += " active";
  };
  if (didInsert) {
    const closeButton = modalNode.querySelector(
      ".tm-modal-hide"
    );
    closeButton.addEventListener("click", closeModal);
  }
  return { modalNode, closeModal, openModal };
};
