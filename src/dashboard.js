(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.Conversations.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.Conversations.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.mappings = {
	"dependencies.appkey": {
		"key": "dependencies.StreamServer.appkey"
	},
	"dependencies.janrainapp": {
		"key": "dependencies.Janrain.appId"
	},
	"postComposer.confirmationMessage": {
		"key": "postComposer.confirmation.message"
	},
	"replyComposer.confirmationMessage": {
		"key": "replyComposer.confirmation.message"
	},
	"postComposer.contentTypes.comments.prompt": {
		"key": "postComposer.contentTypes.comments.labels.prompt"
	},
	"replyComposer.contentTypes.comments.prompt": {
		"key": "replyComposer.contentTypes.comments.labels.prompt"
	}
};

var sourcesValidator = function(value) {
	var availableSources = ["BOX", "COMPUTER", "DROPBOX", "EVERNOTE", "FACEBOOK", "FLICKR", "FTP", "GITHUB", "GOOGLE_DRIVE", "SKYDRIVE", "PICASA", "WEBDAV", "GMAIL", "IMAGE_SEARCH", "INSTAGRAM", "URL", "VIDEO", "WEBCAM"];
	var sources = $.map(value.split(","), function(source) { return source ? $.trim(source) : undefined; });
	var unknownSources = $.grep(sources, function(source) {
		return !~$.inArray(source, availableSources);
	});
	return unknownSources.length === 0
		? {"valid": true}
		: {
			"valid:": false,
			"message": "Unknown sources: " + unknownSources.join(", ")
		};
};

dashboard.vars = {
	"baseStreamECL": [{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Visible",
			"desc": "If enabled, the {data:title} stream is displayed"
		}
	}, {
		"component": "Input",
		"name": "label",
		"type": "string",
		"default": "{data:title}",
		"config": {
			"title": "Label",
			"desc": "Specifies a label to display above the {data:title} stream"
		}
	}, {
		"component": "Textarea",
		"name": "queryOverride",
		"type": "string",
		"config": {
			"title": "Query Override",
			"desc": "Specifies an Echo StreamServer Search Query to replace the the Query generated by the App for {data:title}. Typically used by advanced users/developers at run-time",
			"data": {"sample": "childrenof:{config:targetURL} type:comment state:Untouched,ModeratorApproved children:2"}
		}
	}, {
		"component": "Input",
		"name": "initialItemsPerPage",
		"type": "number",
		"default": 15,
		"config": {
			"title": "Initial Items Per Page",
			"desc": "Specifies the initial number of posts to show when the stream loads"
		}
	}, {
		"component": "Input",
		"name": "maxMediaWidth",
		"type": "number",
		"config": {
			"title": "Maximum Media Width",
			"desc": "Specify a maximum media content width (in pixels) which should be defined when an item is being displayed.",
			"options": [],
			"data": {"sample": 500}
		}
	}, {
		"component": "Select",
		"name": "initialIntentsDisplayMode",
		"type": "string",
		"default": "inline",
		"config": {
			"title": "Intents Initial Display Mode",
			"desc": "Specifies initial display mode of item Intents (icon + label, icon only or a list of actions in a dropdown).",
			"options": [{
				"title": "Full (icon + label)",
				"value": "inline"
			}, {
				"title": "Icons only",
				"value": "compact"
			}, {
				"title": "Dropdown",
				"value": "dropdown"
			}]
		}
	}, {
		"component": "Checkbox",
		"name": "enableIntentsResponsiveness",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Enable Intents responsiveness",
			"desc": "If enabled, Intents respect the size of a container and switch from full mode (icon + label) -> icons only -> dropdown menu with the list of Intents. Otherwise, Intents UI always remains the same at any container size."
		}
	}, {
		"component": "Checkbox",
		"name": "displaySourceIcons",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Source Icons",
			"desc": "If enabled, will display the source Icon for each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySortOrderPulldown",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sort Order Pulldown",
			"desc": "If enabled, displays a Sort Order pulldown to end-users, allowing them to change posts sorting order."
		}
	}, {
		"component": "Checkbox",
		"name": "displayCounter",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Counter",
			"desc": "If enabled, a total count of posts in this stream is displayed to users"
		}
	}, {
		"component": "Checkbox",
		"name": "displayTopPostHighlight",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display TopPost Highlight",
			"desc": "If enabled, a visual indicator is used to indicate a Top Post"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySharingIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sharing Intent",
			"desc": "If enabled, users are offered the option to share each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayLikeIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Like Intent",
			"desc": "If enabled, users are offered the option to like each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayReplyIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Reply Intent",
			"desc": "If enabled, users are offered the option to reply to each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayEditIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Edit Intent",
			"desc": "If enabled, users will be able to edit their own posts. Moderators and admins will be able to edit any post."
		}
	}, {
		"component": "Checkbox",
		"name": "displayTweets",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Twitter Items",
			"desc": "Enable twitter items."
		}
	}, {
		"component": "Checkbox",
		"type": "boolean",
		"name": "openLinksInNewWindow",
		"default": true,
		"config": {
			"title": "Open links in new window",
			"desc": "If enabled, each link will be opened in a new window."
		}
	}, {
		"component": "Select",
		"name": "initialSortOrder",
		"type": "string",
		"default": "reverseChronological",
		"config": {
			"title": "Initial Sort Order",
			"desc": "Specifies the initial ordering of posts in this stream",
			"options": [{
				"title": "Newest First",
				"value": "reverseChronological"
			}, {
				"title": "Oldest First",
				"value": "chronological"
			}, {
				"title": "Most Popular",
				"value": "repliesDescending"
			}, {
				"title": "Most Likes",
				"value": "likesDescending"
			}]
		}
	}, {
		"component": "Select",
		"name": "likesDisplayStyle",
		"type": "string",
		"default": "facepile",
		"config": {
			"title": "Likes Display Mode",
			"options": [{
				"title": "Hidden",
				"value": "hidden"
			}, {
				"title": "Facepile",
				"value": "facepile"
			}, {
				"title": "Number",
				"value": "number"
			}]
		}
	}, {
		"component": "Select",
		"name": "replyNestingLevels",
		"type": "number",
		"default": 2,
		"config": {
			"title": "Reply Nesting Levels",
			"desc": "Specifies the depth of replies allowed in the conversation thread",
			"options": $.map([0,1,2,3,4,5], function(i) {
				return {
					"title": i + (i === 0 ? " (no replies)" : ""),
					"value": i
				};
			})
		}
	}, {
		"component": "Group",
		"name": "moderation",
		"type": "object",
		"config": {
			"title": "Moderation"
		},
		"items": [{
			"component": "Checkbox",
			"name": "displayCommunityFlaggedPosts",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Display Community Flagged Posts"
			}
		}, {
			"component": "Checkbox",
			"name": "displaySystemFlaggedPosts",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Display System Flagged Posts"
			}
		}]
	}, {
		"component": "Input",
		"name": "noPostsMessage",
		"type": "string",
		"default": "There are no posts yet.<br>Be the first to chime in!",
		"config": {
			"title": "No Posts Message",
			"desc": "Specifies the message shown to users when the are no posts to show"
		}
	}],
	"baseComposerECL": [{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Visible",
			"desc": "If enabled, the composer will be displayed to end users"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySharingOnPost",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sharing on Post",
			"desc": "If enabled, users will be given the option to share their Posts on submit"
		}
	}, {
		"component": "Input",
		"name": "confirmationMessage",
		"type": "string",
		"config": {
			"title": "Confirmation message",
			"desc": "Specifies the confirmation message text displayed after successful submission if pre-moderation mode is enabled",
			"data": {"sample": "Thanks, your post has been submitted for review"}
		}
	}, {
		"component": "Group",
		"name": "contentTypes",
		"type": "object",
		"config": {
			"title": "Content Types"
		},
		"items": [{
			"component": "Group",
			"name": "comments",
			"type": "object",
			"config": {
				"title": "Comments"
			},
			"items": [{
				"component": "Checkbox",
				"name": "enabled",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Visible",
					"desc": "If enabled, users can submit Comments"
				}
			}, {
				"component": "Input",
				"name": "prompt",
				"type": "string",
				"config": {
					"title": "Prompt",
					"desc": "Specifies the ghost text displayed in the Comment Prompt",
					"data": {"sample": "What's on your mind?"}
				}
			}, {
				"component": "Checkbox",
				"name": "resolveURLs",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Resolve URLs",
					"desc": "If enabled, resolves URLs found in the comment body to rich attached content"
				}
			}, {
				"component": "Group",
				"name": "attachments",
				"type": "object",
				"config": {
					"title": "Attachments"
				},
				"items": [{
					"component": "Checkbox",
					"name": "visible",
					"type": "boolean",
					"default": true,
					"config": {
						"title": "Visible",
						"desc": "If enabled, users can submit Comments with attachments (Resolve URLs enabled required)"
					}
				}, {
					"component": "Input",
					"name": "sources",
					"type": "string",
					"default": "",
					"config": {
						"title": "Uploading sources",
						"desc": "Here can be specified list of attachment sources, check filepicker.io documentation for full information",
						"validators": [sourcesValidator],
						"data": {
							"sample": "COMPUTER, INSTAGRAM, FACEBOOK, FLICKR, DROPBOX, PICASA, EVERNOTE, FTP, GITHUB, BOX, GOOGLE_DRIVE, SKYDRIVE, WEBDAV, GMAIL, IMAGE_SEARCH, URL, VIDEO, WEBCAM"
						},
						"link": {
							"src": "//developers.inkfilepicker.com/docs/web/#pick",
							"title": "Click to view documentation"
						}
					}
				}]
			}]
		}, {
			"component": "Group",
			"name": "photos",
			"type": "object",
			"config": {
				"title": "Photos"
			},
			"items": [{
				"component": "Checkbox",
				"name": "enabled",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Visible",
					"desc": "If enabled, users can submit Photos"
				}
			}, {
				"component": "Input",
				"name": "sources",
				"type": "string",
				"default": "",
				"config": {
					"title": "Uploading sources",
					"desc": "Here can be specified list of attachment sources, check filepicker.io documentation for full information",
					"validators": [sourcesValidator],
					"data": {
						"sample": "COMPUTER, INSTAGRAM, FACEBOOK, FLICKR, DROPBOX, PICASA, EVERNOTE, FTP, GITHUB, BOX, GOOGLE_DRIVE, SKYDRIVE, WEBDAV, GMAIL, IMAGE_SEARCH, URL, VIDEO, WEBCAM"
					},
					"link": {
						"src": "//developers.inkfilepicker.com/docs/web/#pick",
						"title": "Click to view documentation"
					}
				}
			}]
		}, {
			"component": "Group",
			"name": "links",
			"type": "object",
			"config": {
				"title": "Links"
			},
			"items": [{
				"component": "Checkbox",
				"name": "enabled",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Visible",
					"desc": "If enabled, users can submit Links"
				}
			}]
		}]
	}],
	"premoderationECL": [{
		"component": "Group",
		"name": "premoderation",
		"type": "object",
		"config": {
			"title": "Pre-moderation"
		},
		"items": [{
			"component": "Checkbox",
			"name": "enable",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Enable",
				"desc": "If enabled, Posts from general users need to be manually Approved by a Moderator or Admin before being displayed to general users"
			}
		}, {
			"component": "Checkbox",
			"name": "approvedUserBypass",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Approved User Bypass",
				"desc": "If enabled, Users marked as ‘Approved’ bypass the Pre-moderation process, reducing unnecessary moderation overhead. Users who have 3 or more Posts approved are automatically marked as Approved Users"
			}
		}]
	}]
};

