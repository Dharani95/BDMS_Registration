sap.ui.define([
	"in/BDMSInsurance/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("in.BDMSInsurance.controller.App", {

		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			var oModel = oComponent.getModel("appModel");
			var appData = {
				// header data 
				"startDate": "",
				"endDate": "",
				"firstNameHeader": "",
				"lastNameHeader": "",
				"middleNameHeader": "",
				"productTypeHeader": "",
				"titleHeader": "",
				// end of header data
				"navigatingFromIdentification": true,
				"submitVisible": false,
				"getCoverageVisible": true,
				"createPatientDetCode": "",
				"createPatientDetEpisodeCode": "",
				"episodeClaimTypeMapId": "",
				"patientCode": "",
				// below are the fields for submit Review
				"reviewEpisodeClmTypeId": "",
				"reviewEpisodeNumber": "",
				"reviewEpisodeRowId": "",
				"reviewHospitalNum": "",
				"reviewPatientRowId": "",
				// end of submit review data
				// below two are for add policy dropdown and input
				"selectedType": "",
				"selectedTypeValue": "",
				"selectPolicyNumber": "",
				"insNotEligible": "",
				"policyNotEligible": "",
				"coverageNotEligible": "",
				"pdTypeValue": "",
				"selectedPdType": "",
				"accClmFromDate": "",
				"accClmToDate": "",
				"reviewButton": false,
				"confLinkVisible": false,
				"compareVisible": false,
				"remarkButton": false,
				"optionDocButton": true,
				"fetchPath": "",
				"selectedInsCode": "",
				"selectedClmGrp": "",
				"selectedClmType": "",
				"hospitalName": "",
				"hospitalLogo": "",
				"selectedPatientData": "",
				"umRoleVal": "",
				"umRoleCode": "",
				"eventPath": "",
				insurances: [],
				claimGroupData: [],
				claimTypeData: [],
				insuranceDetailsTable: [],
				storeCoverageData: [],
				iconTabBarData: [],
				productType: [],
				policyStatus: [],
				icd10SearchHelp: [],
				accidentHistory: [],
				tempArray: [],
				accHisClaimTable: [],
				coverageReason: [],
				selectedCoverageItems: [],
				compareCoverageItems: [],
				coverageAgainstReserveNum: [],
				followUpTable: [],
				submitReview: [],
				optDocArray: [],
				//for local insurance
				insuredTypeLocalArray: [],
				PolicyStatusLocalArray: [],
				umRole: [],
				docList: [],
				requestedDoc: [],
				guranteeTable: []
			};
			oModel.setData(appData);
			oModel.updateBindings();
			this.getUserDetails(); // Fetch the user details
		}
	});
});