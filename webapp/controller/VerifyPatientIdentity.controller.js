sap.ui.define([
	"in/BDMSInsurance/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"in/BDMSInsurance/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageStrip",
	"sap/m/Dialog",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, MessageToast, MessageStrip, Dialog, MessageBox) {
	"use strict";
	return BaseController.extend("in.BDMSInsurance.controller.VerifyPatientIdentity", {
		formatter: formatter,
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("RouteVerifyPatientIdentity").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			if (modelData.selectedInsCode === "") {
				modelData.getServiceCall = false;
				oModel.updateBindings();
				var dialog = new sap.m.BusyDialog("idBusyDialog", {
					text: "No Insurance Selected !!!Redirecting to the previous screen"
				});
				dialog.open();
				jQuery.sap.delayedCall(3500, this, function () {
					dialog.close();
					that._router.navTo("RouteIdentification");
				});
			} else {
				this._getServiceData();
				modelData.getServiceCall = true;
				oModel.updateBindings();
				if (modelData.navigatingFromIdentification === true) {
					// D: Adding ALL to the status dropdown for filtering
					modelData.policyStatus.unshift({
						"POLICY_STATUS": "All",
						"POLICY_STATUS_CODE": "0",
						"POLICY_STATUS_DESC": "All"
					});
					this.getIconTabBar();
				}
			}
		},
		getIconTabBar: function () {
			var that = this,
				tempArray, obj;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var selectedInsurance = modelData.insuranceDetailsTable;
			/* creating unique array for iconTabBAr*/
			var array = [];
			array.push(selectedInsurance[0]);
			selectedInsurance.forEach(function (item) {
				tempArray = array.filter(function (val) {
					return item.insCode === val.insCode && item.clmGrpCode === val.clmGrpCode && item.clmtTypeCode === val.clmtTypeCode;
				});
				if (tempArray.length === 0) {
					array.push(item);
				}
			});
			modelData.iconTabBarData = [];
			array.forEach(function (a, index) {
				obj = {
					"clmGroup": a.clmGroup,
					"clmType": a.clmType,
					"insCode": a.insCode,
					"clmGrpCode": a.clmGrpCode,
					"clmtTypeCode": a.clmtTypeCode,
					"insurance": a.insurance,
					"key": index,
					"accpanelVisible": false,
					verifyPatientTable: [],
					accCause: [],
					accOrgan: [],
					coverageTable: [],
					followUpNotes: [],
					localInsTable: [],
					"verifyPatientFragment": true,
					"getPolicyFragment": false,
					"addPolicyButton": false,
					"backFirstVisible": true,
					"compareVisible": true,
					"reqReservedButton": true,
					"followUpVisibility": false,
					/* D: Added All for making default selection of all for status */
					"headerStatus": "All",
					/* D: Added 0 as parameter for making default selection of all for status */
					"headerStatusCode": "0",
					"benRemValue": "",
					"rank": "",
					"status": "",
					"accidentDateTime": "",
					"requireBtn": false,
					"followNoteBtn": false,
					"deleteBtn": true,
					"addBtn": true,
					"reserveBtn": true,
					// "reviewButton": false,
					"gauranteeBtn": false,
					"episodeClaimTypeMapId": "",
					"backBtn": false

				};
				var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata";
				var logoModel = new sap.ui.model.odata.ODataModel(sUrl, true);
				logoModel.read("/Insurance?$filter=INSURANCE_CODE eq '" + a.insCode + "'", {
					async: false,
					success: function (data) {
						var logo1 = data.results[0].INSURANCE_LOGO_URL;
						obj.insLogo = logo1;
						//debugger;
						if (a.commMethod === "WEBSITE") {
							obj.verifyPatientFragment = false;
							obj.localInsuranceFragment = true;
						}
						if (a.clmGrpCode === "02") {
							obj.accpanelVisible = true;
						}
						modelData.iconTabBarData.push(obj);
						modelData.iconTabBarData[index].verifyPatientTable.unshift({
							"system": "HIS",
							"id": modelData.patientDetails.nationalId,
							"idType": "",
							"fNameThai": modelData.patientDetails.firstNameTh,
							"mNameThai": modelData.patientDetails.middleNameTh,
							"lNameThai": modelData.patientDetails.lastNameTh,
							"fNameEn": modelData.patientDetails.firstNameEn,
							"mNameEn": modelData.patientDetails.middleNameEn,
							"lNameEn": modelData.patientDetails.lastNameEn,
							"dob": modelData.patientDetails.birthDate,
							"gender": modelData.patientDetails.gender
						});
						if (index === 0) {
							/* if not local insurance call bindverify table*/
							if (a.commMethod !== "WEBSITE") {
								that.bindVerifyTable(a, index);
							} else {
								that.getInsTypeLocal(a.insCode);
							}
						}
						oModel.updateBindings();
					},
					error: function (error) {
						var logo1 = "";
						obj.insLogo = logo1;
						if (a.commMethod === "WEBSITE") {
							obj.verifyPatientFragment = false;
							obj.localInsuranceFragment = true;
						}
						if (a.clmGrpCode === "02") {
							obj.accpanelVisible = true;
						}
						modelData.iconTabBarData.push(obj);
						modelData.iconTabBarData[index].verifyPatientTable.unshift({
							"system": "HIS",
							"id": modelData.patientDetails.nationalId,
							"idType": "",
							"fNameThai": modelData.patientDetails.firstNameTh,
							"mNameThai": modelData.patientDetails.middleNameTh,
							"lNameThai": modelData.patientDetails.lastNameTh,
							"fNameEn": modelData.patientDetails.firstNameEn,
							"mNameEn": modelData.patientDetails.middleNameEn,
							"lNameEn": modelData.patientDetails.lastNameEn,
							"dob": modelData.patientDetails.birthDate,
							"gender": modelData.patientDetails.gender
						});
						if (index === 0) {
							/* if not local insurance call bindverify table*/
							if (a.commMethod !== "WEBSITE") {
								that.bindVerifyTable(a, index);
							} else {
								that.getInsTypeLocal(a.insCode);
							}
						}
						oModel.updateBindings();
					}
				});
			});
		},
		bindVerifyTable: function (val, index) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var obj;
			var contentData = {
				"insuranceName": val.insurance,
				"patientDetails": [{
					"firstName": modelData.firstNameHeader,
					"middleName": modelData.middleNameHeader,
					"lastName": modelData.lastNameHeader,
					"birthDate": modelData.patientDetails.birthDate,
					"gender": modelData.patientDetails.gender,
					"identityNumber": modelData.patientDetails.nationalId,
					"identityType": "",
					"contractNumber": [
						""
					]
				}]
			};
			$.ajax({
				url: "/http/insureridentification",
				type: "POST",
				data: JSON.stringify(contentData),
				contentType: "application/json",
				processData: false,
				success: function (data) {
					data.forEach(function (a) {
						obj = {
							"system": "INS",
							"id": "",
							"idType": a.identityType,
							"fNameThai": a.firstName,
							"mNameThai": a.middleName,
							"lNameThai": a.lastName,
							"fNameEn": "",
							"mNameEn": "",
							"lNameEn": "",
							"dob": a.birthDate,
							"gender": a.gender
						};
						if (a.identityType.toLowerCase() === "passport") {
							obj.id = "";
							obj.idType = a.identityType;
						} else {
							obj.id = a.identityNumber;
							obj.idType = a.identityType;
						}
						var firstTableData = modelData.iconTabBarData[index].verifyPatientTable[0];
						if (firstTableData.id !== obj.id) {
							obj.idStatus = "Error";
						}
						if (firstTableData.fNameThai !== obj.fNameThai) {
							obj.fNameStatus = "Error";
						}
						if (firstTableData.mNameThai !== obj.mNameThai) {
							obj.mNameStatus = "Error";
						}
						if (firstTableData.lNameThai !== obj.lNameThai) {
							obj.lNameStatus = "Error";
						}
						if (firstTableData.dob !== obj.dob) {
							obj.dobStatus = "Error";
						}
						if (firstTableData.gender !== obj.gender) {
							obj.genderStatus = "Error";
						} else {
							obj.textStatus = "None";
						}
						var arr = modelData.iconTabBarData[index].verifyPatientTable;
						var checkData = arr.filter(function (item) {
							return (item.system === obj.system && item.id === obj.id && item.idType === obj.idType && item.fNameThai === obj.fNameThai &&
								item.mNameThai === obj.mNameThai && item.lNameThai === obj.lNameThai && item.dob === obj.dob &&
								item.gender === obj.gender);
						});
						if (checkData.length === 0) {
							arr.push(obj);
						}
						oModel.refresh();
					});
				},
				error: function (e) {}
			});
		},

		_getServiceData: function () {
			var oMdlApp = this.getOwnerComponent().getModel("appModel");
			var modelData = oMdlApp.getData();
			var buCode = modelData.patientDetails.buCode;
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModel.read("/ICD10?$format=json", {
				success: function (data) {
					modelData.icd10SearchHelp = data.results;
				},
				error: function (error) {}
			});
			oModel.read("/BuUmRole?$format=json&$filter=BU_CODE eq '" + buCode + "'", {
				success: function (data) {
					modelData.umRole = data.results;
				},
				error: function (error) {}
			});
		},
		onSelectIconTabFilter: function (oEvent) {
			/* The comparision value "WEBSITE" can be changed according to the requirement*/
			var that = this;
			var insTableData = this.getView().getModel("appModel").getData().insuranceDetailsTable;
			if (oEvent.getSource().getSelectedKey() !== "0") {
				var selectedKey = oEvent.getSource().getSelectedKey();
				var item = insTableData[selectedKey];
				if (item.commMethod !== "WEBSITE") {
					that.bindVerifyTable(item, selectedKey);
				} else if (item.commMethod === "WEBSITE") {
					that.getInsTypeLocal(item.insCode);
				}
			}
		},
		onSearchICD10: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedPath = oEvent.getSource().getBindingContext("appModel").sPath;
			oModel.getData().selectedIcd10Cause = oModel.getProperty(selectedPath);
			if (!this._icd10earch) {
				this._icd10earch = sap.ui.xmlfragment(this.getView().getId(), "in.BDMSInsurance.Fragments.ICD10searchHelp", this);
				this.getView().addDependent(this._icd10earch);
			}
			this._icd10earch.open(oEvent.getSource());
			oModel.updateBindings();
		},
		onAddFollowUpNotes: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var currentDate = this.getCurrentTime();
			var modelData = oModel.getData();
			var obj = {
				"srNum": "",
				"notes": "",
				"umNameOfUser": "USER_12",
				"umRoleCode": "001",
				"umUserCode": "002",
				"dateTime": currentDate,
				"noteAvail": 0
			};
			var tableData = modelData.followUpTable;
			var tableLength = tableData.length;
			if (tableLength === 0) {
				obj.srNum = 1;
				tableData.push(obj);
				oModel.updateBindings();
			} else {
				var umNameOfUser = tableData[tableLength - 1].umNameOfUser;
				var umRoleCode = tableData[tableLength - 1].umRoleCode;
				if (umNameOfUser === "" || umRoleCode === "") {
					this.errorDialog("Please fill in User Name and Role Code of the Last Row");
				} else {
					obj.srNum = tableLength + 1;
					tableData.push(obj);
				}
				oModel.updateBindings();
			}
		},
		onFollowUpPress: function (oEvent) {
			var that = this,
				obj;
			var oModel = this.getOwnerComponent().getModel("appModel");
			oModel.getData().datePickerText = true;
			var key = this.byId("idIconFilterBar").getSelectedKey();
			var episodeClaimTypeMapID = oModel.getData().iconTabBarData[key].episodeClaimTypeMapID;
			oModel.getData().followUpTable = [];
			oModel.updateBindings();
			var sUrl = '/bdms/ims/reg/Registration_Service/XSJS/FollowUpNoteGet.xsjs?episodeClaimTypeMapId=' + episodeClaimTypeMapID;

			$.ajax({
				url: sUrl,
				method: "GET",
				contentType: "application/json",
				success: function (data) {
					if (data.length > 0) {
						data.forEach(function (item) {
							obj = {
								"srNum": item.SrNo,
								"notes": item.MESSAGE_NOTE,
								"umNameOfUser": item.UM_NAME_OF_USER,
								"umRoleCode": item.UM_ROLE_CODE,
								"umUserCode": item.UM_USER_CODE,
								"dateTime": item.CREATED_DATE
							};
							obj.noteAvail = 1;
							oModel.getData().followUpTable.push(obj);
						});
					}
					oModel.updateBindings();
				},
				error: function (e) {}
			});
			if (!that._followUpNotes) {
				that._followUpNotes = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.followUpNotes", that);
				that.getView().addDependent(that._followUpNotes);
			}
			that._followUpNotes.open(oEvent.getSource());
		},
		onSaveFollowUp: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData(),
				aPayload = [];
			var tableData = oModel.getData().followUpTable;
			var checkData = tableData.filter(function (item) {
				return item.noteAvail === 0;
			});
			if (checkData.length === 0) {
				this.onCloseFollowUp();
			} else {
				var tableLength = tableData.length;
				var umName = tableData[tableLength - 1].umNameOfUser;
				var umRole = tableData[tableLength - 1].umRoleCode;
				if (umName === "" || umRole === "") {
					this.errorDialog("Please input User Name and  User Code, If not required,please delete the last row.");
				}
				if (umName && umRole) {
					var key = this.getView().byId("idIconFilterBar").getSelectedKey();
					checkData.forEach(function (item) {
						var obj = {
							"episodeClaimTypeMapID": modelData.iconTabBarData[key].episodeClaimTypeMapId,
							"messageCode": "",
							"assignedUserCode": "",
							"assignedroleCode": ""
						};
						aPayload.push(obj);
					});
					var oToken = this._fetchToken();
					$.ajax({
						url: "/bdms/ims/reg/Registration_Service/XSJS/FollowUpNoteSave.xsjs",
						type: "POST",
						async: false,
						data: JSON.stringify(aPayload),
						contentType: "application/json",
						processData: false,
						headers: {
							"X-CSRF-Token": oToken
						},
						success: function (data) {
							modelData.iconTabBarData[key].followUpNotes = modelData.followUpTable;
							oModel.updateBindings();
							MessageToast.show("Successfully saved follow up Notes");
						},
						error: function (e) {
							MessageToast.show("Follow up Notes can not be saved");
						}
					});
					this.onCloseFollowUp();
				}
			}
		},
		onDeleteNotes: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var tableData = oModel.getData().followUpTable;
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var index = path.split(/[\W]/)[2];
			tableData.splice(index, 1);
			if (tableData.length !== 0) {
				for (var i = 0; i < tableData.length; i++) {
					tableData[i].srNum = i + 1;
				}
			}
			this.getView().getModel("appModel").updateBindings();
		},
		onReqReserveNumClk: function (oEvent) {
			var accidentTime = this.getCurrentTime();
			var sUrlPolicyStatus = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oDataModel = new sap.ui.model.odata.ODataModel(sUrlPolicyStatus, true);
			var oModel = this.getOwnerComponent().getModel("appModel");
			var key = this.getView().byId("idIconFilterBar").getSelectedKey();
			var modelData = oModel.getData(), that = this, icd10ForSave=[],	response;
			var iconTabPath = modelData.iconTabBarData[key];
			var insPath = oEvent.getSource().getBindingContext("appModel").getPath();
			var insCode = iconTabPath.insCode, aInsuredPersons=[];
			var localInsTable = this.byId("idIconFilterBar").getItems()[key].getContent()[2].getItems()[1];
			//var selectedRows = localInsTable.getSelectedItems();
			var selectedRows = iconTabPath.localInsTable;
			//comment
		
			if (selectedRows.length > 0) {
			var checkData = selectedRows.filter(function (item) {
				return item.insuredTypeLocalKey === "";
			});
			if (checkData.length === 0) {
				if (iconTabPath.accCause.length !== 0 && iconTabPath.accOrgan.length !== 0){
				var icd10SaveCause = {
					"icdCode": iconTabPath.accCause[0].causeCode,
					"icdCodeType": "Cause"
				};
					icd10ForSave.push(icd10SaveCause);
				iconTabPath.accOrgan.forEach(function (value) {
				
					var icd10SaveOrgan = {
						"icdCode": value.organCode,
						"icdCodeType": "Organ"
					};
					icd10ForSave.push(icd10SaveOrgan);
					
				});
			}
			else{
			icd10ForSave=[];	
			}
			var ts = new Date();
			var dateTimeString = ts.toISOString();
			var dateTime = dateTimeString.split(".")[0];
            
			response = {
				"accidentDateTime": dateTime, // ask
				"accidentIcdMapping": icd10ForSave, //ask
				"admissionDateTime": dateTime,
				"admissionType": "OPD",
				"claimGroupCode": iconTabPath.clmGrpCode,
				"claimType": iconTabPath.clmType,
				"claimTypeCode": iconTabPath.clmtTypeCode,
				"creationDateTime": dateTime,
				"episodeCode": modelData.createPatientDetEpisodeCode,
				"followUpNote": [], // follow up notes is enabled only after the reservenumber is generated
				"insuranceCode": iconTabPath.insCode,
				insuredPersons: [], //ask
				"olderReserveNumber": "",
				"patientCode": modelData.patientCode,
				"preArrangementCode": "", //ask
				"rank": iconTabPath.rank,
				"relatedDocuments": [], //ask
				"reservationNumber": "",
				"reservationStatus": "success",
				"userCode": ""
			};
			
				var sUrl = "/bdms/ims/reg/Registration_Service/XSJS/GetReserveNumber.xsjs";
				$.ajax({
					url: sUrl,
					async: false,
					method: "GET",
					contentType: "application/json",
					success: function (data) {
						selectedRows.forEach(function (item) {
							// path = item.getBindingContextPath();
							// selectedRow = oModel.getProperty(path);
							response.reservationNumber = data.reserveNumber;
							item.reserveNumberLocal = data.reserveNumber;
							item.insTypeComboBoxVisible = false;
							item.insTypeTextVisible = true;
							modelData.reviewButton = true;
							/*below is the input structure for save rseerve number*/
								var obj = {
										"birthDate": modelData.patientDetails.birthDate,
										contracts: [],
										"employer": iconTabPath.insurance,
										"firstName": modelData.firstNameHeader,
										"gender": modelData.patientDetails.gender,
										"identityNumber": "AZY189842",
										"identityType": "Passport",
										insuredNotEligibleReasons: [],
										"lastName": modelData.lastNameHeader,
										"middleName": modelData.middleNameHeader,
										"title": modelData.titleHeader
									};
									var oContract = {
										confirmationDocumentUrl: "",
										contractHolder: "",
										contractNumber: item.policyNumber,
										contractType: item.insuredTypeLocalKey,
										coverages: [],
										notEligibleReasons: [],
										rank: item.rankLocal,
										status: ""
									};
									obj.contracts.push(oContract);
									aInsuredPersons.push(obj);
								
							oModel.updateBindings();
						});
						response.insuredPersons = aInsuredPersons;
						that.saveReserveNumber(response, insPath);
						oDataModel.read("/PolicyStatus?$format=json&$filter=INSURANCE_CODE eq '" + insCode + "'", {
							success: function (pdata) {
								selectedRows.forEach(function (item) {
									// var sPath = item.getBindingContextPath();
									// var tableRow = oModel.getProperty(sPath);
									item.PolicyStatusLocalArray = pdata.results;
									item.policyComboBoxVisible = true;
									item.policyTextVisible = false;
									item.actionButtonVisible = true;
								});
								oModel.updateBindings();
							},
							error: function (error) {}
						});
						localInsTable.removeSelections();
						modelData.iconTabBarData[key].deleteBtn = false;
						modelData.iconTabBarData[key].reserveBtn = false;
						modelData.iconTabBarData[key].gauranteeBtn = true;
						modelData.iconTabBarData[key].backBtn = true;
						modelData.iconTabBarData[key].followNoteBtn = true;
						modelData.iconTabBarData[key].requireBtn = true;
						modelData.docChkList = true;
						modelData.iconTabBarData[key].actionCol = true;
						oModel.updateBindings();
					},
					error: function (e) {}
				});
			} else {
				this.errorDialog("Please select Insured Type");
				// check for git
			}
			}
			else{
				this.errorDialog("Please select a coverage");	
			}
		},
		onPressReviewLog: function (oEvent) {
			var that = this;
			if (!that._reviewLog) {
				that._reviewLog = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.reviewLog", that);
				that.getView().addDependent(that._reviewLog);
			}
			that._reviewLog.open(oEvent.getSource());
		},
		onPressReqDoc: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var modelData = oModel.getData(),
				obj;
			modelData.requestedDoc = [];
			var selectedData = oModel.getProperty(path);
			var episodeClaimTypeMapId = selectedData.episodeClaimTypeMapId;
			var sUrl = "/bdms/ims/reg/Registration_Service/XSJS/RequestedDocument.xsjs?episodeClaimTypeMapId=" + episodeClaimTypeMapId;
			$.ajax({
				url: sUrl,
				type: "GET",
				async: false,
				contentType: "application/json",
				processData: false,
				success: function (data) {
					if (data.requestedDocumentArray.length > 0) {
						data.requestedDocumentArray.forEach(function (item) {
							obj = item;
							obj.sentToIns = 1;
							if (obj.isAvailable === 1) {
								obj.statusAvailable = true;
							} else {
								obj.statusError = true;
							}
							/*  && obj.assetFileUrl will be added when it ll be inserted in the data base*/
							if (obj.assetCode) {
								obj.fileUrl = obj.assetFileUrl;
								obj.dmsAvailable = true;
								obj.getStatusBtn = false;

							} else {
								if (obj.docScanAvailability === 1) {
									obj.docScanAvailable = true;
									obj.dmsAvailable = false;
									obj.getStatusBtn = false;
								} else {
									obj.getStatusBtn = true;
								}
							}
							modelData.requestedDoc.push(obj);
						});
					}
					oModel.updateBindings();
				},
				error: function (e) {}
			});
			this.getDocListData();
			var that = this;
			if (!that._reqDoc) {
				that._reqDoc = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.requestedDoc", that);
				that.getView().addDependent(that._reqDoc);
			}
			that._reqDoc.open(oEvent.getSource());
		},
		onPressGuarLetter: function (oEvent) {
			var that = this,
				obj;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData(),
				key = this.byId("idIconFilterBar").getSelectedKey();
			modelData.guranteeTable = [];
			var episodeClaimTypeMapID = oModel.getData().iconTabBarData[key].episodeClaimTypeMapID;
			var sUrl = '/bdms/ims/reg/Registration_Service/XSJS/GuaranteeLetter.xsjs?episodeClaimTypeMapId=' + episodeClaimTypeMapID;
			$.ajax({
				url: sUrl,
				type: "GET",
				async: false,
				contentType: "application/json",
				processData: false,
				success: function (data) {
					if (data.guaranteeLetterArray.length === 0) {
						obj = {
							"assetCode": "",
							"createdDate": "",
							"docCode": "",
							"docName": "",
							"fileNmae": "",
							"fileUrl": "",
							"guaranteeCode": "",
							"docAvail": 0,
							"statusAvailable": false
						};
						modelData.guranteeTable.push(obj);
					} else {
						data.guaranteeLetterArray.forEach(function (item) {
							obj = item;
							obj.docAvail = 1;
							modelData.guranteeTable.push(obj);
						});
					}
					oModel.updateBindings();
				},
				error: function (e) {}
			});
			this.getDocListData();
			if (!that._guranletter) {
				that._guranletter = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.guranteeLetter", that);
				that.getView().addDependent(that._guranletter);
			}
			that._guranletter.open(oEvent.getSource());
		},
		onCloseReviewLog: function () {
			this.getView().byId("idReviewLog").close();
		},
		onCloseRequestedDoc: function () {
			this.getView().byId("idReqDocDialog").close();
		},
		onCloseGurantee: function () {
			this.getView().byId("idGuranteeDialog").close();
		},
		onCloseFollowUp: function () {
			this.getView().byId("idFollowUpDialog").close();
		},
		onSearchOrganICD10: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			oModel.getData().selectedIcd10Organ = oModel.getProperty(path);
			var that = this;
			if (!that._icd10Organ) {
				that._icd10Organ = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.ICD10searchOrganHelp", that);
				that.getView().addDependent(that._icd10Organ);
			}
			that._icd10Organ.open(oEvent.getSource());
		},
		onSearchDialogIcd10: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var contains = sap.ui.model.FilterOperator.Contains;
				var filters = new sap.ui.model.Filter([
						new sap.ui.model.Filter("ICD_DESC_EN", contains, sQuery),
						new sap.ui.model.Filter("ICD_DESC_TH", contains, sQuery)
					],
					false);
			}
			var tableData = this.byId("idIcd10Table");
			var binding = tableData.getBinding("items");
			binding.filter(filters);
		},
		onIcdCauseItemPress: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedTabledata = this.getView().byId("idIcd10Table").getSelectedItems()[0];
			var modelPath = oModel.getProperty(selectedTabledata.getBindingContextPath());
			var iconTabPath = oModel.getData().selectedIcd10Cause;
			var icd10Cause = {
				"causeCode": modelPath.ICD_CODE,
				"causeDescTh": modelPath.ICD_DESC_TH,
				"causeDescEn": modelPath.ICD_DESC_EN
			};
			iconTabPath.accCause = [];
			iconTabPath.accCause.push(icd10Cause);
			oModel.updateBindings();
			this.onCloseICD10();
		},
		onCloseICD10: function () {
			this.getView().byId("idIcd10SearchHelp").close();
		},
		onIcdOrganItemPress: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedTabledata = this.getView().byId("idIcd10OrganTable").getSelectedItems()[0];
			var modelPath = oModel.getProperty(selectedTabledata.getBindingContextPath());
			var icd10OrganPath = oModel.getData().selectedIcd10Organ;
			icd10OrganPath.organCode = modelPath.ICD_CODE;
			icd10OrganPath.organDescEn = modelPath.ICD_DESC_EN;
			icd10OrganPath.organDescTh = modelPath.ICD_DESC_TH;
			oModel.updateBindings();
			this.onCloseICD10Organ();
		},
		onCloseICD10Organ: function () {
			this.getView().byId("idIcd10SearchOrganHelp").close();
		},
		onRequestReserve: function (oEvent) {
			var aReserveNum = [],
				path, selecteditems;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var iconTabPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var iconTabPathData = oModel.getProperty(iconTabPath);
			var selectedIconTabbar = this.byId("idIconFilterBar").getSelectedKey();
			var coverageTable = this.byId("idIconFilterBar").getItems()[selectedIconTabbar].getContent()[1].getItems()[1];
			var selectedRows = coverageTable.getItems();
			var index = this.getView().byId("idIconFilterBar").getSelectedKey();
			modelData.iconTabBarData[index].compareVisible = true;
			modelData.iconTabBarData[index].reqReservedButton = true;
			//commented because it has future scope
			if (selectedRows.length > 0) {
				selectedRows.forEach(function (item) {
					path = item.getBindingContext("appModel").sPath;
					selecteditems = oModel.getProperty(path);
					aReserveNum.push(selecteditems);
				});
				this.getDocAvailability(coverageTable, aReserveNum, iconTabPathData, iconTabPath);
				oModel.updateBindings();
			} else {
				MessageToast.show("Please select coverage");
			}
		},
		getReserveNumber: function (table, array, selecteditems, iconTabPath) {
			var xRquestNum = this.getXRequestNumber();
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var currentDateTime = this.getCurrentTime();
			var insuredPersons = [];
			array.forEach(function (item) {
				var insObj = {
					"identityNumber": item.identityNumber,
					"identityType": item.identityType,
					"contractType": item.insuredType
				};
				insuredPersons.push(insObj);
			});
			var inputReserveNum = {
				"bu_code": modelData.patientDetails.buCode,
				"clinic_location": modelData.patientDetails.clinic,
				"hospital_username": "",
				"requested_datetime": currentDateTime,
				"reservationId": "12345677",
				"insuranceCode": selecteditems.insCode,
				"X-Request-ID": xRquestNum,
				"insuredPersons": insuredPersons,
				"claimType": selecteditems.clmtTypeCode,
				"admissionType": "OPD",
				"admissionNumber": modelData.patientDetails.episodeNumber,
				"admissionDateTime": currentDateTime, //"2018-02-27T00:01:00+08:00"
				"accidentDateTime": selecteditems.accidentDateTime
			};
			var icd10ForSave = [];
			if (selecteditems.accCause.length !== 0 && selecteditems.accOrgan.length !== 0) {
				var icd10 = [];
				var icdCause = {
					"code": selecteditems.accCause[0].causeCode,
					"type": "Cause",
					"description": selecteditems.accCause[0].causeDescEn
				};
				var icd10SaveCause = {
					"icdCode": selecteditems.accCause[0].causeCode,
					"icdCodeType": "Cause"
				};
				icd10ForSave.push(icd10SaveCause);
				icd10.push(icdCause);
				selecteditems.accOrgan.forEach(function (value) {
					var icdOrgan = {
						"code": value.organCode,
						"type": "Organ",
						"description": value.organDescEn
					};
					var icd10SaveOrgan = {
						"icdCode": value.organCode,
						"icdCodeType": "Organ"
					};
					icd10ForSave.push(icd10SaveOrgan);
					icd10.push(icdOrgan);
				});
				inputReserveNum.icd10s = icd10;
			} else {
				icd10ForSave = [{
					"icdCode": "",
					"icdCodeType": ""
				}];
			}
			var inputToSaveReserve = {
				"patientCode": modelData.patientCode,
				"preArrangementCode": "",
				"rank": selecteditems.rank,
				"olderReserveNumber": "",
				"userCode": "",
				"accidentIcdMapping": icd10ForSave,
				"followUpNote": [{
					"messageNote": "",
					"userRole": "",
					"userCode": "",
					"createdDate": ""
				}],
				"claimGroupCode": selecteditems.clmGrpCode,
				"claimTypeCode": selecteditems.clmtTypeCode,
				"episodeCode": oModel.getData().createPatientDetEpisodeCode,
				"insuranceCode": selecteditems.insCode

			};
			var that = this;
			var input;
			$.ajax({
				url: "/http/v1/registration/registerclaim/reservations",
				type: "POST",
				data: JSON.stringify(inputReserveNum),
				contentType: "application/json",
				success: function (data) {
					array.forEach(function (a) {
						a.reserveNumber = data.reservationNumber;
						input = data;
						input.insuredPersons.forEach(function (insuredItem) {
							insuredItem.contracts.forEach(function (coverageItem) {
								if (coverageItem.contractNumber === a.policyNumber) {
									if (a.rank !== "") {
										coverageItem.rank = parseInt(a.rank, 0);
									} else {
										coverageItem.rank = "";
									}
									coverageItem.confirmationDocumentUrl = "";
								} else {
									coverageItem.rank = "";
									coverageItem.confirmationDocumentUrl = "";
								}
							});
						});
					});
					table.removeSelections();
					oModel.updateBindings();
					input.patientCode = inputToSaveReserve.patientCode;
					input.preArrangementCode = "";
					if (inputToSaveReserve.rank !== "") {
						input.rank = parseInt(inputToSaveReserve.rank, 0);
					} else {
						input.rank = "";
					}
					input.olderReserveNumber = inputToSaveReserve.olderReserveNumber;
					input.userCode = inputToSaveReserve.userCode;
					input.accidentIcdMapping = inputToSaveReserve.accidentIcdMapping;
					input.followUpNote = inputToSaveReserve.followUpNote;
					input.claimGroupCode = inputToSaveReserve.claimGroupCode;
					input.claimTypeCode = inputToSaveReserve.claimTypeCode;
					input.episodeCode = inputToSaveReserve.episodeCode;
					input.insuranceCode = inputToSaveReserve.insuranceCode;
					that.saveReserveNumber(input, iconTabPath);
				},
				error: function (e) {}
			});
		},
		saveReserveNumber: function (responseData, iconTabPath) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var oToken = this._fetchToken();
			$.ajax({
				url: "/bdms/ims/reg/Registration_Service/XSJS/SaveReserve.xsjs",
				type: "POST",
				data: JSON.stringify(responseData),
				contentType: "application/json",
				processData: false,
				headers: {
					"X-CSRF-Token": oToken
				},
				success: function (data) {
					oModel.getProperty(iconTabPath).episodeClaimTypeMapId = data.episodeClaimTypeMapId;
					oModel.getProperty(iconTabPath).followUpVisibility = true;
					oModel.updateBindings();
				},
				error: function (e) {}
			});
		},
		getDocAvailability: function (coverageTable, aReserveNum, iconTabPathData, iconTabPath) {
			var that = this;
			var oMdlApp = this.getOwnerComponent().getModel("appModel");
			var aDocs = [],
				documents;
			var reqStage = "RESERVATION";
			var stageCode = "OPD"; // need to fetched from header data
			var isRequired = "1";
			var buCode = oMdlApp.getData().patientDetails.buCode;
			var hospitalNum = oMdlApp.getData().patientDetails.hospitalNumber;
			var episodeNum = oMdlApp.getData().patientDetails.episodeNumber;
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModel.read("DocList?$filter=BU_CODE eq '" + buCode + "' && STAGE_CODE eq '" + reqStage + "' && PRODUCT_TYPE_CODE eq '" + stageCode +
				"' && IS_REQUIRED eq '" + isRequired + "'&$format=json", {
					success: function (data) {
						data.results.forEach(function (item) {
							documents = {
								"doccode": item.DOC_LIST_CODE,
								"location": "",
								"period_from": "",
								"period_to": "",
								"request_type": "STATUS"
							};
							aDocs.push(documents);
						});
						var obj = {
							"interface_identifier": "HMS-IMS002",
							"hn": hospitalNum,
							"en": episodeNum,
							"document": aDocs
						};
						that.getStatusCall(obj, coverageTable, aReserveNum, iconTabPathData, iconTabPath);
					},
					error: function (error) {}
				});
		},
		getOptDocStatus: function (obj) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			$.ajax({
				url: "/http/v1/registration/getdocument/status",
				type: "POST",
				data: JSON.stringify(obj),
				contentType: "application/json",
				processData: false,
				success: function (data) {
					if (Array.isArray(data.document) === false) {
						if (data.document.document_status === "1") {
							oModel.getData().optDocArray.forEach(function (val) {
								val.statusError = false;
								val.statusSuccess = true;
								oModel.updateBindings();
							});
						} else if (data.document.document_status !== "1") {
							oModel.getData().optDocArray.forEach(function (val) {
								val.statusError = false;
								val.statusSuccess = false;
								oModel.updateBindings();
							});
						}
					} else if (Array.isArray(data.document)) {
						var aDoc = data.document;
						oModel.getData().optDocArray.forEach(function (i) {
							aDoc.forEach(function (j) {
								if (i.docCode === j.document_code) {
									if (j.document_status === "1") {
										i.statusError = false;
										i.statusSuccess = true;
										oModel.updateBindings();
									} else {
										i.statusError = true;
										i.statusSuccess = false;
										oModel.updateBindings();
									}
								}
							});
						});
					}
				},
				error: function (e) {}
			});
		},
		getStatusCall: function (obj, coverageTable, aReserveNum, iconTabPathData, iconTabPath) {
			var that = this;
			that.IsReserveNumber = false;
			var oModel = that.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var index = that.getView().byId("idIconFilterBar").getSelectedKey();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			$.ajax({
				url: "/http/v1/registration/getdocument/status",
				type: "POST",
				data: JSON.stringify(obj),
				contentType: "application/json",
				processData: false,
				success: function (data) {
					if (data.document.document_status === "1") {
						modelData.iconTabBarData[index].getPolicyFragment = true;
						modelData.iconTabBarData[index].addPolicyButton = true;
						modelData.iconTabBarData[index].followUpVisibility = true;
						modelData.iconTabBarData[index].backFirstVisible = false;
						modelData.iconTabBarData[index].compareVisible = false;
						modelData.iconTabBarData[index].reqReservedButton = false;
						modelData.reviewButton = true;
						that.getReserveNumber(coverageTable, aReserveNum, iconTabPathData);
					} else if (data.document.document_status !== "1") {
						MessageBox.error(
							"Mandatory document not available. Do you still want to proceed for the reserve number?", {
								actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
								styleClass: bCompact ? "sapUiSizeCompact" : "",
								onClose: function (oAction) {
									if (oAction === "YES") {
										modelData.iconTabBarData[index].getPolicyFragment = true;
										modelData.iconTabBarData[index].addPolicyButton = true;
										modelData.iconTabBarData[index].followUpVisibility = true;
										modelData.iconTabBarData[index].backFirstVisible = false;
										modelData.iconTabBarData[index].compareVisible = false;
										modelData.iconTabBarData[index].reqReservedButton = false;
										modelData.reviewButton = true;
										that.getReserveNumber(coverageTable, aReserveNum, iconTabPathData, iconTabPath);
									} else {
										modelData.iconTabBarData[index].getPolicyFragment = true;
										modelData.iconTabBarData[index].addPolicyButton = false;
										modelData.iconTabBarData[index].followUpVisibility = false;
										modelData.iconTabBarData[index].backFirstVisible = true;
										modelData.iconTabBarData[index].compareVisible = true;
										modelData.iconTabBarData[index].reqReservedButton = true;
										modelData.reviewButton = false;
									}
								}
							}
						);
					}
				},
				error: function (e) {}
			});
		},
		onAddPolicy: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var selecteditems = oModel.getProperty(selectedPath);
			oModel.getData().storeDataforPolicy = selecteditems;
			oModel.getData().selectPolicyNumber = "";
			oModel.getData().selectedTypeValue = "";
			oModel.getData().getCoverageVisible = true;
			oModel.getData().submitVisible = false;
			oModel.updateBindings();
			var that = this;
			if (!that._Dialog2) {
				that._Dialog2 = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.addPolicy", that);
				that.getView().addDependent(that._Dialog2);
			}
			that._Dialog2.open(oEvent.getSource());
		},
		onCancelPolicy: function () {
			this.getView().byId("idAddPolicyDialog").close();
		},
		onCancelResNum: function () {
			this.getView().byId("idAddResNumDialog").close();
		},
		onSortTableItems: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var tableItems = oModel.getProperty(path).coverageTable;
			var sortdata = tableItems.sort(function (a, b) {
				var val1 = a.insuredType;
				var val2 = b.insuredType;
				var A = val1.toUpperCase();
				var B = val2.toUpperCase();
				if (A > B) {
					return 1;
				} else {
					return -1;
				}
			});
			tableItems = sortdata;
			oModel.refresh();
		},
		onGetCoverage: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var iconTabPath = oModel.getData().storeDataforPolicy;
			var dateOfAdmission = this.getCurrentTime();
			var selectedTypeVal = oModel.getData().selectedTypeValue;
			var selectedPolicyNum = oModel.getData().selectPolicyNumber;
			if (selectedTypeVal !== "" && selectedPolicyNum !== "") {
				var selectedIconTabbar = this.byId("idIconFilterBar").getSelectedKey();
				var coverageTable = this.byId("idIconFilterBar").getItems()[selectedIconTabbar].getContent()[1].getItems()[1];
				var selectedRows = coverageTable.getItems();
				var path = selectedRows[0].getBindingContext("appModel").sPath;
				var selectedData = oModel.getProperty(path);
				var reserveNumber = selectedData.reserveNumber;
				var rank = selectedData.rank;
				var typeOfInsured = selectedData.insuredType;
				if (rank !== "") {
					rank = parseInt(rank, 0);
				} else {
					rank = "";
				}
				if (iconTabPath.rank !== "") {
					iconTabPath.rank = parseInt(iconTabPath.rank, 0);
				} else {
					iconTabPath.rank = "";
				}
				oModel.getData().selectedParametersForsubmit = {
					"patientCode": oModel.getData().patientCode,
					"preArrangementCode": "",
					"olderReserveNumber": "",
					"userCode": "",
					"followUpNote": [{
						"messageNote": "",
						"userRole": "",
						"userCode": "",
						"createdDate": ""
					}],
					"accidentIcdMapping": [{
						"icdCode": "",
						"icdCodeType": ""
					}],
					"iconTabBarPath": iconTabPath,
					"reserveNumber": reserveNumber,
					"insuranceCode": iconTabPath.insCode,
					"claimGroupCode": iconTabPath.clmGrpCode,
					"claimTypeCode": iconTabPath.clmtTypeCode,
					"accidentDateTime": iconTabPath.accidentDateTime,
					"identityNumber": selectedTypeVal,
					"identityType": selectedPolicyNum,
					"accCause": iconTabPath.accCause,
					"accOrgan": iconTabPath.accOrgan,
					"rank": rank,
					"insuredRank": iconTabPath.rank,
					"typeOfInsured": typeOfInsured,
					"episodeCode": oModel.getData().createPatientDetEpisodeCode,
					"episodeClaimTypeMapID": iconTabPath.episodeClaimTypeMapId,
					"coverageTable": coverageTable
				};
				var item = {
					"identityNumber": selectedPolicyNum,
					"identityType": selectedTypeVal,
					"contractType": selectedData.insuredType,
					"admissionType": "OPD",
					"claimType": iconTabPath.clmtTypeCode,
					"accidentDateTime": iconTabPath.accidentDateTime,
					"admissionDateTime": dateOfAdmission
				};
				$.ajax({
					url: "/http/v1/registration/policycoverage",
					type: "POST",
					data: item,
					contentType: "application/json",
					processData: false,
					success: function (data) {
						MessageToast.show("Coverage Available");
						oModel.getData().coverageAgainstReserveNum = data.contracts;
						oModel.getData().submitVisible = true;
						oModel.getData().getCoverageVisible = false;
						oModel.updateBindings();
					},
					error: function (e) {
						MessageToast.show("No Coverage Found");
						oModel.getData().submitVisible = false;
						oModel.getData().getCoverageVisible = true;
						oModel.updateBindings();
					}
				});
			} else {
				MessageToast.show("Please Enter Identity type and Identity number");
			}
		},
		onPrint: function () {
			var oPrintModel = this.getOwnerComponent().getModel("appModel");
			var printFormData = oPrintModel.getData();
			var printTableData = oPrintModel.getData().compareCoverageItems;
			var header = "<center><h3>Identification And Coverage Confirmation</h3></center><hr>";
			/*--------------------------------To Print Patient Details-----------------------------------*/
			var formTable = "<table rules='cols' style ='border :none' width ='95%' >";
			formTable += "<tr>";
			formTable += "<td style = 'border :none; word-wrap:break-word; font-weight:bold' >TITLE</td>" +
				"<td style = 'border :none; word-wrap:break-word; font-weight:bold'>FIRST NAME</td>" +
				"<td style = 'border :none; word-wrap:break-word; font-weight:bold'>MIDDLE NAME</td>" +
				"<td style = 'border :none; word-wrap:break-word; font-weight:bold'>LAST NAME</td>" +
				"<td style = 'border :none; word-wrap:break-word; font-weight:bold'>HOSPITAL NUMBER</td></tr>";
			formTable += "<tr>";
			formTable += "<td style = 'border :none; word-wrap:break-word' >" + printFormData.titleHeader + "</td>" +
				"<td style = 'border :none; word-wrap:break-word'>" + printFormData.firstNameHeader + "</td>" +
				"<td style = 'border :none; word-wrap:break-word'>" + printFormData.middleNameHeader + "</td>" +
				"<td style = 'border :none; word-wrap:break-word'>" + printFormData.lastNameHeader + "</td>" +
				"<td style = 'border :none; word-wrap:break-word'>" + printFormData.patientDetails.hospitalNumber + "</td></tr>";
			formTable += "</table><br>";

			/*-----------------------To Print The compareCoverageItems------------------------- */
			var table = "<table rules='cols' style ='border:1px solid black; width ='95%'><tr>" + "<th>Insured Type</th>" +
				"<th style = 'padding: 0.2rem;'>Policy No</th>" +
				"<th style = 'padding: 0.2rem;'>Itemized Code</th>" + "<th style = 'padding: 0.2rem;'>Itemized Description</th>" +
				"<th style = 'padding: 0.2rem; text-align:center;'>Benefit Value</th>" +
				"<th style = 'padding: 0.2rem;'>Benefit Per</th>" +
				"<th style = 'padding: 0.2rem; text-align:center;'>Benefit Remaining Value</th>" +
				"<th style = 'padding: 0.2rem;'>Benefit Unit</th>" + "<th style = 'padding: 0.2rem; text-align:center;'>Benefit CoPay Value</th>" +
				"<th style = 'padding: 0.2rem; text-align:center;'>Benefit CoPay Unit</th>" +
				"<th style = 'padding: 0.2rem;'>Reason</th></tr>";
			for (var i = 0; i < printTableData.length; i++) {
				table += "<tr>";
				table += "<td style = 'border :1px solid black; word-wrap:break-word; width:5px; padding: 0.2rem;'>" + printTableData[i].insuredType +
					"</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].policyNo + "</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].itemizedCode + "</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].itemizedDesc + "</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem; text-align:center;'>" + formatter.getNumberFormat(
						printTableData[i].benValue) +
					"</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].benPer + "</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word;  padding: 0.2rem; text-align:center;'>" + formatter.getNumberFormat(
						printTableData[i].benRemValue) +
					"</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].benUnit + "</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word;  padding: 0.2rem; text-align:center;''>" + printTableData[i].coPayVal +
					"</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word;  padding: 0.2rem; text-align:center;'>" + printTableData[i].coPayUnit +
					"</td>" +
					"<td style = 'border :1px solid black; word-wrap:break-word; padding: 0.2rem;'>" + printTableData[i].reason + "</td>" +
					"</td></tr>";
			}
			table += "</table><br>";
			/**------------END OF To Print compareCoverageItems------------------------**/
			var printString = "width=900px, height=600px";
			var wind = window.open("", "", printString);
			wind.document.write(header + formTable + table);
			wind.print();
			wind.close();
		},
		onSubmitPolicy: function () {
			var iTotalCost = 0,
				icdOrgan, coverageObj, that = this;
			// code should be inserted inside success. after completion of cpi service enter
			var oModel = this.getOwnerComponent().getModel("appModel");
			var xRquestNum = this.getXRequestNumber();
			var currentDateTime = this.getCurrentTime();
			var reserveNumber = oModel.getData().selectedParametersForsubmit.reserveNumber;
			var insuranceCode = oModel.getData().selectedParametersForsubmit.insuranceCode;
			var claimTypeCode = oModel.getData().selectedParametersForsubmit.claimTypeCode;
			var accidentDate = oModel.getData().selectedParametersForsubmit.accidentDateTime;
			var identityNumber = oModel.getData().selectedParametersForsubmit.identityNumber;
			var identityType = oModel.getData().selectedParametersForsubmit.identityType;
			var accCause = oModel.getData().selectedParametersForsubmit.accCause;
			var accOrgan = oModel.getData().selectedParametersForsubmit.accOrgan;
			var oPayload = {
				"bu_code": "1", //get from header
				"clinic_location": "abc", //get from header
				"hospital_username ": "Cashier", //get from header
				"requested_datetime": currentDateTime, //currentdate and time
				"reservationId": reserveNumber, // compareData.reserveNumber,
				"insuranceCode": insuranceCode, //compareData.insuranceCode,
				"X-Request-ID": xRquestNum, // random
				"insuredPersons": [{
					"identityNumber": identityNumber,
					"identityType": identityType,
					"contractType": ""
				}],
				"claimType": claimTypeCode, //compareData.claimGroupDesc,
				"admissionType": "OPD",
				"admissionNumber": oModel.getData().patientDetails.episodeNumber, //en
				"admissionDateTime": currentDateTime, //"2018-02-27T00:01:00+08:00"
				"accidentDateTime": accidentDate
			};
			if (accCause.length !== 0 && accOrgan.length !== 0) {
				var icd10 = [];
				var icdCause = {
					"code": accCause[0].causeCode,
					"type": "Cause",
					"description": accCause[0].causeDescEn
				};
				icd10.push(icdCause);
				accOrgan.forEach(function (value) {
					icdOrgan = {
						"code": value.organCode,
						"type": "Organ",
						"description": value.organDescEn
					};
					icd10.push(icdOrgan);
				});
				oPayload.icd10s = icd10;
			}
			$.ajax({
				url: "/http/v1/registration/reservation/update",
				type: "POST",
				data: JSON.stringify(oPayload),
				contentType: "application/json",
				success: function (data) {
					var newPolicies = oModel.getData().coverageAgainstReserveNum;
					var iconTabPath = oModel.getData().selectedParametersForsubmit;
					newPolicies.forEach(function (val) {
						coverageObj = {
							"rank": "",
							"reserveNumber": iconTabPath.reserveNumber,
							"insuredType": val.contractType,
							"policyNumber": val.contractNumber,
							"policyStatus": val.status,
							"benefitValue": val.benefitAmount,
							"benRemValue": val.benefitRemainingAmount,
							"insNotEligibleReason": val.insuredNotEligibleReasons,
							"policyNotEligibleReason": val.notEligibleReasonsAtPolicy,
							"coverageNotEligibleReson": val.ReasonsAtCoverage,
							"isSelected": false,
							coverageItems: val.coverageItems,
							"identityNumber": iconTabPath.identityNumber,
							"identityType": iconTabPath.identityType
						};
						iconTabPath.iconTabBarPath.coverageTable.push(coverageObj);
					});
					iconTabPath.iconTabBarPath.coverageTable.forEach(function (val) {
						iTotalCost += parseInt(val.benRemValue, 0);
					});
					iconTabPath.iconTabBarPath.benRemValue = iTotalCost;
					iconTabPath.coverageTable.removeSelections();
					oModel.updateBindings();
					data.insuredPersons.forEach(function (insuredItem) {
						insuredItem.contracts.forEach(function (coverageItem) {
							coverageItem.rank = iconTabPath.rank;
							coverageItem.confirmationDocumentUrl = "";
						});
					});
					var inputToXsjs = data;
					inputToXsjs.patientCode = iconTabPath.patientCode;
					inputToXsjs.preArrangementCode = iconTabPath.preArrangementCode;
					inputToXsjs.rank = iconTabPath.insuredRank;
					inputToXsjs.olderReserveNumber = iconTabPath.olderReserveNumber;
					inputToXsjs.userCode = iconTabPath.userCode;
					inputToXsjs.accidentIcdMapping = iconTabPath.accidentIcdMapping;
					inputToXsjs.followUpNote = iconTabPath.followUpNote;
					inputToXsjs.claimGroupCode = iconTabPath.claimGroupCode;
					inputToXsjs.claimTypeCode = iconTabPath.claimTypeCode;
					inputToXsjs.episodeCode = iconTabPath.episodeCode;
					inputToXsjs.insuranceCode = iconTabPath.insuranceCode;
					inputToXsjs.episodeClaimTypeMapID = iconTabPath.episodeClaimTypeMapID;
					that.updateReservationXsjs(inputToXsjs);
				},
				error: function (e) {}
			});
			oModel.updateBindings();
			this.onCancelPolicy();
		},
		updateReservationXsjs: function (inputToXsjs) {
			var oToken = this._fetchToken();
			$.ajax({
				url: "/bdms/ims/reg/Registration_Service/XSJS/UpdateReserveNumber.xsjs",
				method: "POST",
				contentType: "application/json",
				data: JSON.stringify(inputToXsjs),
				headers: {
					"X-CSRF-Token": oToken
				},
				success: function (data) {},
				error: function (e) {}
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
			this.getView().byId("idCompareIns").close();
		},
		onCompare: function (oEvent) {
			var that = this,
				obj;
			if (!that._compareDialog) {
				that._compareDialog = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.compareInsurance", that);
				that.getView().addDependent(that._compareDialog);
			}
			that._compareDialog.open(oEvent.getSource());
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var selecteditems = oModel.getProperty(selectedPath).coverageTable;
			selecteditems.forEach(function (pItem) {
				pItem.coverageItems.forEach(function (cItem) {
					obj = {
						"insuredType": pItem.insuredType,
						"policyNo": pItem.policyNumber,
						"itemizedCode": cItem.coverageCode,
						"itemizedDesc": cItem.description,
						"benValue": cItem.benefitAmount,
						"benPer": cItem.benefitPer,
						"benRemValue": cItem.benefitRemainingAmount,
						"benUnit": cItem.benefitUnit,
						"coPayVal": cItem.benefitCopayAmount,
						"coPayUnit": cItem.benefitCopayUnit,
						"reason": cItem.notEligibleReasons
					};
					oModel.getData().compareCoverageItems.push(obj);
				});
			});
			oModel.updateBindings();
		},
		onReviewPress: function () {
			/*-------To Check If Insurance Rank Is Empty---------*/
			this._router.navTo("RouteSubmitReview");
			// var sMsg = "";
			// var bInsRank = true;
			// var oModel = this.getOwnerComponent().getModel("appModel");
			// var modelData = oModel.getData();
			// var aInsData = modelData.iconTabBarData; // Data in First Table in getPolicy Vbox
			// for (var i = 0; i < aInsData.length; i++) {
			// 	if (!aInsData[i].rank) {
			// 		sMsg = "Kindly provide the rank for all the insurances.";
			// 		this.showErrorMessage(sMsg);
			// 		bInsRank = false;
			// 		break;
			// 	}

			// }

			// if (bInsRank) {
			// 	for (var i = 0; i < aInsData.length; i++) {
			// 		var aCoverageTable = aInsData[i].coverageTable;
			// 		for (var j = 0; j < aCoverageTable[j].length; j++) {
			// 			if (!aCoverageTable[j].rank) {
			// 				sMsg = "Kindly provide the rank for all the policies of " + aInsData[i].insurance + ",with Claim Type " + aInsData[i].clmGrp;
			// 				this.showErrorMessage(sMsg);
			// 				break;
			// 			} else {
			// 				this._router.navTo("RouteSubmitReview");
			// 			}
			// 		}

			// 	}
			// }

		},

		onReasonPress: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			oModel.getData().coverageReason = [];
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedData = oModel.getProperty(path);
			var objIns = {
				"reason": selectedData.insNotEligibleReason
			};
			var objPolicy = {
				"reason": selectedData.policyNotEligibleReason
			};
			var objCoverage = {
				"reason": selectedData.coverageNotEligibleReson
			};
			if (objIns.reason !== "") {
				oModel.getData().coverageReason.push(objIns);
			}
			if (objPolicy.reason !== "") {
				oModel.getData().coverageReason.push(objPolicy);
			}
			if (objCoverage.reason !== "") {
				oModel.getData().coverageReason.push(objCoverage);
			}
			oModel.updateBindings();
			var that = this;
			if (!that._reasonDialog) {
				that._reasonDialog = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.Reasons", that);
				that.getView().addDependent(that._reasonDialog);
			}
			that._reasonDialog.open(oEvent.getSource());
		},
		onClosePress: function () {
			this.getView().byId("idReason").close();
		},
		onDocCheckListPress: function (oEvent) {
			var that = this;
			var oMdlApp = this.getOwnerComponent().getModel("appModel"),
				obj = {};
			oMdlApp.getData().optDocArray = [];
			var buCode = oMdlApp.getData().patientDetails.buCode;
			var episodeCode = oMdlApp.getData().createPatientDetEpisodeCode;
			var productTypeCode = "001";
			var url = "/bdms/ims/reg/Registration_Service/XSJS/DocumentCheckList.xsjs?buCode=" + buCode + "&episodeCode=" + episodeCode +
				"&productTypeCode=" + productTypeCode;

			$.ajax({
				url: url,
				type: "GET",
				async: false,
				contentType: "application/json",
				processData: false,
				success: function (data) {
					data.documentCheckArray.forEach(function (item) {
						obj = item;
						obj.docAvail = 1;
						if (obj.isAvailable === 1) {
							obj.statusAvailable = true;
						} else {
							obj.statusError = true;
						}
						if (obj.assetCode && obj.assetFileUrl) {
							obj.fileUrl = obj.assetFileUrl;
							obj.dmsAvailable = true;
							obj.getStatusBtn = false;

						} else {
							if (obj.docScanAvailability === 1) {
								obj.docScanAvailable = true;
								obj.dmsAvailable = false;
								obj.getStatusBtn = false;
							} else {
								obj.getStatusBtn = true;
							}
						}
						oMdlApp.getData().optDocArray.push(obj);
					});
					oMdlApp.updateBindings();
				},
				error: function (e) {}
			});
			this.getDocListData();
			if (!that._optDoc) {
				that._optDoc = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.optionalDoc", that);
				that.getView().addDependent(that._optDoc);
			}
			that._optDoc.open(oEvent.getSource());
		},
		onCloseOptDoc: function () {
			this.getView().byId("idOptionalDoc").close();
		},
		navBack: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			// D: Removing the ALL status before navigating back to identification
			oModel.getData().policyStatus.shift();
			this._router.navTo("RouteIdentification");
			oModel.getData().reviewButton = false;
			oModel.updateBindings();
		},
		toNavWithinFrag: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			/*---To Check The Visibility and Route---------*/
			var modelData = oModel.getData();
			var index = this.getView().byId("idIconFilterBar").getSelectedKey();
			var getPolicyFragment = modelData.iconTabBarData[index].getPolicyFragment;
			var verifyPatientFragment = modelData.iconTabBarData[index].verifyPatientFragment;
			var covtableLength = modelData.iconTabBarData[index].coverageTable.length;
			var reserveNumber = modelData.iconTabBarData[index].coverageTable[covtableLength - 1].reserveNumber;
			if (verifyPatientFragment === false && getPolicyFragment === true && reserveNumber === "") {
				modelData.iconTabBarData[index].getPolicyFragment = false;
				modelData.iconTabBarData[index].verifyPatientFragment = true;
				modelData.iconTabBarData[index].coverageTable = [];
			} else {
				modelData.iconTabBarData[index].addPolicyButton = false;
				modelData.iconTabBarData[index].followUpVisibility = false;
				modelData.iconTabBarData[index].compareVisible = true;
				modelData.iconTabBarData[index].reqReservedButton = true;
			}
			oModel.updateBindings();
			oModel.refresh();
		},
		onPolicyPress: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData(),
				iTotalCost = 0,
				inputToPolicy, coverageObj;
			var dateOfAdmission = this.getCurrentTime();
			var selectedPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var iconTabPath = oModel.getProperty(selectedPath);
			var selectedIconTabbar = this.byId("idIconFilterBar").getSelectedKey();
			var verifypatientTable = this.byId("idIconFilterBar").getItems()[selectedIconTabbar].getContent()[0].getItems()[1];
			var tableSelectItem = verifypatientTable.getSelectedItems();
			if (tableSelectItem.length === 1) {
				var path = tableSelectItem[0].getBindingContext("appModel").sPath;
				var tableData = oModel.getProperty(path);
				oModel.getProperty(selectedPath).getPolicyFragment = true;
				oModel.getProperty(selectedPath).verifyPatientFragment = false;
				modelData.storeCoverageData = [];
				inputToPolicy = {
					"identityNumber": tableData.id,
					"identityType": tableData.idType,
					"contractType": "",
					"admissionType": "OPD",
					"claimType": iconTabPath.clmType,
					"accidentDateTime": iconTabPath.accidentDateTime,
					"admissionDateTime": dateOfAdmission
				};
				$.ajax({
					url: "/http/v1/registration/policycoverage",
					type: "POST",
					data: inputToPolicy,
					contentType: "application/json",
					processData: false,
					success: function (data) {
						modelData.storeCoverageData = data.contracts;
						data.contracts.forEach(function (item) {
							coverageObj = {
								"rank": "",
								"reserveNumber": "",
								"insuredType": item.contractType,
								"policyNumber": item.contractNumber,
								"policyStatus": item.status,
								"benefitValue": item.benefitAmount,
								"benRemValue": item.benefitRemainingAmount,
								"insNotEligibleReason": item.insuredNotEligibleReasons,
								"policyNotEligibleReason": item.notEligibleReasonsAtPolicy,
								"coverageNotEligibleReson": item.ReasonsAtCoverage,
								"isSelected": false,
								coverageItems: item.coverageItems,
								"identityNumber": tableData.id,
								"identityType": tableData.idType
							};
							oModel.getProperty(selectedPath).coverageTable.push(coverageObj);
						});
						oModel.getProperty(selectedPath).coverageTable.forEach(function (val) {
							iTotalCost += parseInt(val.benRemValue, 0);
						});
						oModel.getProperty(selectedPath).benRemValue = iTotalCost;
						oModel.updateBindings();
					},
					error: function (e) {}
				});
			} else if (tableSelectItem.length > 1) {
				MessageToast.show("Please select only one patient");
			} else if (tableSelectItem.length === 0) {
				MessageToast.show("Please select atleast one patient");
			}
		},
		onAccidentPress: function (oEvent) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			modelData.accClmVis = false;
			oModel.getData().fetchPath = oEvent.getSource().getBindingContext("appModel").sPath;
			if (!that._accClmHis) {
				that._accClmHis = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.accClaimHistory", that);
				that.getView().addDependent(that._accClmHis);
			}
			that._accClmHis.open(oEvent.getSource());
			oModel.updateBindings();
		},
		fnAccDateChange: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			if (oEvent.getSource().getBindingInfo("value").binding.sPath === "/accClmFromDate") {
				if (modelData.accClmToDate) {
					if (modelData.accClmFromDate > modelData.accClmToDate) {
						modelData.accClmFromDate = "";
						modelData.accClmFromValState = "Error";
						this.getView().byId("idMS").setVisible(true);
						this.getView().byId("idMS").setText("Please enter a From Date less than To Date");
					} else {
						modelData.accClmFromValState = "None";
						this.getView().byId("idMS").setVisible(false);
						this.getView().byId("idMS").setText("");
					}
				}
			} else {
				if (modelData.accClmFromDate) {
					if (modelData.accClmFromDate > modelData.accClmToDate) {
						modelData.accClmToDate = "";
						modelData.accClmToValState = "Error";
						this.getView().byId("idMS").setVisible(true);
						this.getView().byId("idMS").setText("Please enter a To Date greater than From Date");
					} else {
						modelData.accClmToValState = "None";
						this.getView().byId("idMS").setVisible(false);
						this.getView().byId("idMS").setText("");
					}
				}
			}
			oModel.refresh();
		},
		onClear: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			modelData.accClmFromDate = "";
			modelData.accClmToDate = "";
			modelData.accClmVis = false;
			oModel.refresh(true);
		},
		getCurrentDate: function () {
			var oDate = new Date();
			var sDay = oDate.getDate().toString();
			var sMonth = oDate.getMonth() + 1;
			sMonth = sMonth.toString();
			var iYear = oDate.getFullYear();
			sDay = sDay.length === 1 ? sDay = "0" + sDay : sDay;
			sMonth = sMonth.length === 1 ? sMonth = "0" + sMonth : sMonth;
			oDate = sDay + "/" + sMonth + "/" + iYear;
			return oDate;
		},
		onCloseAccClm: function () {
			this.getView().byId("idAccClaim").close();
		},
		onAddIcd10Organ: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedData = oModel.getProperty(path);
			var icd10Organ = {
				"organCode": "",
				"organDescEn": "",
				"organDescTh": ""
			};
			selectedData.accOrgan.push(icd10Organ);
			oModel.updateBindings();
		},
		onDeleteIcd10Organ: function (oEvent) {
			var iconTabPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedData = oModel.getProperty(iconTabPath);
			var selectedIconTabbar = this.byId("idIconFilterBar").getSelectedKey();
			var accOrganTable = this.byId("idIconFilterBar").getItems()[selectedIconTabbar].getContent()[0].getItems()[4].getContent()[0];
			var selectedItemsToDelete = accOrganTable.getSelectedItems();
			if (selectedItemsToDelete.length !== 0) {
				for (var i = selectedItemsToDelete.length; i > 0; i--) {
					var path = selectedItemsToDelete[i - 1].getBindingContext("appModel").getPath();
					var selectedIndex = parseInt(path.split("/")[4], 0);
					var oTableData = selectedData.accOrgan;
					oTableData.splice(selectedIndex, 1);
				}
				accOrganTable.removeSelections();
			} else {
				MessageToast.show("Please select row to delete");
			}
			oModel.refresh();
		},
		onSearchAccHistory: function (oEvent) {
			var xRquestNum = this.getXRequestNumber();
			var currentDateTime = this.getCurrentTime();
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var fromDate = modelData.accClmFromDate;
			var toDate = modelData.accClmToDate;
			var accidentPayload = {
				"bu_code": "H001",
				"hospital_username": "Cashier",
				"requested_datetime": currentDateTime,
				"X-Request-ID": xRquestNum,
				"insuredPersons": [{
					"identityNumber": "AZY189842",
					"identityType": "Passport"
				}],
				"accidentDateFrom": fromDate,
				"accidentDateTo": toDate,
				"icd10Codes": ""
			};
			var aTable = [];
			var tblcause;
			var sCode;
			var data;
			$.ajax({
				url: "/http/v1/registration/getaccidentclaimhistory",
				type: "POST",
				data: JSON.stringify(accidentPayload),
				contentType: "application/json",
				processData: false,
				success: function (response) {
					data = response.row;
					if (data.length === undefined || data.length < 0) {
						modelData.accClmVis = false;
					} else {
						modelData.accClmVis = true;
						modelData.accidentHistory.push(data);
						for (var i = 0; i < data.length; i++) {
							for (var j = 0; j < data[i].claims.length; j++) {
								for (var t = 0; t < data[i].claims[j].icd10s.length; t++) {
									var tillCondtn = true;
									var s = 0;
									while (tillCondtn && s < data[i].claims[j].icd10s.length) {
										if (data[i].claims[j].icd10s[s].type === "Cause") {
											tblcause = data[i].claims[j].icd10s[s].description;
											sCode = data[i].claims[j].icd10s[s].code;
											tillCondtn = false;
										} else {
											s++;
										}
									}
									if (data[i].claims[j].icd10s[t].type === "Organ") {
										var time = data[i].claims[j].accidentDateTime;
										aTable.push({
											"date": time,
											"code": sCode,
											"desc": tblcause,
											"orgnCode": data[i].claims[j].icd10s[t].code,
											"orgnDesc": data[i].claims[j].icd10s[t].description
										});
									}
								}
							}
						}
					}
					oModel.getData().accHisClaimTable = aTable;
					oModel.updateBindings();
				},
				error: function (e) {}
			});
		},
		onDocLinkPress: function (oEvent) {
			var oAppModel = this.getView().getModel("appModel");
			var appModelData = oAppModel.getData();
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedPath = oAppModel.getProperty(path);
			var payload = {
				"bu_code": appModelData.patientDetails.buCode,
				"clinic_location": appModelData.patientDetails.clinic,
				"hospital_username": "HN001",
				"requested_datetime": "18-12-2018",
				"interface_identifier": "HMS-IMS002",
				"hn": appModelData.patientDetails.hospitalNumber,
				"en": appModelData.patientDetails.episodeNumber,
				"document": {
					"doccode": selectedPath.docCode,
					"location": "A-001",
					"period_from": "",
					"period_to": "",
					"request_type": "SEND"
				}
			};
			$.ajax({
				url: "/http/v1/registration/document/get",
				type: "POST",
				data: JSON.stringify(payload),
				contentType: "application/json",
				processData: false,
				success: function (data) {},
				error: function (e) {}
			});
		},
		onSelectAccItem: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var path = oEvent.getSource().getSelectedItem().getBindingContextPath();
			var selectedItem = oModel.getProperty(path);
			var tempArray = oModel.getData().tempArray;
			if (tempArray.length === 0) {
				tempArray.push(selectedItem);
			} else {
				var data = tempArray.filter(function (item) {
					return (item.code === selectedItem.code);
				});
				if (data.length === 0) {
					oEvent.getParameters("listItems").listItems[0].setSelected(false);
				} else {
					tempArray.push(selectedItem);
				}
			}
			oModel.updateBindings();
		},
		onSubmitHistory: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var path = oModel.getData().fetchPath,
				icd10Organ;
			var tempArray = oModel.getData().tempArray;
			var icd10Cause = {
				"causeCode": tempArray[0].code,
				"causeDescEn": tempArray[0].desc,
				"causeDescTh": ""
			};
			oModel.getProperty(path).accCause = [];
			oModel.getProperty(path).accCause.push(icd10Cause);
			tempArray.forEach(function (val) {
				icd10Organ = {
					"organCode": val.orgnCode,
					"organDescEn": val.orgnDesc,
					"organDescTh": ""
				};
				oModel.getProperty(path).accOrgan.push(icd10Organ);
			});
			oModel.updateBindings();
			this.onCloseAccClm();
			oModel.getData().tempArray = [];
			oModel.getData().accHisClaimTable = [];
			this.getView().byId("idAccClmTable").removeSelections();
			oModel.refresh();
		},
		/** On selection of status in Status dropdpwn. 
		 * @param {object} [oEvent] Selection event.
		 * IMPORTANT: For filter the table is accessed by traversing the view. Kindly do not make changes in the view - Policy VBox
		 */
		fnFilterCoverage: function (oEvent) {
			var sSearchString = oEvent.getParameter("value");
			var oBindings = oEvent.getSource().getParent().getParent().getParent().getParent().getItems()[1].getBinding("items");
			if (sSearchString === "active") {
				sSearchString = "in-force";
			} else if (sSearchString === "inactive") {
				sSearchString = "out-force";
			} else {
				sSearchString = "";
			}
			if (oBindings) {
				var oFilters = [new sap.ui.model.Filter("policyStatus", sap.ui.model.FilterOperator.Contains, sSearchString)];
				var filterObj = new sap.ui.model.Filter(oFilters, false);
				oBindings.filter(filterObj);
			} else {
				oBindings.filter([]);
			}
		},
		/*---------------D:To Close the Application----------------*/
		onCloseButtonPress: function () {
			this.onCloseApp();
		},
		/*---------------D: END of  Closing the Application----------------*/
		/** In policy table when user enters the rank this event is triggered.
		 * @param {object} [oEvent] Input for the rank
		 * User cannot enter same rank.
		 */
		fnCheckRank: function (oEvent) {
			var aRank = [],
				sMsg = "",
				aRankMissing = [],
				that = this;
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedIndex = path.split("/")[4];
			var sRank = oEvent.getParameter("value");
			if (this.fnNumberCheck(sRank)) {
				oEvent.getSource().setValue("");
				return;
			}
			var selectedIndexInt = parseInt(selectedIndex, 0);
			var aCoverageItems = oEvent.getSource().getParent().getParent().getBindingContext("appModel").getObject().localInsTable;
			aCoverageItems.forEach(function (item, index) {
				if (index !== selectedIndexInt) {
					if (item.rankLocal === sRank) {
						oEvent.getSource().setValue("");
						that.errorDialog("Rank " + sRank + " is already provided. Kindly assign a different rank.");
					}
					// Sequence missed in providing the ranks
					aCoverageItems.forEach(function (oEle) {
						if (oEle.rankLocal) {
							aRank.push(parseInt(oEle.rankLocal, 10));
						}
					});
					aRankMissing = that.fnMissingRank(aRank);
					if (aRankMissing.length > 0) {
						oEvent.getSource().setValue("");
						sMsg = "The ranks " + aRankMissing.join(", ") + " are missed. Kindly provide the correct sequence of ranks.";
						that.showErrorMessage(sMsg);
					}
				}
			});
		},
		/** In insurance tabs when user enters the rank this event is triggered.
		 * @param {object} [oEvent] Input for the rank
		 * User cannot enter same rank or miss the sequence.
		 */
		fnInsRankChange: function (oEvent) {
			var aRank = [];
			var sMsg = "";
			var oSameRankList = "";
			var aRankMissing = [];
			var sRank = oEvent.getParameter("value");
			var iSelIns = parseInt(oEvent.getSource().getBindingContext("appModel").getPath().split("/").pop(), 10);
			var aInsuranceItems = this.getModel("appModel").getProperty("/iconTabBarData");
			if (this.fnNumberCheck(sRank)) {
				oEvent.getSource().setValue("");
				return;
			}
			if (aInsuranceItems.length > 0) {
				for (var i = 0; i < aInsuranceItems.length; i++) {
					if (aInsuranceItems[i].rank === sRank && i !== iSelIns) {
						oSameRankList = aInsuranceItems[i];
						break;
					}
				}
				if (oSameRankList) { // Same rank check
					oEvent.getSource().setValue("");
					sMsg = "The rank " + sRank + " is already provided to insurance: " + oSameRankList.insurance + "; claim group: " + oSameRankList.clmGroup +
						"; claim type: " + oSameRankList.clmType +
						". Kindly assign a different rank.";
					this.showErrorMessage(sMsg);
				} else { // Sequence missed in providing the ranks
					aInsuranceItems.forEach(function (oEle) {
						if (oEle.rank) {
							aRank.push(parseInt(oEle.rank, 10));
						}
					});
					aRankMissing = this.fnMissingRank(aRank);
					if (aRankMissing.length > 0) {
						oEvent.getSource().setValue("");
						sMsg = "The ranks " + aRankMissing.join(", ") + " are missed. Kindly provide the correct sequence of ranks.";
						this.showErrorMessage(sMsg);
					}
				}
			}
		},

		/** In policy table when user enters the rank this event is triggered.
		 * @param {object} [oEvent] Input for the rank
		 * User cannot enter same rank or miss the sequence.
		 */
		fnPolicyRankChange: function (oEvent) {
			var aRank = [];
			var sMsg = "";
			var oSameRankList = "";
			var aRankMissing = [];
			var sRank = oEvent.getParameter("value");
			var iSelPolicy = parseInt(oEvent.getSource().getBindingContext("appModel").getPath().split("/").pop(), 10);
			var aCoverageItems = oEvent.getSource().getParent().getParent().getBindingContext("appModel").getObject().coverageTable;
			if (this.fnNumberCheck(sRank)) {
				oEvent.getSource().setValue("");
				return;
			}
			if (aCoverageItems.length > 0) {
				for (var i = 0; i < aCoverageItems.length; i++) {
					if (aCoverageItems[i].rank === sRank && i !== iSelPolicy) {
						oSameRankList = aCoverageItems[i];
						break;
					}
				}
				if (oSameRankList) { // Same rank check
					oEvent.getSource().setValue("");
					sMsg = "The rank " + sRank + " is already provided to policy number " + oSameRankList.policyNumber +
						". Kindly assign a different rank.";
					this.showErrorMessage(sMsg);
				} else { // Sequence missed in providing the ranks
					aCoverageItems.forEach(function (oEle) {
						if (oEle.rank) {
							aRank.push(parseInt(oEle.rank, 10));
						}
					});
					aRankMissing = this.fnMissingRank(aRank);
					if (aRankMissing.length > 0) {
						oEvent.getSource().setValue("");
						sMsg = "The ranks " + aRankMissing.join(", ") + " are missed. Kindly provide the correct sequence of ranks.";
						this.showErrorMessage(sMsg);
					}
				}
			}
		},
		/*below functions are for the local insurance*/
		onAddCoveraegClick: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var oModel = this.getOwnerComponent().getModel("appModel");
			var localTable = oModel.getProperty(path).localInsTable;
			var obj = {
				"rankLocal": "",
				"reserveNumberLocal": "",
				"policyLocal": "",
				"policyNumber": "",
				"insuredTypeLocalVal": "",
				"insuredTypeLocalKey": "",
				"policyStatusLocalKey": "",
				"insTypeComboBoxVisible": true,
				"insTypeTextVisible": false,
				"policyEditable": false,
				"policyComboBoxVisible": false,
				"policyTextVisible": true,
				"actionButtonVisible": false,
				PolicyStatusLocalArray: []
			};
			if (localTable.length === 0) {
				obj.policyNumber = "POL1";
			} else {
				obj.policyNumber = "POL" + localTable.length + 1;
				if (localTable[0].reserveNumberLocal) {
					obj.reserveNumberLocal = localTable[0].reserveNumberLocal;
					obj.policyLocal = "POL" + localTable.length + 1;
					obj.policyEditable = localTable[0].policyEditable;
					obj.policyComboBoxVisible = localTable[0].policyComboBoxVisible;
					obj.policyTextVisible = localTable[0].policyTextVisible;
					obj.actionButtonVisible = localTable[0].actionButtonVisible;
					obj.PolicyStatusLocalArray = localTable[0].PolicyStatusLocalArray;
					//obj.reserveNumberLocal = localTable[0].reserveNumberLocal;

				}
			}
			localTable.push(obj);
			oModel.updateBindings();
		},
		getInsTypeLocal: function (insCode) {
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oMdlApp = this.getOwnerComponent().getModel("appModel");
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModel.read("/InsuredType?$format=json&$filter=INSURANCE_CODE eq '" + insCode + "'", {
				success: function (data) {
					oMdlApp.setProperty("/insuredTypeLocalArray", data.results);
				},
				error: function (error) {}
			});
		},
		onDeleteLocalIns: function (oEvent) {
			var iconTabPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var oModel = this.getOwnerComponent().getModel("appModel"),
				selectedData = oModel.getProperty(iconTabPath);
			var key = this.byId("idIconFilterBar").getSelectedKey();
			var localInsTable = this.byId("idIconFilterBar").getItems()[key].getContent()[2].getItems()[1];
			var selectedItemsToDelete = localInsTable.getSelectedItems();
			if (selectedItemsToDelete.length !== 0) {
				for (var i = selectedItemsToDelete.length; i > 0; i--) {
					var path = selectedItemsToDelete[i - 1].getBindingContext("appModel").getPath();
					var selectedIndex = parseInt(path.split("/")[4], 0);
					var oTableData = selectedData.localInsTable;
					oTableData.splice(selectedIndex, 1);
				}
				localInsTable.removeSelections();
			} else {
				this.errorDialog("Please select a row to delete");
			}
			oModel.refresh();
		},
		onSearchDocList: function (oEvent) {
			/*    open document list fragment   */
			var selectedId = oEvent.getParameters("id").id;
			this.docPath = selectedId.split("-")[4];
			var oModel = this.getOwnerComponent().getModel("appModel");
			/* DONT CHANGE THE PATH. IF NEEDS TO BE CHANGED THEN PLACE THE VIEW CONTROLS ACCORDINGLY*/
			oModel.getData().eventPath = oEvent.getSource().getId().split("-")[3];
			var that = this;
			if (!that._Dialog) {
				that._Dialog = sap.ui.xmlfragment(that.getView().getId(), "in.BDMSInsurance.Fragments.DocumentList", that);
				that.getView().addDependent(that._Dialog);
			}
			that._Dialog.open(oEvent.getSource());
		},
		confirmDocList: function (oEvent) {
			var oModel = this.getView().getModel("appModel");
			var tableItemselected = this.getView().byId("idDocListTable").getSelectedItems()[0];
			var path = tableItemselected.getBindingContextPath();
			var selectedItem = oModel.getProperty(path);
			if (oModel.getData().eventPath === "idReqDocTable") {
				oModel.getData().requestedDoc[this.docPath].docCode = selectedItem.docCode;
				oModel.getData().requestedDoc[this.docPath].docName = selectedItem.docName;
				oModel.getData().requestedDoc[this.docPath].isRequired = selectedItem.isRequired;
			} else if (oModel.getData().eventPath === "idDocCheckTable") {
				oModel.getData().optDocArray[this.docPath].docCode = selectedItem.docCode;
				oModel.getData().optDocArray[this.docPath].docName = selectedItem.docName;
				oModel.getData().optDocArray[this.docPath].isRequired = selectedItem.isRequired;
			} else if (oModel.getData().eventPath === "idGuranteeTable") {
				oModel.getData().guranteeTable[this.docPath].docCode = selectedItem.docCode;
				oModel.getData().guranteeTable[this.docPath].docName = selectedItem.docName;
				oModel.getData().guranteeTable[this.docPath].isRequired = selectedItem.isRequired;
			}
			oModel.updateBindings();
			this.onCancelDocList();
		},
		onCancelDocList: function () {
			this.getView().byId("idDocList").close();
		},
		onReqDocGetStatus: function (oEvent) {
			var oAppModel = this.getView().getModel("appModel");
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedData = oAppModel.getProperty(path);
			var docCode = selectedData.docCode,
				episodeClamTypeId = "1",
				that = this;
			if (docCode !== "") {
				var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
				var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
				oModel.read("/ClaimRequestedDoc?$format=json&$filter=DOC_CODE eq '" + docCode + "' and EPISODE_CLAIM_TYPE_MAP_ID eq '" +
					episodeClamTypeId + "'", {
						success: function (data) {
							if (data.results.length === 0) {
								that.getDocScanAvailability(path);
							} else {
								selectedData.statusAvailable = true;
								selectedData.dmsAvailable = true;
								selectedData.statusError = false;
								/* needs to be added later according to service data*/
								//selectedData.fileUrl = obj.assetFileUrl;
								oAppModel.updateBindings();
							}
						},
						error: function (error) {
							selectedData.statusError = true;
							selectedData.statusAvailable = false;
							selectedData.statusAvailable = false;
							oAppModel.updateBindings();
						}
					});
			} else {
				this.errorDialog("Please Select Document");
			}
		},
		onAddRequestedDoc: function () {
			var oAppModel = this.getView().getModel("appModel");
			var appModelData = oAppModel.getData();
			var obj = {
				"assetCode": "",
				"claimRequestedDoc": "",
				"createdDate": "",
				"docCode": "",
				"docName": "",
				"docScanAvailability": "",
				"episodeClaimTypeMapId": "",
				"fileName": "Link",
				"fileUrl": "",
				"fromDate": "",
				"isAvailable": "",
				"remark": "",
				"toDate": "",
				"statusAvailable": false,
				"statusError": false,
				"sentToIns": 0
			};
			var tableData = appModelData.requestedDoc;
			var tableLength = tableData.length;
			if (tableLength === 0) {
				tableData.push(obj);
				oAppModel.updateBindings();
			} else {
				var docCode = tableData[tableLength - 1].docCode;
				if (docCode === "") {
					this.errorDialog("Please Select Document of The Last Row");
				} else {
					tableData.push(obj);
				}
				oAppModel.updateBindings();
			}
		},
		onAddGurLetter: function () {
			var oAppModel = this.getView().getModel("appModel");
			var appModelData = oAppModel.getData();
			var obj = {
				"srNum": "",
				"assetCode": "",
				"createdDate": "",
				"docCode": "",
				"docName": "",
				"fileNmae": "",
				"fileUrl": "",
				"guaranteeCode": "",
				"docAvail": 0,
				"statusAvailable": false
			};
			var tableData = appModelData.guranteeTable;
			var tableLength = tableData.length;
			if (tableLength === 0) {
				tableData.push(obj);
				oAppModel.updateBindings();
			} else {
				var docCode = tableData[tableLength - 1].docCode;
				if (docCode === "") {
					this.errorDialog("Please Select Document of The Last Row");
				} else {
					tableData.push(obj);
				}
				oAppModel.updateBindings();
			}
		},
		getDocScanAvailability: function (path) {
			var oAppModel = this.getView().getModel("appModel");
			var appModelData = oAppModel.getData(),
				aDocs = [],
				that = this;
			var hospitalNum = appModelData.patientDetails.hospitalNumber;
			var episodeNum = appModelData.patientDetails.episodeNumber;
			var selectedData = oAppModel.getProperty(path);
			var buCode = appModelData.patientDetails.buCode;
			var documents = {
				"doccode": selectedData.docCode,
				"location": "",
				"period_from": "",
				"period_to": "",
				"request_type": "STATUS"
			};
			aDocs.push(documents);
			var inputToStatus = {
				"interface_identifier": "HMS-IMS002",
				"hn": hospitalNum,
				"en": episodeNum,
				"document": aDocs
			};
			var sUrl = "/bdms/ims/reg/Registration_Service/XSODATA/ReadAll.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModel.read("/DocscanAvailability?$format=json&$filter=BU_CODE eq '" + buCode + "'", {
				success: function (data) {
					that.getStatusDoc(inputToStatus, path);
					selectedData.docScanAvailability = 1;
				},
				error: function (error) {
					selectedData.statusError = true;
					selectedData.statusAvailable = false;
					selectedData.docScanAvailability = 2;
					selectedData.docScanAvailable = false;
					oAppModel.updateBindings();
				}
			});
		},
		onSendRequestedDoc: function () {
			var oAppModel = this.getView().getModel("appModel");
			var tableData = oAppModel.getData().requestedDoc,
				aPayload = [];
			var checkData = tableData.filter(function (item) {
				return item.sentToIns === 0;
			});
			if (checkData.length === 0) {
				this.onCloseRequestedDoc();
			} else {
				var tableLength = tableData.length;
				var docCode = tableData[tableLength - 1].docCode;
				var statusAvailable = tableData[tableLength - 1].statusAvailable;
				if (statusAvailable === false) {
					this.errorDialog("Please get the status successfully before saving.");
				}
				if (docCode && statusAvailable) {
					if (checkData.length !== 0) {
						checkData.forEach(function (item) {
							var obj = {
								"episodeClaimTypeMapID": item.episodeClaimTypeMapId,
								"docCode": item.docCode,
								"fromDate": item.fromDate,
								"toDate": item.toDate,
								"docScanAvailability": item.docScanAvailability,
								"isDeleted": "",
								"remark": item.remark,
								"assestCode": item.assetCode
							};
							aPayload.push(obj);
						});
						var oToken = this._fetchToken();
						$.ajax({
							url: "/bdms/ims/reg/Registration_Service/XSJS/ClaimRequestedDocPost.xsjs",
							type: "POST",
							async: false,
							data: JSON.stringify(aPayload),
							contentType: "application/json",
							processData: false,
							headers: {
								"X-CSRF-Token": oToken
							},
							success: function (data) {},
							error: function (e) {

							}
						});
					}
					this.onCloseRequestedDoc();
				}
			}
		},
		onUpload: function (oEvent) {

		},
		afterFileUpload: function (oEvent) {

		},
		onStartUpload: function (oEvent) {

		},
		onUploadProgress: function (oEvent) {

		},
		onReqDocUpload: function (oEvent) {
			var oAppModel = this.getView().getModel("appModel");
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedData = oAppModel.getProperty(path);
			var docCode = selectedData.docCode;
			if (docCode === "") {
				this.errorDialog(
					"Please Select Document.");
			}
		},
		onSaveGurantee: function () {
			var oAppModel = this.getView().getModel("appModel");
			var tableData = oAppModel.getData().guranteeTable,
				aPayload = [];
			var buCode = oAppModel.getData().patientDetails.buCode;
			var productTypeCode = "001",
				key = this.byId("idIconFilterBar").getSelectedKey();
			var episodeClaimTypeMapID = oAppModel.getData().iconTabBarData[key].episodeClaimTypeMapID;
			//validaton for blank row in document list table
			var tableLength = tableData.length;
			var docCode = tableData[tableLength - 1].docCode;
			var fileNmae = tableData[tableLength - 1].fileNmae;
			if (fileNmae === "") {
				this.errorDialog(
					"Please upload a file to save.");
			}
			if (fileNmae && docCode) {
				var checkData = tableData.filter(function (item) {
					return item.docAvail === 0;
				});
				if (checkData.length !== 0) {
					checkData.forEach(function (item) {
						var obj = {
							"buCODE": buCode,
							"docCode": item.docCode,
							"productTypeCode": productTypeCode,
							"stageCode": "1",
							"containerType": "",
							"fileName": "",
							"fileUrl": "",
							"fileSize": "",
							"mimeType": "",
							"downloadCount": 1,
							"lastDownloadon": "",
							"authorId": 1,
							"docLocation": "",
							"periodFrom": "2018-10-24T11:15:20",
							"periodTo": "2018-10-24T11:15:20",
							"episodeClaimTypeMapId": episodeClaimTypeMapID,
							"isDeleted": 1

						};
						aPayload.push(obj);
					});
					var oToken = this._fetchToken();
					$.ajax({
						url: '/bdms/ims/reg/Registration_Service/XSJS/GuaranteeLetterSave.xsjs',
						method: "POST",
						contentType: "application/json",
						async: false,
						data: JSON.stringify(aPayload),
						headers: {
							"X-CSRF-Token": oToken
						},
						success: function (data) {},
						error: function (error) {}
					});
				}
			}
			this.onCloseGurantee();
		},
		errorDialog: function (msg) {
			MessageBox.error(msg, {
				title: "Error",
				textDirection: sap.ui.core.TextDirection.Inherit
			});
		},
		onAddDocCheckList: function () {
			var oAppModel = this.getView().getModel("appModel");
			var appModelData = oAppModel.getData();
			var tableData = appModelData.optDocArray;
			var obj = {
				"CreatedDate": "",
				"assetCode": "",
				"buCode": appModelData.patientDetails.buCode,
				"docCode": "",
				"docName": "",
				"docScanAvailability": "",
				"docScanAvailable": false,
				"dmsAvailable": false,
				"documentCheckListCode": "",
				"episodeCode": appModelData.createPatientDetEpisodeCode,
				"isAvailable": "",
				"isRequired": false,
				"productTypeCode": "001",
				"statusAvailable": false,
				"statusError": false,
				"fileName": "Link",
				"docAvail": 0

			};

			var tableLength = tableData.length;
			if (tableLength === 0) {
				tableData.push(obj);
				oAppModel.updateBindings();
			} else {
				var docCode = tableData[tableLength - 1].docCode;
				if (docCode === "") {
					this.errorDialog("Please fill in Insurance, Claim Group & Claim type of the Last Row");
				} else {
					tableData.push(obj);
				}
				oAppModel.updateBindings();
			}

		},
		onDeleteLocalIcd10Organ: function (oEvent) {

			var iconTabPath = oEvent.getSource().getBindingContext("appModel").sPath;
			var oModel = this.getOwnerComponent().getModel("appModel");
			var selectedData = oModel.getProperty(iconTabPath);
			var selectedIconTabbar = this.byId("idIconFilterBar").getSelectedKey();
			var accOrganTable = this.byId("idIconFilterBar").getItems()[selectedIconTabbar].getContent()[2].getItems()[4].getContent()[0];
			var selectedItemsToDelete = accOrganTable.getSelectedItems();
			if (selectedItemsToDelete.length !== 0) {
				for (var i = selectedItemsToDelete.length; i > 0; i--) {
					var path = selectedItemsToDelete[i - 1].getBindingContext("appModel").getPath();
					var selectedIndex = parseInt(path.split("/")[4], 0);
					var oTableData = selectedData.accOrgan;
					oTableData.splice(selectedIndex, 1);
				}
				accOrganTable.removeSelections();
			} else {
				MessageToast.show("Please select row to delete");
			}
			oModel.refresh();

		},
		getStatusDoc: function (payload, path) {
			var oAppModel = this.getView().getModel("appModel");
			var selectedData = oAppModel.getProperty(path);
			$.ajax({
				url: "/http/v1/registration/getdocument/status",
				type: "POST",
				data: JSON.stringify(payload),
				contentType: "application/json",
				processData: false,
				success: function (data) {
					selectedData.statusAvailable = true;
					selectedData.statusError = false;
					selectedData.docScanAvailable = true;
					oAppModel.updateBindings();
				},
				error: function (e) {
					selectedData.statusError = true;
					selectedData.docScanAvailable = false;
					selectedData.statusAvailable = false;
					oAppModel.updateBindings();
				}
			});
		},
		onDeleteRequestedDoc: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var tableData = oModel.getData().requestedDoc;
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var index = path.split(/[\W]/)[2];
			tableData.splice(index, 1);
			this.getView().getModel("appModel").updateBindings();
		},
		getDocListData: function () {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var buCode = oModel.getData().patientDetails.buCode;
			var productTypeCode = "001";
			var url = "/bdms/ims/reg/Registration_Service/XSJS/DocumentListService.xsjs?STAGE_NAME=RESERVATION&BU_CODE=" + buCode +
				"&PRODUCT_TYPE_CODE=" + productTypeCode;
			$.ajax({
				url: url,
				type: "GET",
				async: false,
				contentType: "application/json",
				processData: false,
				success: function (data) {
					oModel.getData().docList = data.documentArray;
					oModel.updateBindings();
				},
				error: function (e) {

				}
			});
		},
		onDeleteDocList: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var tableData = oModel.getData().optDocArray;
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var index = path.split(/[\W]/)[2];
			tableData.splice(index, 1);
			this.getView().getModel("appModel").updateBindings();

		},
		onDeleteGurantee: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var tableData = oModel.getData().guranteeTable;
			var path = oEvent.getSource().getBindingContext("appModel").sPath;
			var index = path.split(/[\W]/)[2];
			tableData.splice(index, 1);
			this.getView().getModel("appModel").updateBindings();
		},
		onWebsiteLocalPress: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("appModel");
			var modelData = oModel.getData();
			var path = oEvent.getSource().getBindingContext("appModel").getPath();
			var selectedPath = oModel.getProperty(path);
			var key = this.byId("idIconFilterBar").getSelectedKey();
			var insCode = modelData.iconTabBarData[key].insCode;
			var buCode = modelData.patientDetails.buCode;
			var url = "/bdms/ims/reg/Registration_Service/XSJS/GetCommModeForLocalInsurance.xsjs?buCode=" + buCode +
				"&insuranceCode=" + insCode + "&typeOfInsuredCode =" + selectedPath.insuredTypeLocalKey;
			$.ajax({
				url: url,
				type: "GET",
				async: false,
				contentType: "application/json",
				processData: false,
				success: function (data) {
				
				},
				error: function (e) {

				}
			});
			// this.windows = [];
			// this.windows.push(window.open("https://www.google.com"));
		},
		onSendDocCheckList: function () {
			var oAppModel = this.getView().getModel("appModel");
			var tableData = oAppModel.getData().optDocArray,
				aPayload = [];
			//validaton for blank row in document list table
			var checkData = tableData.filter(function (item) {
				return item.docAvail === 0;
			});
			if (checkData.length === 0) {
				this.onCloseOptDoc();
			} else {
				var tableLength = tableData.length;
				var docCode = tableData[tableLength - 1].docCode;
				var statusAvailable = tableData[tableLength - 1].statusAvailable;
				if (statusAvailable === false) {
					this.errorDialog("Please get the status successfully before saving.");
				}
				if (docCode && statusAvailable) {
					if (checkData.length !== 0) {
						checkData.forEach(function (item) {
							var obj = {
								"episodeCode": item.episodeCode,
								"docCode": item.docCode,
								"isrequired": item.isRequired,
								"assetCode": item.assetCode,
								"docScanAvailabilty": item.docScanAvailability,
								"buCODE": item.buCode,
								"productTypeCode": item.productTypeCode,
								"stageCode": "",
								"containerType": "",
								"fileName": "",
								"fileUrl": "",
								"fileSize": "",
								"mimeType": "",
								"downloadCount": "",
								"lastDownloadon": "",
								"authorId": "",
								"docLocation": "",
								"periodFrom": "",
								"periodTo": ""
							};
							aPayload.push(obj);
						});
						var oToken = this._fetchToken();
						$.ajax({
							url: "/bdms/ims/reg/Registration_Service/XSJS/DocumentCheckListSave.xsjs",
							type: "POST",
							async: false,
							data: JSON.stringify(aPayload),
							contentType: "application/json",
							processData: false,
							headers: {
								"X-CSRF-Token": oToken
							},
							success: function (data) {},
							error: function (e) {}
						});
					}
					this.onCloseOptDoc();
				}
			}
		}
	});
});