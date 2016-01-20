/*
 * This module traverses a lexical tree of tokens and emits specific ones that are subscribed to.
 */

/* *******************
 * AstEmitSubscription: Encapsulates a subscription for tokens
 */
// tokenIds: The names of the tokens to emit
// fnHandler: The handler that is called when a token that matches a token id is found in the object being traversed
//	The signature is: void function (token)
function AstEmitSubscription(tokenIds, fnHandler) {
	if (!(tokenIds instanceof Array)) {
		tokenIds = [tokenIds];
	}
	this.tokenIds = tokenIds;
	this.fnHandler = fnHandler;
}

/* *******************
 * astEmitterImpl: Private logic for the astEmitter.
 */
var astEmitterImpl = {
	subscriptions: [],

	getSubscriptionsForToken: function (token) {
		var arr = [];

		this.subscriptions.forEach(function (subscription) {
			if (subscription.tokenIds.indexOf(token.id) > -1) {
				arr.push(subscription);
			}
		});

		return arr;
	},

	emit: function (subscriptions, token) {
		this.getSubscriptionsForToken(token).forEach(function (subscription) {
			subscription.fnHandler(token);
		});
	}
};

/* *******************
 * astEmitter: Used to traverse tokens and emit them to subscribers.
 */
var astEmitter = {
	// Traverses a root token recursively and emits tokens that match subscriptions
	// token: The root token to traverse
	traverse: function (token) {
		var matchingSubscriptions = astEmitterImpl.getSubscriptionsForToken(token);
		if (matchingSubscriptions.length > 0) {
			astEmitterImpl.emit(matchingSubscriptions, token);
		}

		for (var c = 0; c < token.children.length; c++) {
			var child = token.children[c];
			this.traverse(child);
		}
	},

	// Subscribes a handler to receive calls every time a tokens with specific names are found
	// tokenIds: The names of the tokens to emit
	// fnHandler: The handler that is called when a token that matches a token id is found in the object being traversed
	//	The signature is: void function (token)
	subscribe: function (tokenIds, fnHandler) {
		var subscription = new AstEmitSubscription(tokenIds, fnHandler);
		astEmitterImpl.subscriptions.push(subscription);
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = astEmitter;
}
