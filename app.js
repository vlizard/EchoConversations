(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.Conversations")) return;

var conversations = Echo.App.manifest("Echo.Apps.Conversations");

conversations.config = {
	"auth":{
		"allowAnonymousSubmission": false
	},
	"dependencies": {
		"Janrain": {"appId": undefined},
		"StreamServer": {"appkey": undefined}
	},
	"conversationID": "",
	"itemStates": "Untouched,ModeratorApproved",
	"liveUpdates": {
		"transport": "websockets"
	}
};

conversations.config.normalizer = {
	"conversationID": function(value) {
		return value
			|| $("link[rel='canonical']").attr('href')
			|| document.location.href.split("#")[0];
	}
};

conversations.dependencies = [{
	"url": "{config:cdnBaseURL.sdk}/streamserver.pack.js",
	"control": "Echo.StreamServer.Controls.Stream"
}];

conversations.templates.main =
	'<div class="{class:container}">' +
		'<div class="{class:submit}"></div>' +
		'<div class="{class:stream}"></div>' +
	'</div>';

conversations.renderers.submit = function(element) {
	var submitPermissions = this._getSubmitPermissions();
	this.initComponent({
		"id": "stream",
		"component": "Echo.StreamServer.Controls.Submit",
		"config": {
			"appkey": this.config.get("dependencies.StreamServer.appkey"),
			"target": element,
			"targetURL": this.config.get("conversationID"),
			"infoMessages": {"enabled": false},
			"liveUpdates": this.config.get("liveUpdates"),
			"plugins": [{
				"name": "JanrainAuth",
				"appId": this.config.get("dependencies.Janrain.appId"),
				"submitPermissions": submitPermissions,
				"buttons": ["login", "signup"],
				"nestedPlugins": [{
					"name": "CardUIShim",
					"submitPermissions": submitPermissions
				}]
			}, {
				"name": "CardUIShim",
				"submitPermissions": submitPermissions
			}]
		}
	});
};

conversations.renderers.stream = function(element) {
	var replyPermissions = this._getSubmitPermissions();
	this.initComponent({
		"id": "Stream",
		"component": "Echo.StreamServer.Controls.Stream",
		"config": {
			"appkey": this.config.get("dependencies.StreamServer.appkey"),
			"target": element,
			"query": this._buildSearchQuery(),
			"item": {
				"reTag": false
			},
			"plugins": [{
				"name": "CardUIShim"
			}, {
				"name": "LikeCardUI"
			}, {
				"name": "ReplyCardUI",
				"nestedPlugins": [{
					"name": "JanrainAuth",
					"appId": this.config.get("dependencies.Janrain.appId"),
					"submitPermissions": replyPermissions,
					"buttons": ["login", "signup"],
					"nestedPlugins": [{
						"name": "CardUIShim",
						"submitPermissions": replyPermissions
					}]
				}, {
					"name": "CardUIShim",
					"submitPermissions": replyPermissions
				}]
			}, {
				"name": "ModerationCardUI"
			}]
		}
	});
};

conversations.methods._getSubmitPermissions = function() {
	return this.config.get("auth.allowAnonymousSubmission") ? "allowGuest" : "forceLogin";
};

conversations.methods._buildSearchQuery = function() {
	// TODO: think about more scalable approach to override query predicates...
	var states = "state:" + this.config.get("itemStates");
	return "childrenof:" + this.config.get("conversationID") +
		" type:comment " + states +
		" children:2 " + states;
};

Echo.App.create(conversations);

})(Echo.jQuery);
