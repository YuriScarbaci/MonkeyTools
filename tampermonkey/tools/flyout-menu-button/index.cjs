"use strict";

// packages/flyout-menu-button/src/index.ts
if (!TM_unsafe_UID || !TM_upsertElement || !TM_AppendCss)
  console.error(
    `required TM_unsafe_UID not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/tampermonkey/tools/html-injectors-tools/index.cjs in your tampermonkey script before css!`
  );
var flyout_safe_document = globalThis.document;
var TM_flyout_menu_style_Id = ({
  top,
  right,
  left,
  bottom
}) => `TM-flyout-${top ? `top-${top}` : ``}-${right ? `right-${right}` : ``}-${left ? `left-${left}` : ``}-${bottom ? `bottom-${bottom}` : ``}`;
var TM_Flyout_Menu_css = (opts) => `
.${TM_flyout_menu_style_Id(opts)}-main-button {
    position: fixed;
    ${opts.top !== void 0 ? `top: ${opts.top};` : ``}
    ${opts.right !== void 0 ? `right: ${opts.right};` : ``}
    ${opts.left !== void 0 ? `left: ${opts.left};` : ``}
    ${opts.bottom !== void 0 ? `bottom: ${opts.bottom};` : ``}
    border: none;
    border-radius: 50%;
    background-color: blue;
    color: white;
    width: 50px;
    height: 50px;
    cursor: pointer;
}
.${TM_flyout_menu_style_Id(opts)}-flyout-menu {
    position: fixed;
    ${opts.top !== void 0 ? `top: ${opts.top};` : ``}
    ${opts.right !== void 0 ? `right: ${opts.right};` : ``}
    ${opts.left !== void 0 ? `left: ${opts.left};` : ``}
    ${opts.bottom !== void 0 ? `bottom: ${opts.bottom};` : ``}
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: none;
    z-index: 1000;
}

.${TM_flyout_menu_style_Id(opts)}-menu-item {
    display: block;
    width: 100px;
    padding: 5px;
    margin: 5px;
    border: none;
    color: black;
    cursor: pointer;
    border-radius: 3px;
}
`;
var TM_Flyout_Menu = class {
  uniqueId;
  options;
  mainButtonClass;
  flyoutMenuClass;
  menuItemClass;
  menuItems;
  didInsert;
  buttonNode;
  flyoutMenuNode;
  constructor(uniqueId, options) {
    this.uniqueId = TM_flyout_menu_style_Id(options) + "-" + uniqueId;
    this.options = options;
    this.mainButtonClass = `${TM_flyout_menu_style_Id(options)}-main-button`;
    this.flyoutMenuClass = `${TM_flyout_menu_style_Id(options)}-flyout-menu`;
    this.menuItemClass = `${TM_flyout_menu_style_Id(options)}-menu-item`;
    this.menuItems = [];
    this.didInsert = false;
    this.buttonNode = null;
    this.flyoutMenuNode = null;
  }
  // for each menuItems in the instance
  //  create a new button
  //  assign the class to the button
  //  append the button to the flyout menu (// it's the flyout menu node that will be appended to the document)
  createMenuItems() {
    this.menuItems.forEach((item) => {
      const button = flyout_safe_document.createElement("button");
      button.className = this.menuItemClass;
      button.id = `${this.uniqueId}-menu-item-${item.id}`;
      button.textContent = item.label;
      button.addEventListener("click", () => {
        item.onClick();
      });
      if (this.flyoutMenuNode)
        this.flyoutMenuNode.appendChild(button);
    });
  }
  // create a new button
  //  assign the class to the button
  //  upsert the document with the button including the event listener
  createMainButton() {
    const newMainButton = flyout_safe_document.createElement("button");
    newMainButton.className = this.mainButtonClass;
    newMainButton.textContent = "Menu";
    newMainButton.addEventListener("click", () => {
      if (this.flyoutMenuNode)
        this.flyoutMenuNode.style.display = this.flyoutMenuNode.style.display === "none" ? "block" : "none";
    });
    const { elem: mainButtonNode, didInsert } = TM_upsertElement(
      this.uniqueId + "button",
      newMainButton
    );
    this.buttonNode = mainButtonNode;
    this.didInsert = didInsert;
  }
  // create a new div
  //  assign the class to the div
  //  upsert the document with the div
  createFlyoutMenu() {
    const newFlyoutMenu = flyout_safe_document.createElement("div");
    newFlyoutMenu.className = this.flyoutMenuClass;
    const { elem: flyoutMenuNode } = TM_upsertElement(
      this.uniqueId + "flyout-menu",
      newFlyoutMenu
    );
    this.flyoutMenuNode = flyoutMenuNode;
  }
  create() {
    TM_AppendCss(
      TM_Flyout_Menu_css(this.options),
      TM_flyout_menu_style_Id(this.options)
    );
    this.createFlyoutMenu();
    this.createMenuItems();
    this.createMainButton();
  }
  /* **** methods to add/remove/modify menu items **** */
  // to add a menu item we will:
  //  1 - append the item to the menuItems array
  //  2 - delete the existing flyout menu
  //  3 - create a new flyout menu with the updated menuItems array
  //  4 - upsert the new flyout menu
  addMenuItem(item) {
    this.menuItems.push(item);
    if (this.flyoutMenuNode)
      this.flyoutMenuNode.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
  }
  // to remove a menu item we will:
  //  1 - find the index of the item in the menuItems array
  //  2 - remove the item from the menuItems array
  //  3 - delete the existing flyout menu
  //  4 - create a new flyout menu with the updated menuItems array
  //  5 - upsert the new flyout menu
  removeMenuItem(item) {
    const index = this.menuItems.indexOf(item);
    if (index > -1) {
      this.menuItems.splice(index, 1);
    }
    if (this.flyoutMenuNode)
      this.flyoutMenuNode.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
  }
  // to modify a menu item we will:
  //  1 - find the index of the item in the menuItems array
  //  2 - remove the item from the menuItems array
  //  3 - add the new item to the menuItems array
  //  4 - delete the existing flyout menu
  //  5 - create a new flyout menu with the updated menuItems array
  //  6 - upsert the new flyout menu
  modifyMenuItem(oldItem, newItem) {
    const index = this.menuItems.indexOf(oldItem);
    if (index > -1) {
      this.menuItems.splice(index, 1);
    }
    this.menuItems.push(newItem);
    if (this.flyoutMenuNode)
      this.flyoutMenuNode.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
  }
};
