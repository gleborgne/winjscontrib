var MCNEXT = MCNEXT || {};

/**
 * @namespace
 */
MCNEXT.Alert = MCNEXT.Alert || {};
(function (Alert) {
	MCNEXT.Alert.messageBox = function messageBox(opt, isPhone) {
		if (opt) {
			if (window.Windows) {
				var md = new Windows.UI.Popups.MessageDialog(opt.content);
				if (opt.title) {
					md.title = opt.title;
				}
				if (opt.commands && opt.commands.forEach) {
					if (WinJS.Utilities.isPhone || isPhone) {
						if (opt.commands.length > 2) {
							return WinJS.Promise.wrapError("you must specify maximum 2 commands on WP platforms");
						}
					}
					opt.commands.forEach(function (command, index) {
						var cmd = new Windows.UI.Popups.UICommand();
						cmd.label = command.label;
						if (command.callback) {
							cmd.invoked = command.callback;
						}
						((md.commands)).append(cmd);
						if (command.isDefault) {
							md.defaultCommandIndex = index;
						}
					});
				}

				return (md.showAsync());
			} else {
				return new WinJS.Promise(function (complete, error) {
					var title = "";
					if (opt.title) {
						title = opt.title;
					}


					var commands = [];
					if (opt.commands && opt.commands.forEach) {
						//if (opt.commands.length > 2) {
						//    return WinJS.Promise.wrapError("you must specify maximum 2 commands on Cordova platforms");
						//}
						opt.commands.forEach(function (command, index) {
							commands.push(command.label);
						});
					} else
						commands = ['Ok'];


					if (navigator && navigator.notification && navigator.notification.confirm) {
						navigator.notification.confirm(
							opt.content, // message
							function (res) {
								if (opt.commands && opt.commands[res - 1] && opt.commands[res - 1].callback) {
									var c = opt.commands[res - 1].callback();
									if (c && c.then) {
										c.then(function () {
											complete(true);
										});
									} else {
										complete(true);
									}
								}
								else if (res != 0)
									complete(true);
								else
									complete(false);
							},            // callback to invoke with index of button pressed
							title,           // title
							commands     // buttonLabels
							);
					}
					else {
						if (window.confirm(title))
							complete(true);
						else
							complete(false);
					}
				});

			}
		}
		return WinJS.Promise.wrapError("you must specify commands as an array of objects with properties text and callback such as {text: '', callback: function(c){}}");
	};

	MCNEXT.Alert.message = function (title, content) {
		return Alert.messageBox({ title: title, content: content });
	}

	MCNEXT.Alert.confirm = function (title, content, yes, no) {
		return new WinJS.Promise(function (complete, error) {
			Alert.messageBox({
				title: title,
				content: content,
				commands: [
					{
						label: yes,
						callback: function (e) {
							complete(true);
						},
						isDefault: true
					},
					{
						label: no,
						callback: function (e) {
							complete(false);
						}
					}
				]
			});
		});
	}

	MCNEXT.Alert.toastNotification = function (data) {
		if (window.Windows) {
			var notifications = Windows.UI.Notifications;
			var template = data.template || (data.picture ? notifications.ToastTemplateType.toastImageAndText01 : notifications.ToastTemplateType.toastText01);
			//var template = notifications.ToastTemplateType[data.template]; //toastImageAndText01;
			var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
			var toastTextElements = toastXml.getElementsByTagName("text");
			var toastImageElements = toastXml.getElementsByTagName("image");
			if (data.launch) {
				var toastElements = toastXml.getElementsByTagName("toast");
				toastElements[0].setAttribute("launch", JSON.stringify(data.launch));
			}

			toastTextElements[0].appendChild(toastXml.createTextNode(data.text));

			if (data.text2 && toastTextElements.length > 1) {
				toastTextElements[1].appendChild(toastXml.createTextNode(data.text2));
			}

			if (data.text3 && toastTextElements.length > 1) {
				toastTextElements[2].appendChild(toastXml.createTextNode(data.text3));
			}

			if (data.picture) {
				toastImageElements[0].setAttribute("src", data.picture); //"ms-appx:///images/logo.png"
				//toastImageElements[0].setAttribute("alt", "red graphic");
			}

			var toast = new notifications.ToastNotification(toastXml);
			var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
			toastNotifier.show(toast);
		} else if (window.plugin && window.plugin.notification) {
			window.plugin.notification.local.add({
				id: MCNEXT.Utils.guid(), // A unique id of the notifiction
				date: new Date(), // This expects a date object
				message: data.text, // The message that is displayed
				title: data.text, // The title of the message
				//repeat: String,  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
				//badge: Number,  // Displays number badge to notification
				//sound: String,  // A sound to be played
				//json: String,  // Data to be passed through the notification
				autoCancel: true, // Setting this flag and the notification is automatically canceled when the user clicks it
				//ongoing: Boolean, // Prevent clearing of notification (Android only)
			});
		}

		else {
			throw "No notification plugin found";
		}
	}

	MCNEXT.Alert.toast = function (text, picture) {
		Alert.toastNotification({ text: text, picture: picture });
	}
})(MCNEXT.Alert);