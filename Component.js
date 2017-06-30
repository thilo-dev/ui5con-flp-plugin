sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Component, Button, Bar, MessageToast, JSONModel) {

	return Component.extend("my.cool.plugin.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function() {
			var rendererPromise = this._getRenderer();
			var that = this;

			this.oModel = new JSONModel({
				visible: true,
				title: "",
				url: ""
			});
			sap.ui.getCore().setModel(this.oModel, "foo");

			/**
			 * Add item to the header
			 */
			rendererPromise.then(function(oRenderer) {
				that.oButton = oRenderer.addHeaderItem({
					icon: "sap-icon://add",
					tooltip: "Add bookmark",
					press: function() {
						that._createPopover();
					}
				}, true, true);

				that.oPers = sap.ushell.Container.getService("Personalization");
				that.oPers.getPersonalizationContainer("my.cool.plugin").then(function(container) {
					if (container.getItemValue("Bookmark") === undefined || !!container.getItemValue("Bookmark")) {
						container.setItemValue("Bookmark", true);
						container.save();
						return;
					}
					that.oButton.setVisible(false);
					that.oModel.setProperty("/visible", false);
				});

				var fnHandleSettingChange = function() {
					var bVisisble = that.oModel.getProperty("/visible");
					that.oPers.getPersonalizationContainer("my.cool.plugin").then(function(container) {
						container.setItemValue("Bookmark", bVisisble);
						container.save();
						that.oButton.setVisible(bVisisble);
					});
				};

				var oPanel = new sap.m.Panel({
					content: new sap.m.Switch({
						state: "{foo>/visible}",
						change: function(oEvt) {
							that.oButton.setVisible(oEvt.getParameter("state"));
						}
					})
				});

				var oEntry = {
					title: "My Settings",
					value: function() {
						return jQuery.Deferred().resolve("putting the user in control");
					},
					content: function() {
						return jQuery.Deferred().resolve(oPanel);
					},
					onSave: function() {
						return jQuery.Deferred().resolve(fnHandleSettingChange());
					}
				};
				oRenderer.addUserPreferencesEntry(oEntry);
			});

		},

		_createPopover: function() {
			//var that = this;
			if (this._Dialog) {
				this._Dialog.open();
				return;
			}
			this._Dialog = sap.ui.xmlfragment("ok", "my.cool.plugin.view.Dialog", this).open();
			this._Dialog.setModel(this.oModel);
		},

		onCloseDialog: function(oEvt) {
			this._Dialog.close();
		},

		onCreateBookmark: function(oEvt) {
			var oBookmarkService = sap.ushell.Container.getService("Bookmark");
			var oData = this._Dialog.getModel().getData();
			if (oData.title !== "" && oData.url !== "") {
				oBookmarkService.addBookmark(oData);
				this._Dialog.close();
			} else {
				return;
			}

		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function() {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function(oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});