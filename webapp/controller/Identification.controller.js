sap.ui.define([
	"in/BDMSInsurance/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"in/BDMSInsurance/model/formatter"
], function (BaseController, MessageToast, MessageBox, Filter, formatter) {
	"use strict";

	return BaseController.extend("in.BDMSInsurance.controller.Identification", {
		formatter: formatter,

		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			var currentDate = this.getCurrentTime();
			// below details should be fetched from the url parameter and send to get patient header details
			var inputForPatientHeader = {
				"bu_code": "B001",
				"clinic_location": "MedConsult",
				"hospital_username": "Jack",
				"requested_datetime": currentDate,
				"en": "E023",
				"hn": "H001",
				"pre_arrangement_no": "789432"
			};
			this.getHeaderDeatils(inputForPatientHeader);
			var modelData = oComponent.getModel("appModel").getData();
			modelData.insuranceDetailsTable.unshift({
				"insCode": "",
				"insurance": "",
				"clmGroup": "",
				"clmType": "",
				"policyNumber": "",
				"policyStatus": "",
				"policyStatusCode": "",
				"genId": "",
				"qrCode": "",
				"clmGrpCode": "",
				"clmtTypeCode": "",
				"commMethod": "",
				"commLanguage": "",
				"bPolicyEnabled": false
			});
			oComponent.getModel("appModel").refresh();
			this._getServiceData();
		},

		/** Fetching the Patient Details. 
		 * @param {object} [headerInput] Payload for the patient details
		 */
		getHeaderDeatils: function (headerInput) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			$.ajax({
				url: "/http/v1/registration/patientdetails/get",
				type: "POST",
				data: JSON.stringify(headerInput),
				async: false,
				contentType: "application/json",
				success: function (data) {
					var headerData = data.patient;
					modelData.patientDetails = headerData;
					modelData.startDate = headerData.episodePeriod.start;
					modelData.endDate = headerData.episodePeriod.end;
					// if thai data available display thai else display english
					if (modelData.patientDetails.firstNameTh !== "") {
						modelData.firstNameHeader = modelData.patientDetails.firstNameTh;
					} else {
						modelData.firstNameHeader = modelData.patientDetails.firstNameEn;
					}
					if (modelData.patientDetails.middleNameTh !== "") {
						modelData.middleNameHeader = modelData.patientDetails.middleNameTh;
					} else {
						modelData.middleNameHeader = modelData.patientDetails.middleNameEn;
					}
					if (modelData.patientDetails.lastNameTh !== "") {
						modelData.lastNameHeader = modelData.patientDetails.lastNameTh;
					} else {
						modelData.lastNameHeader = modelData.patientDetails.lastNameEn;
					}
					if (modelData.patientDetails.titleTh !== "") {
						modelData.titleHeader = modelData.patientDetails.titleTh;
					} else {
						modelData.titleHeader = modelData.patientDetails.titleEn;
					}
					oModel.updateBindings();
				},
				error: function (e) {

				}
			});
		},

		/* Service call for insurance, claim group, claimtype, product type, policy status, hospital info*/
		_getServiceData: function () {
			var oMdlApp = this.getOwnerComponent().getModel("appModel");
			var modelData = oMdlApp.getData();
			var productType = modelData.patientDetails.productType;
			var buCode = modelData.patientDetails.buCode;
			var productTypeCode = "001";
			var insUrl = "/bdms/ims/reg/Registration_Service/XSJS/Insurance.xsjs?stageName=RESERVATION&buCode=" + buCode + "&productTypeCode=" +
				productTypeCode;
			$.ajax({
				url: insUrl,
				type: "GET",
				contentType: "application/json",
				success: function (data) {
					modelData.insurances = data.insuranceDetailsComp;
				},
				error: function (e) {

				}
			});

			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			// Claim Group Sevice Integration
			oModel.read("/ClaimGroup?$format=json", {
				success: function (data) {
					$.each(data.results, function (index, value) {
						value.SLNO = index + 1;
					});
					modelData.claimGroupData = data.results;
				},
				error: function (error) {}
			});
			// Hospital logo and name Sevice Integration
			oModel.read("/HospitalInfo('001')?$format=json", {
				success: function (data) {
					var aFilterResults = [];
					aFilterResults.push(data);
					if (aFilterResults.length) {
						oMdlApp.setProperty("/hospitalName", aFilterResults[0].BU_NAME_EN);
						oMdlApp.setProperty("/hospitalLogo", aFilterResults[0].BU_LOGO_URL);
					} else {
						oMdlApp.setProperty("/hospitalName", "");
						oMdlApp.setProperty("/hospitalLogo", "");
					}
					oMdlApp.refresh();
				},
				error: function (error) {
					oMdlApp.setProperty("/hospitalName", "");
					oMdlApp.setProperty("/hospitalLogo", "");
					oMdlApp.refresh();
				}
			});
			// Product Type Sevice Integration
			oModel.read("/ProductType?$format=json&$filter=HMS_PRODUCT_TYPE eq '" + productType + "'", {
				success: function (data) {
					oMdlApp.setProperty("/productType", data.results);
				},
				error: function (error) {}
			});
		},
		/* Exit the application */
		onCloseButtonPress: function () {
			this.onCloseApp();
		},
		/* Live search in insurance fragment */
		onSearchDialogIns: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var contains = sap.ui.model.FilterOperator.Contains;
				var filters = new sap.ui.model.Filter([
						new sap.ui.model.Filter("insuranceNameEn", contains, sQuery),
						new sap.ui.model.Filter("insuranceNameTh", contains, sQuery)
					],
					false);
			}
			var tableData = this.byId("idInsSelectTable");
			var binding = tableData.getBinding("items");
			binding.filter(filters);
		},

		/* Live search in claim group fragment */
		onSearchDialogClaimGroup: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var contains = sap.ui.model.FilterOperator.Contains;
				var filters = new sap.ui.model.Filter("CLAIM_GROUP_DESC", contains, sQuery);
			}
			var tableData = this.byId("idClmGrpTable");
			var binding = tableData.getBinding("items");
			binding.filter(filters);
		},

		/* Live search in claim type fragment */
		onSearchDialogClaimType: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var contains = sap.ui.model.FilterOperator.Contains;
				var filters = new sap.ui.model.Filter("CLAIM_TYPE_DESC", contains, sQuery);
			}
			var tableData = this.byId("idClmTypeTable");
			var binding = tableData.getBinding("items");
			binding.filter(filters);
		},
		/* Adding row in the insurance table. Row cannot be added if the previous row is empty. */
		onAddRow: function () {
			var newRow = {
				"insCode": "",
				"insurance": "",
				"clmGroup": "",
				"clmType": "",
				"policyNumber": "",
				"policyStatus": "",
				"policyStatusCode": "",
				"genId": "",
				"qrCode": "",
				"clmGrpCode": "",
				"clmtTypeCode": "",
				"commMethod": "",
				"commLanguage": "",
				"bPolicyEnabled": false
			};
			var oModel = this.getOwnerComponent().getModel("appModel");
			var tableData = oModel.getData().insuranceDetailsTable;
			var tableLength = tableData.length;
			if (tableLength === 0) {
				tableData.push(newRow);
			} else {
				var clmGrpVal = tableData[tableLength - 1].clmGroup;
				var clmTypeVal = tableData[tableLength - 1].clmType;
				var insuranceVal = tableData[tableLength - 1].insurance;
				if (clmGrpVal === "" || clmTypeVal === "" || insuranceVal === "") {
					this.showErrorMessage(this.getResourceBundle().getText("LAST_ROW_EMPTY"));
				} else {
					tableData.push(newRow);
				}
			}
			oModel.updateBindings();
		},
		/* Open insurance fragment */
		onSearchIns: function (oEvent) {
			var selectedId = oEvent.getParameter("id");
			this.path = selectedId.split("-")[4];
			if (!this._Dialog) {
				this._Dialog = sap.ui.xmlfragment(this.getView().getId(), "in.BDMSInsurance.Fragments.addInsurance", this);
				this.getView().addDependent(this._Dialog);
			}
			this._Dialog.open();
		},
		/* Close insurance fragment */
		onCancelIns: function (oEvent) {
			this.getView().byId("idInsSelectTable").removeSelections(true);
			this.getView().byId("idAddIns").close();
		},

		/*  Open claim group fragment   */
		onSearchClmGrp: function (oEvent) {
			var selectedId = oEvent.getParameters("id").id;
			this.path = selectedId.split("-")[4];
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var data = this.getView().getModel("appModel").getProperty(path);
			if (data.insurance) {
				if (!this._Dialog1) {
					this._Dialog1 = sap.ui.xmlfragment(this.getView().getId(), "in.BDMSInsurance.Fragments.addClaimGroup", this);
					this.getView().addDependent(this._Dialog1);
				}
				this._Dialog1.open();
			} else {
				MessageToast.show(this.getResourceBundle().getText("PLS_SEL_INS"));
			}
		},

		/* Close claim group fragment   */
		onCancelClmGrp: function (oEvent) {
			this.getView().byId("idClmGrpTable").removeSelections(true);
			this.getView().byId("idAddClmGrp").close();
		},

		/* Open claim type fragment explicitly */
		onSearchClmType: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var data = this.getView().getModel("appModel").getProperty(path);
			if (data.insCode && data.clmGrpCode) {
				this.callClaimType(data.insCode, data.clmGrpCode);
			} else {
				MessageToast.show(this.getResourceBundle().getText("PLS_SEL_CG_CT"));
			}
		},

		/* Call calim type service based on selected insurance code and claim group code */
		callClaimType: function (ins, clmGrp) {
			var appModel = this.getOwnerComponent().getModel("appModel");
			this.byId("idIdentificationPage").setBusy(true);
			var modelData = appModel.getData();
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			modelData.claimTypeData = [];
			var that = this;
			oModel.read("/ClaimType?$format=json&$filter=INSURANCE_CODE eq '" + ins + "' and CLAIM_GROUP_CODE eq '" +
				clmGrp + "'", {
					success: function (data) {
						that.byId("idIdentificationPage").setBusy(false);
						if (data.results.length === 1) {
							modelData.insuranceDetailsTable[that.path].clmType = data.results[0].CLAIM_TYPE_DESC;
							modelData.insuranceDetailsTable[that.path].clmtTypeCode = data.results[0].CLAIM_TYPE_CODE;
						} else if (data.results.length === 0) {
							MessageToast.show("No Claim Type found for the selected Insurance and Claim Group");
							modelData.insuranceDetailsTable[that.path].clmType = "";
						} else {
							$.each(data.results, function (index, value) {
								value.SLNO = index + 1;
							});
							modelData.claimTypeData = data.results;
							setTimeout(function () {
								if (!that._Dialog2) {
									that._Dialog2 = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.addClaimType", that);
									that.getView().addDependent(that._Dialog2);
								}
								that._Dialog2.open();
							}, 0);
						}
						appModel.updateBindings();
					},
					error: function (error) {
						that.byId("idIdentificationPage").setBusy(false);
					}
				});
		},

		/* Close claim type fragment   */
		onCancelClmTyp: function (oEvent) {
			this.getView().byId("idClmTypeTable").removeSelections(true);
			this.getView().byId("idAddClmType").close();
		},

		/* Fetch x-csrf token */
		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bdms/ims/reg/Registration_Service/XSJS/CsrfReturn.xsjs",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				},
				error: function (result, xhr, data) {
					MessageToast.show("Unable to fetch the token. Please login again.");
				}
			});
			return token;
		},

		/* On next button press, calling CreateUpdatePatientDetails service and navigating to verify patient view */
		onNextPress: function () {
			var oToken = this._fetchToken();
			var oIdentPage = this.byId("idIdentificationPage");
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var dateOfAdmission = this.getCurrentTime();
			var tableData = modelData.insuranceDetailsTable;
			var tableLength = tableData.length;
			var clmGrpVal = tableData[tableLength - 1].clmGroup;
			var clmTypeVal = tableData[tableLength - 1].clmType;
			var insuranceVal = tableData[tableLength - 1].insurance;

			if (clmGrpVal === "" || clmTypeVal === "" || insuranceVal === "") {
				this.showErrorMessage(this.getResourceBundle().getText("FILL_LAST_ROW"));
			} else {
				oIdentPage.setBusy(true);
				var inputToCreateUpdatePatient = {
					"hospitalNumber": modelData.patientDetails.hospitalNumber,
					"buCode": modelData.patientDetails.buCode,
					"titleTH": modelData.patientDetails.titleTh,
					"titleEN": modelData.patientDetails.titleEn,
					"firstNameTH": modelData.patientDetails.firstNameTh,
					"middleNameTH": modelData.patientDetails.middleNameTh,
					"lastNameTH": modelData.patientDetails.lastNameTh,
					"firstNameEN": modelData.patientDetails.firstNameEn,
					"middleNameEN": modelData.patientDetails.middleNameEn,
					"lastNameEN": modelData.patientDetails.lastNameEn,
					"dob": modelData.patientDetails.birthDate,
					"age": modelData.patientDetails.age,
					"genderCode": modelData.patientDetails.gender,
					"passportNumber": modelData.patientDetails.passportNumber,
					"createdDate": modelData.startDate,
					"clinic": modelData.patientDetails.clinic,
					"periodStartDate": modelData.startDate,
					"periodEndDate": modelData.endDate,
					"procedureDesc": modelData.patientDetails.procedure,
					"nationalID": modelData.patientDetails.nationalId,
					"episodeNumber": modelData.patientDetails.episodeNumber,
					"productTypeCode": modelData.selectedPdType,
					"episodeStatusCode": "ES01",
					"dateofAdmission": "",
					"timeofAdmission": "",
					"location": modelData.patientDetails.location,
					"patientRowID": modelData.patientDetails.patientRowId,
					"episodeRowID": "",
					"requestedUserID": "",
					"requestedDate": "",
					"requestedTime": ""
				};
				$.ajax({
					url: "/bdms/ims/reg/Registration_Service/XSJS/CreateUpdatePatientDetails.xsjs",
					type: "POST",
					data: JSON.stringify(inputToCreateUpdatePatient),
					contentType: "application/json",
					headers: {
						"X-CSRF-Token": oToken
					},
					success: function (data) {
						modelData.createPatientDetCode = data.Code;
						modelData.createPatientDetEpisodeCode = data.episodeCode;
						modelData.patientCode = data.patientCode;
						modelData.navigatingFromIdentification = true;
						oModel.updateBindings();
						oIdentPage.setBusy(false);
						this._router.navTo("RouteVerifyPatientIdentity");
					}.bind(this),
					error: function (e) {
						this.showErrorMessage(this.getResourceBundle().getText("PATIENT_DETAILS_FAILED"));
						oIdentPage.setBusy(false);
					}.bind(this)
				}, this);
			}
		},

		/*  addInsurance.fragment.xml - On done button press, adding insurance to the table */
		confirmInsurance: function (oEvent) {
			var oModel = this.getView().getModel("appModel");
			var tableItemselected = this.getView().byId("idInsSelectTable").getSelectedItems()[0];
			if (tableItemselected) { // If the user has selected any insurance.
				var path = tableItemselected.getBindingContextPath();
				var selectedItem = oModel.getProperty(path);
				oModel.getData().insuranceDetailsTable[this.path].insurance = selectedItem.insuranceNameEn;
				oModel.getData().insuranceDetailsTable[this.path].insCode = selectedItem.insuranceCode;
				oModel.getData().insuranceDetailsTable[this.path].commMethod = selectedItem.commMethod;
				oModel.getData().insuranceDetailsTable[this.path].commLanguage = selectedItem.commLang;
				oModel.getData().selectedInsCode = selectedItem.insuranceCode;
				oModel.updateBindings();
				this.getPolicyStatus(selectedItem.insuranceCode); // Fetch policy status for the selected insurance.
				this.onCancelIns();
			} else {
				MessageToast.show("Please select an Insurance");
			}
		},

		/** On selection of Insurance fetch the respective policy status.
		 * @param {string} [sInsuranceCode] Selected insurance code.
		 */
		getPolicyStatus: function (sInsuranceCode) {
			var oMdlApp = this.getOwnerComponent().getModel("appModel");
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModel.read("/PolicyStatus?$format=json&$filter=INSURANCE_CODE eq '" + sInsuranceCode + "'", {
				success: function (data) {
					oMdlApp.getData().insuranceDetailsTable[this.path].policyStatusData = data.results;
					oMdlApp.getData().insuranceDetailsTable[this.path].bPolicyEnabled = true;
					oMdlApp.updateBindings();
				}.bind(this),
				error: function (error) {}
			}, this);
		},

		/* addClaimGroup.fragment.xml - On done button press, adding claim group to the table */
		confirmClaimGroup: function (oEvent) {
			var oModel = this.getView().getModel("appModel");
			var oTable = this.getView().byId("idClmGrpTable");
			if (oTable.getSelectedItems().length !== 0) {
				var tableItemselected = oTable.getSelectedItems()[0];
				var path = tableItemselected.getBindingContextPath();
				var selectedItem = oModel.getProperty(path);
				oModel.getData().insuranceDetailsTable[this.path].clmGroup = selectedItem.CLAIM_GROUP_DESC;
				oModel.getData().insuranceDetailsTable[this.path].clmGrpCode = selectedItem.CLAIM_GROUP_CODE;
				oModel.getData().selectedClmGrpCode = selectedItem.CLAIM_GROUP_CODE;
				oModel.updateBindings();
				this.onCancelClmGrp();
				this.callClaimType(oModel.getData().selectedInsCode, oModel.getData().selectedClmGrpCode);
			} else {
				MessageToast.show("Please select a Claim Group");
			}
		},

		/* addClaimType.fragment.xml - On done button press, adding claim type to the table */
		confirmClaimType: function () {
			var oModel = this.getView().getModel("appModel");
			var oTable = this.getView().byId("idClmTypeTable");
			if (oTable.getSelectedItems().length !== 0) {
				var tableItemselected = oTable.getSelectedItems()[0];
				var path = tableItemselected.getBindingContextPath();
				var selectedItem = oModel.getProperty(path);
				oModel.getData().insuranceDetailsTable[this.path].clmType = selectedItem.CLAIM_TYPE_DESC;
				oModel.getData().insuranceDetailsTable[this.path].clmtTypeCode = selectedItem.CLAIM_TYPE_CODE;
				oModel.getData().selectedClmTypeCode = selectedItem.CLAIM_TYPE_CODE;
				this.onCancelClmTyp();
				oModel.updateBindings();
			} else {
				MessageToast.show("Please select a Claim Type");
			}
		},

		/* On copy button press, adding corresponding insurance, claim group, claim type to a new row in the table */
		onCopyPress: function (oEvent) {
			var oModel = this.getView().getModel("appModel");
			var insuranceTableData = oModel.getData().insuranceDetailsTable;
			var selectedPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var dataToCopy = oModel.getProperty(selectedPath);
			var newData = {
				"insCode": dataToCopy.insCode,
				"insurance": dataToCopy.insurance,
				"clmGroup": dataToCopy.clmGroup,
				"clmType": dataToCopy.clmType,
				"policyNumber": "",
				"policyStatus": "",
				"policyStatusCode": "",
				"genId": "",
				"qrCode": "",
				"clmGrpCode": dataToCopy.clmGrpCode,
				"clmtTypeCode": dataToCopy.clmtTypeCode
			};
			insuranceTableData.push(newData);
			oModel.refresh();
		},

		/* On delete button press, deleting selected checkboxes on the table */
		onDeleteRow: function (oEvent) {
			var oModel = this.getView().getModel("appModel");
			var oTable = this.getView().byId("idProductsTable");
			var seletedRow = oTable.getSelectedItems();
			if (seletedRow.length !== 0) {
				for (var i = seletedRow.length; i > 0; i--) {
					var path = seletedRow[i - 1].getBindingContext("appModel").getPath();
					var selectedIndex = parseInt(path.split("/")[2], 0);
					var oTableData = oModel.getData().insuranceDetailsTable;
					oTableData.splice(selectedIndex, 1);
				}
				oTable.removeSelections();
			} else {
				MessageToast.show("Please select item to delete");
			}
			oModel.refresh();
		}
	});
});