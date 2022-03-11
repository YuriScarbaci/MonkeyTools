if (!TM_unsafe_UID)
  console.error(
    `required TM_unsafe_UID not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/UI/utils in your tampermonkey script before css!`
  );
if (!TM_upsertElement)
  console.error(
    `required TM_upsertElement not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/UI/utils in your tampermonkey script before css!`
  );
if (!TM_AppendCss)
  console.error(
    `required TM_AppendCss not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/UI/css in your tampermonkey script before css!`
  );

const TM_modal_style_Id = `TM-css-modal-${TM_unsafe_UID()}`;
const TM_modal_fader_Id = `TM-css-modal-fader-${TM_unsafe_UID()}`;
// based on https://dev-bay.com/how-to-create-modal-window-in-pure-javascript/
const TM_modal_css = `.modal-fader {
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
.modal-fader.active {
  display: block;
}
.modal-window {
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
}
.modal-window.active {
  display: block;
}
.modal-window h1,
.modal-window h2,
.modal-window h3,
.modal-window h4,
.modal-window h5,
.modal-window h6 {
  margin: 0;
}
.modal-btn {
  background: #36a5a5;
  border: none;
  color: #fff;
  padding: 10px 15px;
  box-shadow: none;
  border-radius: 3px;
  text-decoration: none;
}`;
/*

<div id="modal-1" class="modal-window">
    <h2>Modal window 1</h2>
    <p>Proin rhoncus metus felis, ut tempor metus eleifend a. </p>
    <p>Nam porta, quam ut elementum sollicitudin, augue nibh ornare turpis.</p>
    <button class="modal-btn modal-hide">Close</button>
</div>
*/
const safe_document = globalThis.document;
const TM_createModal = (uniqueId, htmlString) => {
  // append styling if it was not already appended, if it was, it does nothing
  TM_AppendCss(TM_modal_css, TM_modal_style_Id);
  // append modal-fader element for the overlay
  const newModalFader = safe_document.createElement("div");
  newModalFader.className = "modal-fader";
  const { elem: modalFader } = TM_upsertElement(
    TM_modal_fader_Id,
    newModalFader
  );

  const newModal = safe_document.createElement("div");
  newModal.className = "modal-window";
  // we add the close button to the modal always
  newModal.innerHTML = `${htmlString}\n<button class="modal-btn tm-modal-hide">Close</button>`;
  //
  const { elem: modalNode, didInsert } = TM_upsertElement(uniqueId, newModal);
  const closeModal = () => {
    const modalWindows = safe_document.querySelectorAll(".modal-window");
    if (modalFader.className.indexOf("active") !== -1)
      modalFader.className = modalFader.className.replace("active", "");

    modalWindows.forEach(function (modalWindow) {
      if (modalWindow.className.indexOf("active") !== -1)
        modalWindow.className = modalWindow.className.replace("active", "");
    });
  };
  const openModal = () => {
    modalFader.className += " active";
    newModal.className += " active";
  };
  debugger;
  if (didInsert) {
    const closeButton = modalNode.querySelector(".tm-modal-hide");
    closeButton.addEventListener("click", closeModal);
  }
  return { modalNode, closeModal, openModal };
};
