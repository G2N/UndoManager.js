# UndoManager.js

UndoManager.js is a simple (and lazy) undo / redo manager that can be used with your custom wysiwyg.
The code is library agnostic and should work in modern browsers (see below).

**WARNING:** This has not yet been carefully tested in prodution and may be a bit buggy.

## Features

* Uses [MutationObserver](https://developer.mozilla.org/fr/docs/Web/API/MutationObserver) to watch for modifications
* Auto updates your element
* Listens for CTRL+Z, CTRL+SHIFT+Z and CTRL+Y
* Exposes public methods to hook on your buttons

** TODO **

* Save the cursor position on push and restore it on update
* Hook on the context menu's undo function too
* Rework the mechanic preventing storage of single character modifications

## Browser support

Modern browsers that support [MutationObserver](https://developer.mozilla.org/fr/docs/Web/API/MutationObserver) and
[addEventListener](https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener) should be good.
This means IE11+, FF14+, Chrome 27+, Safari 6.1+, Opera 15+, Safari on iOS 7+ and Android 4.4+.

Again, this has not yet been tested thoroughly tested. Will do it before the next commits and maybe add support for more browsers

## Usage

Initialize it on any DOM element:
	var editable = document.getElementById('editable'),
		undo = new UndoManager(editable);
	
	// Manual calls
	undo.undo();
	undo.redo();
