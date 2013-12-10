(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.Conversations.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.Conversations.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.mappings = {
	"allowAnonymousSubmission": {
		"key": "auth.allowAnonymousSubmission"
	},
	"dependencies.appkey": {
		"key": "dependencies.StreamServer.appkey"
	},
	"dependencies.janrainapp": {
		"key": "dependencies.Janrain.appId"
	}
};

dashboard.vars = {
	"baseStreamECL": [{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Visible",
			"desc": "If True, a {data:title} stream is displayed above the All Posts stream showing hand curated posts"
		}
	}, {
		"component": "Input",
		"name": "label",
		"type": "string",
		"default": "{data:title}",
		"config": {
			"title": "Label",
			"desc": "Specifies a label to display above the {data:title} stream to explain to users what they should expect to see"
		}
	}, {
		"component": "Textarea",
		"name": "queryOverride",
		"type": "string",
		"config": {
			"title": "Query Override",
			"desc": "Specifies an Echo StreamServer Search Query to replace the the Query generated by the App for {data:title}. Typically used by advanced users/developers at run-time.",
			"data": {"sample": "childrenof:{data:targetURL} type:comment state:Untouched,ModeratorApproved children:2"}
		}
	}, {
		"component": "Input",
		"name": "initialItemPerPage",
		"type": "integer",
		"default": 15,
		"config": {
			"title": "Initial Items Per Page",
			"desc": "Specifies the initial number of {data:title} to show when the stream loads"
		}
	}, {
		"component": "Select",
		"name": "initialSortOrder",
		"type": "string",
		"default": "newest",
		"config": {
			"title": "Initial Sort Order",
			"desc": "Specifies the initial ordering of {data:title}",
			"options": [{
				"title": "Newest First",
				"value": "newest"
			}, {
				"title": "Oldest First",
				"value": "oldest"
			}, {
				"title": "Most Popular",
				"value": "popular"
			}, {
				"title": "Most Likes",
				"value": "likes"
			}]
		}
	}, {
		"component": "Checkbox",
		"name": "displaySortOrderPulldown",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sort Order Pulldown",
			"desc": "If True, displays a Sort Order pulldown to end-users, allowing them to change the sort order of {data:title}"
		}
	}, {
		"component": "Checkbox",
		"name": "displayCounter",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Counter",
			"desc": "If True, a count of {data:title} is displayed to users"
		}
	}, {
		"component": "Checkbox",
		"name": "displayTopPostHighlight",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display TopPost Highlight",
			"desc": "If True, a visual indicator is used to indicate a Top Post"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySharingIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sharing Intent",
			"desc": "If True, users are offered the option to share each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayLikeIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Like Intent",
			"desc": "If True, users are offered the option to like each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayReplyIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Reply Intent",
			"desc": "If True, users are offered the option to reply to each post"
		}
	}, {
		"component": "Select",
		"name": "replyNestingLevels",
		"type": "integer",
		"default": 2,
		"config": {
			"title": "Reply Nesting Levels",
			"desc": "Specifies the depth of replies allowed in the conversation thread",
			"options": $.map([1,2,3,4,5], function(i) {
				return {
					"title": i,
					"value": i
				};
			})
		}
	}, {
		"component": "Input",
		"name": "noPostsMessage",
		"default": "There are no posts yet.<br>Be the first to chime in!",
		"config": {
			"title": "No Posts Message",
			"desc": "Specifies the message shown to users when the are no posts to show"
		}
	}]
};