dashboard.config = {
	"disableSettings": [],
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
	}, {
		"component": "Group",
		"name": "presentation",
		"type": "object",
		"config": {
			"title": "Presentation"
		},
		"items": [{
			"component": "Input",
			"name": "minWidth",
			"type": "number",
			"config": {
				"title": "Minimum Width",
				"desc": "Specify a minimum width (in pixels) of an App container.",
				"data": {"sample": 320}
			}
		}, {
			"component": "Input",
			"name": "maxHeight",
			"type": "number",
			"config": {
				"title": "Maximum Height",
				"desc": "Specify a maximum height (in pixels) of an App container. If an App context exceeds the defined max height, a vertical scrollbar appears.",
				"data": {"sample": 700}
			}
		}, {
			"component": "Input",
			"name": "maxWidth",
			"type": "number",
			"config": {
				"title": "Maximum Width",
				"desc": "Specify a maximum width (in pixels) of an App container.",
				"data": {"sample": 700}
			}
		}]
	}, {
		"component": "Group",
		"name": "streamingControl",
		"type": "object",
		"config": {
			"title": "Streaming control"
		},
		"items": [{
			"component": "Checkbox",
			"name": "pauseOnHover",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Pause on Hover"
			}
		}, {
			"component": "Checkbox",
			"name": "displayStreamingStateHeader",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Display streaming state header"
			}
		}, {
			"component": "Checkbox",
			"name": "enablePausePlayToggle",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Enable pause/play toggle"
			}
		}]
	}, {
		"component": "Group",
		"name": "postComposer",
		"type": "object",
		"config": {
			"title": "Post Composer"
		}
	}, {
		"component": "Group",
		"name": "replyComposer",
		"type": "object",
		"config": {
			"title": "Reply Composer"
		}
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
	}, {
		"component": "Group",
		"name": "auth",
		"type": "object",
		"config": {
			"title": "Authentication"
		},
		"items": [{
			"component": "Checkbox",
			"name": "allowAnonymousSubmission",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Allow anonymous submission",
				"desc": "Allow users to post without logging in"
			}
		}, {
			"component": "Checkbox",
			"name": "enableBundledIdentity",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Bundled Login and Sharing",
				"desc": "If set to false, the bundled Janrain Login and Sharing functionality is disabled along with related identity features"
			}
		}, {
			"component": "Checkbox",
			"name": "hideLoginButtons",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Hide Login Buttons"
			}
		}]
	}, {
		"component": "Group",
		"name": "dependencies",
		"type": "object",
		"config": {
			"title": "Dependencies",
			"expanded": false
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
		}, {
			"component": "Fieldset",
			"name": "FilePicker",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "FilePicker API key",
					"desc": "Specifies the Filepicker api key for this instance",
					"options": []
				}
			}]
		}, {
			"component": "Fieldset",
			"name": "embedly",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "Embed.ly API Key"
				}
			}]
		}]
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

					items[0]["default"] = false; // override visible value
					items[3]["default"] = 5; // override initialItemsPerPage value
					items[20]["items"][0]["default"] = true;
					items.pop();

					items.splice(7, 0, {
						"component": "Checkbox",
						"name": "includeTopContributors",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Include Top Contributors",
							"desc": "If enabled, Posts from users marked as ‘Top Contributors’ are automatically " +
								"included in the Top Posts stream unless manually removed"
						}
					});
					this["items"] = items;
					return this;
				},
				"allPosts": function() {
					var items = assembleBaseECL.call(this);
					items[20]["items"].push(component.get("premoderationECL"));
					items.splice(12, 0, {
						"component": "Checkbox",
						"name": "displayCommunityFlagIntent",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Display Community Flag Intent",
							"desc": "If enabled, users are offered the option to flag a post as inappropriate"
						}
					});
					this["items"] = items;
					return this;
				},
				"postComposer": function() {
					this["items"] = [].concat(component.get("baseComposerECL"));
					return this;
				},
				"replyComposer": function() {
					this["items"] = [].concat(component.get("baseComposerECL"));
					this["items"].splice(2, 0, {
						"component": "Checkbox",
						"name": "displayCompactForm",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Display Compact Form",
							"desc": "If enabled, compact form is displayed below each top-level post"
						}
					});
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
	if (~$.inArray("dependencies", this.config.get("disableSettings"))) return {};
	var keys = this.get("appkeys", []);
	var apps = this.get("janrainapps", []);
	return {
		"dependencies": {
			"Janrain": {
				"appId": apps.length ? apps[0].name : undefined
			},
			"StreamServer": {
				"appkey": keys.length ? keys[0].key : undefined
			},
			"FilePicker": {
				"apiKey": "AFLWUBllDRwWZl7sQO1V1z"
			},
			"embedly": {
				"apiKey": "5945901611864679a8761b0fcaa56f87"
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
	// remove items specified in the config.disableSettings
	var disableSettings = this.config.get("disableSettings");
	(function traverse(items, path) {
		return $.map(items, function(item, key) {
			var itemPath = path ? path + "." + item.name : item.name;
			if (~$.inArray(itemPath, disableSettings)) {
				delete items[key];
			}
			if (item.items) traverse(item.items, itemPath);
		});
	})(ecl);
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
