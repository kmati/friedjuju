/*
 * The router for the friedjuju components
 */
var router = {
	// inits the router with some initial state and the document title and location
	// initialState: An object that represents initial state
	init: function (initialState) {
	    // Store the initial content so we can revisit it later
	    history.replaceState(initialState, document.title, document.location.href);		
	},

	registerClickableElement: function (ele) {
		ele.addEventListener('click', clickHandler, true);
	}
};
