# MonkeyTools
Tamper-monkey oriented utilities for enhancing web-pages

## Utils
Some generic javascript utilities that I usually find my self needing in my scripts
### TM_unsafe_UID
An utility that creates a 6 character alphanumeric string. It's unsafe since the method is based on `Math.Random` but should be more than enough for TamperMonkey scripts

example usage:
```
const uid = TM_unsafe_UID();
```
### TM_upsertElement
An utility that based on an id as a unique identifier will either get the existing DOM node or append it to (optionally) any parent (defaults to body)

example usage:
```
const { elem: DOMNode, didInsert } = TM_upsertElement('uniqueId', document.createElement("div"));
```
## CSS
Some generic javascript utilities that have to do with css styling
### TM_AppendCss
Basically a smarter `TM_upsertElement` that appends to the `<head>` of the document if the style doesn't exist already (checked via #id selector)

example usage:
```
TM_AppendCss(`body{
    background:cyan;
}`, 'MyScriptStyle');
```
## Components

### Modal 
A basic utility to open a pre-styled modal

can be used as `const { modalNode, closeModal, openModal } = TM_createModal('uniqueIdentifier','htmlString');`

it will automatically appen all the css styles required in the document `<head>` and a `<div>` in the mody for the overlay

the modal always includes a working close button

## How to use monkey tools?
you really just need to `@require` the file in the correct order in your script and you should be good to go.

example usage:
```
// ==UserScript==
// @name         MonkeyTools - playground
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  showing off how to use YuriScarbaci/MonkeyTools with tamper-monkey
// @author       You
// @match        https://*/*
// @require      https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/tampermonkey/tools/html-injectors-tools/index.cjs
// @require      https://raw.githubusercontent.com/YuriScarbaci/MonkeyTools/main/tampermonkey/tools/dialog/index.cjs
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const {openModal,closeModal} = TM_createModal('hello-modal', `<h2>Hello Modal!</h2><div>Life is better when you know javascript!</div>`)
    openModal();
    setTimeout(closeModal,3000);
})();
```
