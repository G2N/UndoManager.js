/*jslint browser: true*/
/* exported UndoManager */

/**
 * A simple javascript undo manager
 * 
 * [TODO] This definitely needs a max length or it could pile up quiclkly
 * [TODO] Take care of the context (right click) menu's undo entry <(°_°)>
 * 
 * @param   {Object} element A DOM Element to watch for
 * @returns {Object} Public methods
 */
function UndoManager(element) {
	'use strict';
	
	var Z_KEY = 90,
		Y_KEY = 89,
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
	this.element.addEventListener('keydown', function(event) {
		
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
		if(self.index > 0) {
			self.index --;
			_updateElement();
		}
	}
	
	/**
	 * Goes forward
	 */
	function _redo() {
		if(self.index < self.history.length - 1) {
			self.index ++;
			_updateElement();
		}
	}
	
	/**
	 * Pushes a state at the end of the history
	 * 
	 * [TODO] I need to save the cursors' position inside the DOM so that it doesn't move erratically...
	 * I guess this means storing the element itself, not the innerHTML and creating some childnode here.
	 * 
	 * [FIXME] I'm not entirely happy with the mechanic involved in preventing storage of single character modifications
	 * Maybe this part could rely on document.execCommand('undo') ?
	 * 
	 * @param {Array} mutations The mutations passed by observer.observe
	 */
	function _pushState(mutations) {
		// If there is only one mutation with a type of 'characterData', the user is simply inserting one caracter (not a space)
		// So do nothing
		if(mutations && mutations.length === 1 && mutations[0].type === 'characterData') {
			return;
		}
		
		// Do not listen to changes on contenteditable
		for(var i in mutations) {
			if(mutations[i].type === 'attributes' && mutations[i].attributeName === 'contenteditable') {
				return;
			}
		}
		// If we did some undoing, we need to destroy the redo history
		if(self.index < self.history.length - 2) {
			self.history = self.history.splice(self.index);
		}
		var state = self.element.innerHTML;
		self.history.push(state);
		self.index = self.history.length - 1;
	}
	
	/**
	 * Update the element's innerHTML with th current history index
	 * [TODO] When I'll have the cursor position saved, I'll need to restore it :D
	 */
	function _updateElement() {
		self.observer.disconnect();
		self.element.innerHTML = self.history[self.index];
		self.observer.observe(self.element, OBSERVER_CFG);
	}
	
	// Public methods
	return {
		undo: _undo,
		redo: _redo
	};
}