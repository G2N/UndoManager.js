/*jslint browser: true*/
/* exported UndoManager */

/**
 * A simple javascript undo manager
 * 
 * [TODO] Take care of the context (right click) menu's undo entry <(°_°)>
 * 
 * @param   {Object} element A DOM Element to watch for
 * @returns {Object} Public methods
 */
function UndoManager(element) {
	'use strict';
	
	var Z_KEY = 90,
		Y_KEY = 89,
		MAX_ENTRIES = 100,
		// Config object for the MutationObserver
		OBSERVER_CFG = { 
			attributes: true, 
			childList: true, 
			characterData: true, 
			subtree: true  
		},
		self = this;
	
	this.observer = new MutationObserver(_pushState);
	this.history = [];
	this.index = -1;
	this.element = element;
	
	_pushState();
	
	// Watch for DOM Mutations
	this.observer.observe(this.element, OBSERVER_CFG);
	
	// Watch for Keyboard input
	this.element.addEventListener('keyup', function(event) {
		if(event.altKey || !event.ctrlKey) {
			return;
		}
		
		var isUndo = event.keyCode === Z_KEY && !event.shiftKey,
			isRedo = (event.keyCode === Z_KEY && event.shiftKey) || event.keyCode === Y_KEY;
		
		if(isUndo) {
			event.preventDefault();
			_undo();
		}
		else if(isRedo) {
			event.preventDefault();
			_redo();
		}
	});
	
	/**
	 * Goes backwards...
	 */
	function _undo() {
		self.observer.disconnect();
		if(self.index > 0) {
			self.index --;
			_updateElement();
		}
  		self.observer.observe(self.element, OBSERVER_CFG);
	}
	
	/**
	 * Goes forward
	 */
	function _redo() {
		self.observer.disconnect();
		if(self.index < self.history.length - 1) {
			self.index ++;
			_updateElement();
		}
		self.observer.observe(self.element, OBSERVER_CFG);
	}
	
	/**
	 * Pushes a state at the end of the history
	 * 
	 * [FIXME] I'm not entirely happy with the mechanic involved in preventing storage of single character modifications
	 * Maybe this part could rely on document.execCommand('undo') ?
	 * 
	 * @param {Array} mutations The mutations passed by observer.observe
	 */
	function _pushState(mutations) {
		// If there is only one mutation with a type of 'characterData', the user is simply inserting one caracter (not a space)
		// So do nothing
		if(mutations && mutations.length === 1 && mutations[0].type == 'characterData') {
			return;
		}
		
		// If we did some undoing, we need to destroy the redo history
		if(self.index < self.history.length - 2) {
			self.history = self.history.splice(self.index);
		}
		if(self.history.length > MAX_ENTRIES) {
			self.history.shift();
		}
		
		var doc = self.element.ownerDocument,
			sel = doc.getSelection(),
			range,
			cursorEl,
			state;
		
		// Stop observing before modifyng the DOM
		self.observer.disconnect();
		
		// If we'got a selection, wrap it in a span so that we can restore it
		if(sel.type !== 'None') {
			// Create a wrapper
			cursorEl = document.createElement('span');
			cursorEl.className = '_um_undo';
			
			// Get the range and surround it
			range = sel.getRangeAt(0);
			range.surroundContents(cursorEl);
		}
		
		// Set the state's HTML
		state = self.element.innerHTML;
		
		// If we created a wrapper for the selection, we need to unwrap it
		if(cursorEl) {
			cursorEl.outerHTML = cursorEl.innerHTML;
		}
		
		// Start obsreving again
		self.observer.observe(self.element, OBSERVER_CFG);
		self.history.push(state);
		// Automatically put the index at the end
		self.index = self.history.length - 1;
	}
	
	/**
	 * Update the element's innerHTML with the current history index
	 */
	function _updateElement() {
		// Stop observing before editing the DOM
		self.observer.disconnect();
		var doc = self.element.ownerDocument,
			sel = doc.getSelection(),
			range = doc.createRange(),
			cursorEl;
		
		self.element.innerHTML = self.history[self.index];
		
		// Check if we got a wrapper for the selection
		cursorEl = self.element.getElementsByClassName('_um_undo')[0];
		if(cursorEl) {
			// Destroy the current selection
			sel.removeAllRanges();
			// Select the wrapper
			range.selectNodeContents(cursorEl);
			sel.addRange(range);
			// Now we need to remove it
			cursorEl.outerHTML = cursorEl.innerHTML;
		}
		
		// Start observing again
		self.observer.observe(self.element, OBSERVER_CFG);
	}
	
	// Public methods
	return {
		undo: _undo,
		redo: _redo
	};
}