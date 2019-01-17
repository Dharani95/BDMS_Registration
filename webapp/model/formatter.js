sap.ui.define([], function () {
	"use strict";
	var formatter = {

		policyStatus: function (v) {
			if (v === "in-force") {
				return "Active";
			} else if (v === "out-force") {
				return "Inactive";
			} else {
				return "";
			}
		},
		//-----------------D : To Change Date Format in 2 Views-----------------------//
		getDateFormat: function (value) {

			if (value && (value.search("-") != -1)) {
				var birthDate = value.split("-");
				var dd = birthDate[2];
				var mm = birthDate[1];
				var yy = birthDate[0];
				return dd + "/" + mm + "/" + yy;
			}
		},
		//-----------------D : To Change Date Format in 2 Views-----------------------//
		//-----------------D : To Change Number Format(Comma Separated)-----------------------//
		getNumberFormat: function (number) {

			return Intl.NumberFormat('en-IN', {
				minimumFractionDigits: 2
			}).format(number);

		},
		//-----------------D : To Change Number Format(Comma Separated)-----------------------//

		getPatientType: function (sPatientType) {
			if (sPatientType && sPatientType === "outpatient") {
				return "OPD";
			} else {
				return "OPD";
			}
		}

	};
	return formatter;
});