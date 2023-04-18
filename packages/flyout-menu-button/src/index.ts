if (!TM_unsafe_UID || !TM_upsertElement || !TM_AppendCss)
  console.error(
    `required TM_unsafe_UID not found. Be sure to @require https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/tampermonkey/tools/html-injectors-tools/index.cjs in your tampermonkey script before css!`
  );
const flyout_safe_document = globalThis.document;

type TM_Flyout_Menu_Options = {
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
};
const TM_flyout_menu_style_Id = ({
  top,
  right,
  left,
  bottom,
}: TM_Flyout_Menu_Options) =>
  `TM-flyout-${top ? `top-${top}` : ``}-${right ? `right-${right}` : ``}-${
    left ? `left-${left}` : ``
  }-${bottom ? `bottom-${bottom}` : ``}`;

const TM_Flyout_Menu_css = (opts: TM_Flyout_Menu_Options) => `
.${TM_flyout_menu_style_Id(opts)}-main-button {
    position: fixed;
    ${opts.top !== undefined ? `top: ${opts.top};` : ``};
    ${opts.right !== undefined ? `right: ${opts.right};` : ``};
    ${opts.left !== undefined ? `left: ${opts.left};` : ``};
    ${opts.bottom !== undefined ? `bottom: ${opts.bottom};` : ``};
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
    top: 90px;
    right: 30px;
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

type MenuItem = {
  label: string;
  onClick: () => void;
  id: string;
};
// we convert the above function to a class due to the nature of the functionality
//   class will be extremely useful for handling instanciated information like the uid
//   we also want to provide methods to remove/add/modify the menu items
//     and this is much easier to do with a class
/**
 * @param uniqueId - a unique id for the menu
 * @param options - options for the menu
 * @param options.top - the top position of the menu
 * @param options.right - the right position of the menu
 * @param options.left - the left position of the menu
 * @param options.bottom - the bottom position of the menu
 * @example
 * const menu = new TM_Flyout_Menu('my-menu', { top: '10px', right: '10px' });
 * menu.addMenuItem({ label: 'My Label', onClick: () => console.log('clicked') });
 * menu.create();
 * menu.remove();
 *
 */
class TM_Flyout_Menu {
  private uniqueId: string;
  private options: TM_Flyout_Menu_Options;
  private mainButtonClass: string;
  private flyoutMenuClass: string;
  private menuItemClass: string;
  private mainButton: HTMLButtonElement;
  private flyoutMenu: HTMLDivElement;
  private menuItems: MenuItem[];
  didInsert: boolean;
  buttonNode: HTMLButtonElement | null;
  flyoutMenuNode: HTMLDivElement | null;

  constructor(uniqueId: string, options: TM_Flyout_Menu_Options) {
    this.uniqueId = uniqueId;
    this.options = options;
    this.mainButtonClass = `${TM_flyout_menu_style_Id(options)}-main-button`;
    this.flyoutMenuClass = `${TM_flyout_menu_style_Id(options)}-flyout-menu`;
    this.menuItemClass = `${TM_flyout_menu_style_Id(options)}-menu-item`;
    this.mainButton = flyout_safe_document.createElement('button');
    this.flyoutMenu = flyout_safe_document.createElement('div');
    this.menuItems = [];
    this.didInsert = false;
    this.buttonNode = null;
    this.flyoutMenuNode = null;
  }

  private createMenuItems() {
    this.menuItems.forEach((item) => {
      const button = flyout_safe_document.createElement('button');
      button.className = this.menuItemClass;

      button.id = `${this.uniqueId}-menu-item-${item.id}`;
      button.textContent = item.label;
      button.addEventListener('click', () => {
        item.onClick();
      });
      this.flyoutMenu.appendChild(button);
    });
  }

  private createMainButton() {
    this.mainButton.className = this.mainButtonClass;
    this.mainButton.textContent = 'Menu';
    this.mainButton.addEventListener('click', () => {
      this.flyoutMenu.style.display =
        this.flyoutMenu.style.display === 'none' ? 'block' : 'none';
    });
  }

  private createFlyoutMenu() {
    this.flyoutMenu.className = this.flyoutMenuClass;
    this.flyoutMenu.classList.add('flyout-menu');
  }

  public create() {
    this.createMainButton();
    this.createFlyoutMenu();
    this.createMenuItems();
    TM_AppendCss(
      TM_Flyout_Menu_css(this.options),
      TM_flyout_menu_style_Id(this.options)
    );
    const { elem: mainButtonNode, didInsert } = TM_upsertElement(
      this.uniqueId,
      this.mainButton
    );
    this.didInsert = didInsert;
    this.buttonNode = mainButtonNode;

    const { elem: flyoutMenuNode } = TM_upsertElement(
      this.uniqueId,
      this.flyoutMenu
    );
    this.flyoutMenuNode = flyoutMenuNode;
  }

  /* **** methods to add/remove/modify menu items **** */
  // to add a menu item we will:
  //  1 - append the item to the menuItems array
  //  2 - delete the existing flyout menu
  //  3 - create a new flyout menu with the updated menuItems array
  //  4 - upsert the new flyout menu
  public addMenuItem(item: MenuItem) {
    this.menuItems.push(item);
    this.flyoutMenu.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
    const { elem: flyoutMenuNode } = TM_upsertElement(
      this.uniqueId,
      this.flyoutMenu
    );
    this.flyoutMenuNode = flyoutMenuNode;
  }
  // to remove a menu item we will:
  //  1 - find the index of the item in the menuItems array
  //  2 - remove the item from the menuItems array
  //  3 - delete the existing flyout menu
  //  4 - create a new flyout menu with the updated menuItems array
  //  5 - upsert the new flyout menu
  public removeMenuItem(item: MenuItem) {
    const index = this.menuItems.indexOf(item);
    if (index > -1) {
      this.menuItems.splice(index, 1);
    }
    this.flyoutMenu.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
    const { elem: flyoutMenuNode } = TM_upsertElement(
      this.uniqueId,
      this.flyoutMenu
    );
    this.flyoutMenuNode = flyoutMenuNode;
  }

  // to modify a menu item we will:
  //  1 - find the index of the item in the menuItems array
  //  2 - remove the item from the menuItems array
  //  3 - add the new item to the menuItems array
  //  4 - delete the existing flyout menu
  //  5 - create a new flyout menu with the updated menuItems array
  //  6 - upsert the new flyout menu
  public modifyMenuItem(oldItem: MenuItem, newItem: MenuItem) {
    const index = this.menuItems.indexOf(oldItem);
    if (index > -1) {
      this.menuItems.splice(index, 1);
    }
    this.menuItems.push(newItem);
    this.flyoutMenu.remove();
    this.createFlyoutMenu();
    this.createMenuItems();
    const { elem: flyoutMenuNode } = TM_upsertElement(
      this.uniqueId,
      this.flyoutMenu
    );
    this.flyoutMenuNode = flyoutMenuNode;
  }
}
