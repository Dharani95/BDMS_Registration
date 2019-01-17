/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"BDMSBugFix/BDMSBugFix/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"BDMSBugFix/BDMSBugFix/test/integration/pages/View1",
	"BDMSBugFix/BDMSBugFix/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "BDMSBugFix.BDMSBugFix.view.",
		autoWait: true
	});
});