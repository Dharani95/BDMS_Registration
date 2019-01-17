/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ims/BDMSRegistration/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});