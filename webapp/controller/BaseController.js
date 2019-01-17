/** *********************************************************************
All the methods defined in this controller are used across the views.
*************************************************************************/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, ODataModel, JSONModel) {
	"use strict";

	return Controller.extend("in.BDMSInsurance.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/*
		 * Date Format 1.2.3
		 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
		 * MIT license
		 *
		 * Includes enhancements by Scott Trenda <scott.trenda.net>
		 * and Kris Kowal <cixar.com/~kris.kowal/>
		 *
		 * Accepts a date, a mask, or a date and a mask.
		 * Returns a formatted version of the given date.
		 * The date defaults to the current date/time.
		 * The mask defaults to dateFormat.masks.default.
		 ** help : http://blog.stevenlevithan.com/archives/date-time-format
		 */
		getCurrentTime: function () {
			var dateFormat = function () {
				var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
					timezone =
					/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
					timezoneClip = /[^-+\dA-Z]/g,
					pad = function (val, len) {
						val = String(val);
						len = len || 2;
						while (val.length < len) val = "0" + val;
						return val;
					};

				// Regexes and supporting functions are cached through closure
				return function (date, mask, utc) {
					var dF = dateFormat;

					// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
					if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
						mask = date;
						date = undefined;
					}

					// Passing date through Date applies Date.parse, if necessary
					date = date ? new Date(date) : new Date();
					if (isNaN(date)) throw SyntaxError("invalid date");

					mask = String(dF.masks[mask] || mask || dF.masks["default"]);

					// Allow setting the utc argument via the mask
					if (mask.slice(0, 4) == "UTC:") {
						mask = mask.slice(4);
						utc = true;
					}

					var _ = utc ? "getUTC" : "get",
						d = date[_ + "Date"](),
						D = date[_ + "Day"](),
						m = date[_ + "Month"](),
						y = date[_ + "FullYear"](),
						H = date[_ + "Hours"](),
						M = date[_ + "Minutes"](),
						s = date[_ + "Seconds"](),
						L = date[_ + "Milliseconds"](),
						o = utc ? 0 : date.getTimezoneOffset(),
						flags = {
							d: d,
							dd: pad(d),
							ddd: dF.i18n.dayNames[D],
							dddd: dF.i18n.dayNames[D + 7],
							m: m + 1,
							mm: pad(m + 1),
							mmm: dF.i18n.monthNames[m],
							mmmm: dF.i18n.monthNames[m + 12],
							yy: String(y).slice(2),
							yyyy: y,
							h: H % 12 || 12,
							hh: pad(H % 12 || 12),
							H: H,
							HH: pad(H),
							M: M,
							MM: pad(M),
							s: s,
							ss: pad(s),
							l: pad(L, 3),
							L: pad(L > 99 ? Math.round(L / 10) : L),
							t: H < 12 ? "a" : "p",
							tt: H < 12 ? "am" : "pm",
							T: H < 12 ? "A" : "P",
							TT: H < 12 ? "AM" : "PM",
							Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
							o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
							S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
						};

					return mask.replace(token, function ($0) {
						return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
					});
				};
			}();

			// Some common format strings
			dateFormat.masks = {
				"default": "ddd mmm dd yyyy HH:MM:ss",
				shortDate: "m/d/yy",
				mediumDate: "mmm d, yyyy",
				longDate: "mmmm d, yyyy",
				fullDate: "dddd, mmmm d, yyyy",
				shortTime: "h:MM TT",
				mediumTime: "h:MM:ss TT",
				longTime: "h:MM:ss TT Z",
				isoDate: "yyyy-mm-dd",
				isoTime: "HH:MM:ss",
				isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
				isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
			};

			// Internationalization strings
			dateFormat.i18n = {
				dayNames: [
					"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
					"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
				],
				monthNames: [
					"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
					"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
				]
			};

			// For convenience...
			Date.prototype.format = function (mask, utc) {
				return dateFormat(this, mask, utc);
			};

			var today = new Date();
			var dateString = '';

			///06 Nov 1994 08:49:37 GMT
			// Can also be used as a standalone function
			dateString = dateFormat(today, "ddd, dd mmm yyyy, hh:MM:ss Z");
			//alert(dateString);
			var formattedDate = dateString.split("+")[0];
			//var formattedDate = dateString.split("GMT")[0];
			return formattedDate;

		},
			/* Rank array is passed to find missing numbers in the consecutive sequence. */
		fnMissingRank: function (aRank) {
			var aMissing = [];
			var iMinimum = Math.min.apply("", aRank);
			var iMaximum = Math.max.apply("", aRank);
			iMinimum = iMinimum !== 1 ? 0 : iMinimum;
			while (iMinimum < iMaximum) {
				if (aRank.indexOf(++iMinimum) === -1) {
					aMissing.push(iMinimum);
				}
			}
			return aMissing;
		},
		/* Number Check: 1 to 9 */
		fnNumberCheck: function (sRank) {
			if (sRank && !/^[1-9]+$/.test(sRank)) {
				var sMsg = "Please enter only numeric values greater than 0.";
				this.showErrorMessage(sMsg);
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
			getXRequestNumber: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var episodeNum = modelData.patientDetails.episodeNumber;
			var hospitalNum = modelData.patientDetails.hospitalNumber;
			var productType = modelData.selectedPdType;
			var dateTime = this.getCurrentTime();
			var xRequestNum = episodeNum + "_" + hospitalNum + "_" + productType + "_" + dateTime;
			return xRequestNum;
		},

		/*------To Close The Application: Open the dialog informing the user to close the dialog ----*/
		onCloseApp: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.information(
				"To Close The App, Kindly Close the Browser Tab.", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Error Message Display Block
		 * @param {string} [sMessage] the message text
		 */
		showErrorMessage: function (sMessage) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sMessage, {
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		},

		/** Fetch User Details */
		getUserDetails: function () {
			var oUserModel = new JSONModel();
			var sUrl = "/services/userapi/currentUser";
			var oModel = new sap.ui.model.json.JSONModel();

			this.setModel(oUserModel, "oUserModel");
			oUserModel.loadData(sUrl, null, true, "GET", false, false);
			// NOT USED FOR NOW
			// oUserModel.attachRequestCompleted(function (oEvent) {
			// }, this);
			oModel.attachRequestFailed(function (oEvent) {
				this.showErrorMessage(this.getResourceBundle().getText("INT_SERVER_ERR"));
			}, this);
		},

		/* Open the dialog for the User Profile */
		fnUserProfile: function (oEvent) {
			if (!this.oUserProfile) {
				this.oUserProfile = sap.ui.xmlfragment("in.BDMSInsurance.Fragments.userProfile", this);
				this.getView().addDependent(this.oUserProfile);
			}
			this.oUserProfile.open();
		},

		/* Close the dialog for the User Profile */
		fnCloseUserProfile: function () {
			this.oUserProfile.close();
		}
	});
});