sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageToast'
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("in.BDMSInsurance.controller.SubmitReview", {
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("RouteSubmitReview").attachPatternMatched(this._onObjectMatched, this);
			this.getReviewDetails();

		},
		getReviewDetails: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var oToken = this._fetchToken();
			/*uncomment the below code later with the real time data*/
			/* Presently for a specific set of data records are there.*/
			
			// var inputPayload = {
			// 	"buCode": modelData.buCode,
			// 	"patientCode": modelData.patientCode,
			// 	"episodeCode": modelData.createPatientDetEpisodeCode,
			// 	"productTypeCode": "001"
			// };
			/* the below payload is for testing purpose. */
			var inputPayload = {
				"buCode": "001",
				"patientCode": "1",
				"episodeCode": "1",
				"productTypeCode": "001"
			};
			$.ajax({
				url: "/bdms/ims/reg/Registration_Service/Destinations/CallBdmsReserveSP.xsjs",
				type: 'POST',
				data: JSON.stringify(inputPayload),
				contentType: "application/json",

				headers: {
					"X-CSRF-Token": oToken
				},
				success: function (data) {
					modelData.reviewEpisodeClmTypeId = data[0].EPISODE_CLAIM_TYPE_MAP_ID;
					modelData.reviewEpisodeNumber = data[0].EPISODE_NUMBER;
					modelData.reviewEpisodeRowId = data[0].EPISODE_ROW_ID;
					modelData.reviewHospitalNum = data[0].HOSPITAL_NUMBER;
					modelData.reviewPatientRowId = data[0].PATIENT_ROW_ID;
					/*   Below validations are used to check the response structure and creating array and object accordingly  */
					var aIns = data, aTemp, ainsTable=[];
			/* creating unique array for iconTabBAr*/
			var aUnique = [];
			aUnique.push(aIns[0]);
			aIns.forEach(function (item) {
				aTemp = aUnique.filter(function (val) {
					return item.INSURANCE_CODE === val.INSURANCE_CODE ;
				});
				if (aTemp.length === 0) {
					aUnique.push(item);
				}
			});
			console.log(aUnique);	
			aUnique.forEach(function(insurance){
					var submitObj = {
									"insuranceNameEn": insurance.INSURANCE_NAME_EN,
									"insuranceNameTh": insurance.INSURANCE_NAME_TH,
									"payerCode": insurance.PAYOR_CODE,
									"planCode": insurance.PLAN_CODE,
									"policyNumber": insurance.POLICY_NUMBER,
									"rank": insurance.RANK,
									"reserveNumber": insurance.RESERVE_NUMBER,
									"reserveStatus": insurance.RESERVE_STATUS,
									"reserveStatusCode": insurance.RESERVE_STATUS_CODE_IMS,
									"typeOfInsured": insurance.TYPE_OF_INSURED,
									"message": "",
									"stateValue": "None"
								};
			ainsTable.push(submitObj);
			
				var obj = {
							insTableArray: ainsTable
					    	};
				modelData.submitReview.push(obj);
			});
			oModel.updateBindings();	
					
					
					// modelData.reviewEpisodeClmTypeId = data.EPISODE_CLAIM_TYPE_MAP_ID;
					// modelData.reviewEpisodeNumber = data.EPISODE_NUMBER;
					// modelData.reviewEpisodeRowId = data.EPISODE_ROW_ID;
					// modelData.reviewHospitalNum = data.HOSPITAL_NUMBER;
					// modelData.reviewPatientRowId = data.PATIENT_ROW_ID;
					// if (Array.isArray(data.insuranceAll)) {
					// 	data.insuranceAll.forEach(function (value) {
					// 		if (Array.isArray(value.insurance)) {
					// 			var insTableArray = [];
					// 			var singleIns = value.insurance[0];
					// 			var submitObj = {
					// 				"insuranceNameEn": singleIns.INSURANCE_NAME_EN,
					// 				"insuranceNameTh": singleIns.INSURANCE_NAME_TH,
					// 				"payerCode": singleIns.PAYOR_CODE,
					// 				"planCode": singleIns.PLAN_CODE,
					// 				"policyNumber": singleIns.POLICY_NUMBER,
					// 				"rank": singleIns.RANK,
					// 				"reserveNumber": singleIns.RESERVE_NUMBER,
					// 				"reserveStatus": singleIns.RESERVE_STATUS,
					// 				"reserveStatusCode": singleIns.RESERVE_STATUS_CODE_IMS,
					// 				"typeOfInsured": singleIns.TYPE_OF_INSURED,
					// 				"message": "",
					// 				"stateValue": "None"
					// 			};
					// 			insTableArray.push(submitObj);
					// 			var obj = {
					// 				insTableArray: insTableArray
					// 			};
					// 			modelData.submitReview.push(obj);
					// 			oModel.updateBindings();
					// 		} else if (Array.isArray(value.insurance) === false) {
					// 			var objData = value.insurance;
					// 			var submitNewObj = {
					// 				"insuranceNameEn": objData.INSURANCE_NAME_EN,
					// 				"insuranceNameTh": objData.INSURANCE_NAME_TH,
					// 				"payerCode": objData.PAYOR_CODE,
					// 				"planCode": objData.PLAN_CODE,
					// 				"policyNumber": objData.POLICY_NUMBER,
					// 				"rank": objData.RANK,
					// 				"reserveNumber": objData.RESERVE_NUMBER,
					// 				"reserveStatus": objData.RESERVE_STATUS,
					// 				"reserveStatusCode": objData.RESERVE_STATUS_CODE_IMS,
					// 				"typeOfInsured": objData.TYPE_OF_INSURED,
					// 				"message": "",
					// 				"stateValue": "None"
					// 			};
					// 			var arrayForIns = [];
					// 			arrayForIns.push(submitNewObj);
					// 			var objForIns = {
					// 				insTableArray: arrayForIns
					// 			};
					// 			modelData.submitReview.push(objForIns);
					// 			oModel.updateBindings();
					// 		}
					// 	});
					// } else if (Array.isArray(data.insuranceAll) === false) {
					// 	if (Array.isArray(data.insuranceAll.insurance)) {
					// 		var insTableArray = [];

					// 		var insNewData = data.insuranceAll.insurance;
					// 		insNewData.forEach(function (item) {
					// 			var submitObj = {
					// 				"insuranceNameEn": insNewData.INSURANCE_NAME_EN,
					// 				"insuranceNameTh": insNewData.INSURANCE_NAME_TH,
					// 				"payerCode": insNewData.PAYOR_CODE,
					// 				"planCode": insNewData.PLAN_CODE,
					// 				"policyNumber": insNewData.POLICY_NUMBER,
					// 				"rank": insNewData.RANK,
					// 				"reserveNumber": insNewData.RESERVE_NUMBER,
					// 				"reserveStatus": insNewData.RESERVE_STATUS,
					// 				"reserveStatusCode": insNewData.RESERVE_STATUS_CODE_IMS,
					// 				"typeOfInsured": insNewData.TYPE_OF_INSURED,
					// 				"message": "",
					// 				"stateValue": "None"
					// 			};
					// 			insTableArray.push(submitObj);
					// 		});

					// 		if (modelData.submitReview.length === 0) {
					// 			var obj = {
					// 				insTableArray: insTableArray
					// 			};
					// 			modelData.submitReview.push(obj);
					// 		}

					// 		oModel.updateBindings();

					// 	} else if (Array.isArray(data.insuranceAll.insurance) === false) {
					// 		var insData = data.insuranceAll.insurance;
					// 		var submitObj = {

					// 			"insuranceNameEn": insData.INSURANCE_NAME_EN,
					// 			"insuranceNameTh": insData.INSURANCE_NAME_TH,
					// 			"payerCode": insData.PAYOR_CODE,
					// 			"planCode": insData.PLAN_CODE,
					// 			"policyNumber": insData.POLICY_NUMBER,
					// 			"rank": insData.RANK,
					// 			"reserveNumber": insData.RESERVE_NUMBER,
					// 			"reserveStatus": insData.RESERVE_STATUS,
					// 			"reserveStatusCode": insData.RESERVE_STATUS_CODE_IMS,
					// 			"typeOfInsured": insData.TYPE_OF_INSURED,
					// 			"message": "",
					// 			"stateValue": "None"
					// 		};
					// 		if (modelData.submitReview.length === 0) {
					// 			var array = [];
					// 			array.push(submitObj);
					// 			var newObj = {
					// 				insTableArray: array
					// 			};
					// 			modelData.submitReview.push(newObj);
					// 		}
					// 		oModel.updateBindings();
					// 	}
					//}
				},
				error: function (e) {

				}
			});
		},
		_fetchToken: function () {
			var token;
			$.ajax({
				url: '/bdms/ims/reg/Registration_Service/XSJS/CsrfReturn.xsjs',
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				},
				error: function (result, xhr, data) {
					MessageToast.show("Unable to fetch the token,Please login");
				}
			});
			return token;
		},
		onBackPress: function () {
			/*    on back button press go to verify patient view    */
			var model = this.getOwnerComponent().getModel("appModel");
			model.getData().navigatingFromIdentification = false;
			model.updateBindings();
			this._router.navTo("RouteVerifyPatientIdentity");
		},

		onSubmitAllPress: function (oEvent) {
			/* call create or update service on press of submit all button   */
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var tempArray = [];
			var inputInsData = [];

			modelData.submitReview.forEach(function (item) {
				// change the value of comparision	
				item.insTableArray.forEach(function (val) {
					if (val.reserveStatusCode === "1") {
						tempArray.push(val);
					}
				});

			});
			if (tempArray.length > 0) {
				// to update reserve number to hms
				modelData.submitReview.forEach(function (item) {
					item.insTableArray.forEach(function (val) {
						var inputInsObj = {
							"plan_code": val.planCode,
							"rank_payor_office_code": "123",
							"payor_office_code": val.payerCode,
							"reserve_number": val.reserveNumber,
							"status": val.reserveStatus,
							"get_datetime": "",
							"cancel_datetime": "",
							"claim": [{
								"number": null,
								"status": null,
								"get_datetime": null,
								"cancel_datetime": null
							}],
							"total_approved_amount": null,
							"total_not_cover_amount": null

						};

						inputInsData.push(inputInsObj);
					});

				});
				var inputToUpdate = {

					"bu_code": "H001",
					"clinic_location": "C001",
					"hospital_username": "Cashier", //loggedin user
					"requested_datetime": "2018-12-14T12:34:56",
					"interface_identifier": "HMS-IMS006",
					"hn": modelData.reviewHospitalNum,
					"en": modelData.reviewEpisodeNumber,
					"patient_row_id": modelData.reviewPatientRowId,
					"encounter_row_id": modelData.reviewEpisodeRowId,
					"reservtion": inputInsData
				};

				$.ajax({
					url: "/http/v1/registration/claimreservation/update",
					type: 'POST',
					data: JSON.stringify(inputToUpdate),
					contentType: "application/json",
					processData: false,
					success: function (data) {
						modelData.submitReview.forEach(function (a) {
							a.insTableArray.forEach(function (b) {
								b.message = "Success";
								b.stateValue = "Success";

							});
						});
						oModel.updateBindings();
					},
					error: function (e) {
						modelData.submitReview.forEach(function (a) {
							a.insTableArray.forEach(function (b) {
								b.message = "Success";
								b.stateValue = "Success";

							});
						});
						oModel.updateBindings();
					}
				});
			} else {
				inputInsData = [];
				modelData.submitReview.forEach(function (item) {
					item.insTableArray.forEach(function (val) {
						var dataInput = {
							"plan_code": val.planCode,
							"rank_payor_office_code": "123",
							"payor_office_code": val.payerCode,
							"reserve_number": val.reserveNumber
						};
						inputInsData.push(dataInput);
					});
				});
				var inputToCreate = {
					"bu_code": "H001",
					"clinic_location": "C001",
					"hospital_username": "Cashier",
					"requested_datetime": "2018-12-14T12:34:56",
					"interface_identifier": "HMS-IMS005",
					"hn": "01-18-000012",
					"en": "O01-18-018211",
					"data": inputInsData,
					"patient_row_id": 23902,
					"encounter_row_id": 29511
				};
				$.ajax({
					url: "/http/v1/registration/claimreservation/create",
					type: 'POST',
					data: JSON.stringify(inputToCreate),
					contentType: "application/json",
					processData: false,
					success: function (data) {
						// oModel.getData().episodeClaimTypeMapId = data.episodeClaimTypeMapId;
						// oModel.updateBindings();
					},
					error: function (e) {

					}
				});
			}
		}
	});
});