dashboard.config = {
	"ecl": [{
		"component": "Echo.Apps.Conversations.Dashboard.TargetSelector",
		"name": "targetURL",
		"type": "string",
		"default": "",
		"config": {
			"title": "Target URL",
			"default": "",
			"data": {"sample": "http://example.com/conversation"},
			"defaultValueTitle": "Use Current Page URL",
			"customValueTitle": "Use this URL"
		}
	},{
		"component": "Checkbox",
		"name": "allowAnonymousSubmission",
		"type": "boolean",
		"config": {
			"title": "Allow anonymous submission",
			"desc": "Allow users to post without logging in"
		}
	}, {
		"component": "Checkbox",
		"name": "bozoFilter",
		"type": "boolean",
		"config": {
			"title": "Enable Bozo Filter",
			"desc": "If enabled, ensures that users see their own post irrespective of the moderation state of that post"
		}
	}, {
		"component": "Group",
		"name": "dependencies",
		"type": "object",
		"config": {
			"title": "Dependencies"
		},
		"items": [{
			"component": "Select",
			"name": "appkey",
			"type": "string",
			"config": {
				"title": "StreamServer application key",
				"desc": "Specifies the application key for this instance",
				"options": []
			}
		}, {
			"component": "Select",
			"name": "janrainapp",
			"type": "string",
			"config": {
				"title": "Janrain application ID",
				"validators": ["required"],
				"options": []
			}
		}]
	}, {
		"component": "Group",
		"name": "topPosts",
		"type": "object",
		"config": {
			"title": "Top Posts"
		}
	}, {
		"component": "Group",
		"name": "allPosts",
		"type": "object",
		"config": {
			"title": "All Posts"
		}
	}]
};

dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		var assembleBaseECL = function() {
			var self = this;
			return $.map(component.get("baseStreamECL"), function(value) {
				var overrides = {};
				$.map(["config.desc", "config.title", "default"], function(key) {
					var val = Echo.Utils.get(value, key);
					if (val && typeof val === "string") {
						Echo.Utils.set(overrides, key, component.substitute({
							"template": val,
							"data": self.config
						}));
					}
				});
				return $.extend(true, {}, value, overrides);
			});
		};
		return $.map(obj, function(item) {
			var itemHandlers = {
				"topPosts": function() {
					var items = assembleBaseECL.call(this);
					items[3]["default"] = 5; // override initialItemsPerPage value
					items.pop();
					this["items"] = items;
					return this;
				},
				"allPosts": function() {
					this["items"] = assembleBaseECL.call(this);
					return this;
				}
			};
			return $.isFunction(itemHandlers[item.name])
				? itemHandlers[item.name].call(item) : item;
		});
	}
};


dashboard.init = function() {
	var parent = $.proxy(this.parent, this);
	this._requestData(function() {
		parent();
	});
};

dashboard.methods.declareInitialConfig = function() {
	var keys = this.get("appkeys", []);
	var apps = this.get("janrainapps", []);
	return {
		"dependencies": {
			"Janrain": {
				"appId": apps.length ? apps[0].name : undefined
			},
			"StreamServer": {
				"appkey": keys.length ? keys[0].key : undefined
			}
		}
	};
};

dashboard.methods.initConfigurator = function() {
	function findKey(key, ecl) {
		var found;
		$.each(ecl, function(k, item) {
			if (item.name === key) {
				found = item;
				return false;
			} else if (item.type === "object") {
				found = findKey(key, item.items);
				if (found) return false;
			}
		});
		return found;
	}

	var ecl = this.config.get("ecl");

	// populate appkey selectbox
	var appkey = findKey("appkey", ecl);
	appkey.config.options = $.map(this.get("appkeys", []), function(appkey) {
		return {
			"title": appkey.key,
			"value": appkey.key
		};
	});

	// populate janrainapp selectbox
	var janrainapp = findKey("janrainapp", ecl);
	janrainapp.config.options = $.map(this.get("janrainapps", []), function(app) {
		return {
			"title": app.name,
			"value": app.name
		};
	});
	this.parent.apply(this, arguments);
};

dashboard.methods._requestData = function(callback) {
	var self = this;
	var customerId = this.config.get("data.customer.id");
	var deferreds = [];
	var request = this.config.get("request");

	var requests = [{
		"name": "appkeys",
		"endpoint": "customer/" + customerId + "/appkeys"
	}, {
		"name": "janrainapps",
		"endpoint": "customer/" + customerId + "/janrainapps"
	}];
	$.map(requests, function(req) {
		var deferredId = deferreds.push($.Deferred()) - 1;
		request({
			"endpoint": req.endpoint,
			"success": function(response) {
				self.set(req.name, response);
				deferreds[deferredId].resolve();
			}
		});
	});
	$.when.apply($, deferreds).done(callback);
};

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
