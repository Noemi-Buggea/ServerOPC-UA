const { coreaasXmlFile,OPCUACertificateManager, ModelingKind,
    nodesets, LocalizedText, CoreServer, IdentifierType,
    AssetKind, KeyType, KeyElements, PropertyCategory,PropertyValueType,
    Variant, DataType,DataValue,StatusCodes} = require("./node_modules/node-opcua-coreaas");

const {NodeId, NodeIdType} = require("./node_modules/node-opcua-nodeid")

var xmlFiles = [nodesets.standard, coreaasXmlFile]

class AssetAdministrationShellSmartBadge{
    constructor(server,admin ) {
        this.server=server;
        this.admin=admin;
        this.Identifier=this.server.coreaas.Identifier;
        this.Key=this.server.coreaas.Key;
    }

    deleteBadge(nodeid){
        this.server.coreaas.addressSpace.deleteNode(nodeid)
    }

    addShellBadge(id){

        let badge= this.server.coreaas.addAssetAdministrationShell({
            browseName:"AssetShellBadge "+id,
            description:[new LocalizedText({locale: "en", text: "Asset Smart Badge"}),
                new LocalizedText({locale: "it", text: "Asset Smart Badge"})],
            identification: new this.Identifier({
                id: "www.admin-shell.io/sb/aas/"+id,
                idType: IdentifierType.IRI
            }),
            idShort:id,
            derivedFromRef: [ new this.Key({
                idType: KeyType.IRDI,
                local: false,
                type: KeyElements.AssetAdministrationShell,
                value: "AAA#1234-454#123456789"
            }) ],
            assetRef: [new this.Key({
                idType: KeyType.IRI,
                local: true,
                type: KeyElements.Asset,
                value: String(id)
            })],
            administration: this.admin
        });

        badge.addSubmodelRef([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/localization"
        })]).addSubmodelRef([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration"
        })]).addSubmodelRef([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/energyEfficiency"
        })]).addSubmodelRef([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/notification"
        })]);
        return badge;
    }

    addAssetBadge(id,administrationShell){

        let assetbadge=this.server.coreaas.addAsset({
            browseName:"Asset Badge "+id,
            identification: new this.Identifier({
                id: String(id),
                idType: IdentifierType.Custom
            }),
            idShort:String(id),
            kind: AssetKind.Instance,
            description: "Asset Badge",

        });
        administrationShell.hasAsset(assetbadge);
        return assetbadge;
    }

    addSubModelLocalization(id,administrationShell){
        let localization=this.server.coreaas.addSubmodel({
            browseName:"Localization "+id,
            kind: ModelingKind.Instance,
            idShort: "aas_Localization "+String(id),
            identification: new this.Identifier({
                id: "//sb/aas/"+String(id)+"/subs/localization",
                idType: IdentifierType.IRI
            })
        }).submodelOf(administrationShell);
        return localization;
    }

    addPropertyPosition(id,subModelLocalization,database,positionQuery){
        let position=this.server.coreaas.addSubmodelProperty({
            browseName:"Position",
            idShort: "Position/"+id,
            submodelElementOf: subModelLocalization,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value:{
                    refreshFunc : function(callback) {
                        database.query( positionQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_posizione)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].sb_posizione}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/localization",
        })]);

        return position;
    }

    addPropertyIp(id,subModelLocalization,database,ipQuery){
        let ip=this.server.coreaas.addSubmodelProperty({
            browseName:"IP",
            idShort: "IP/"+id,
            submodelElementOf: subModelLocalization,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value:{
                    refreshFunc : function(callback) {
                        database.query( ipQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_ip)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].sb_ip}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }) .addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/localization",
        })]);

        return ip;

    }

    addPropertyCellID(id,subModelLocalization,database,cellIDQuery){
        let cella=this.server.coreaas.addSubmodelProperty({
            browseName:"Cell_ID",
            idShort: "Cell_ID/"+id,
            submodelElementOf: subModelLocalization,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value:{
                    refreshFunc : function(callback) {
                        database.query( cellIDQuery)
                            .then( result=> {
                                console.log(result.rows[0].cella_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].cella_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }) .addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/localization",
        })]);

        return cella;

    }

    addSubModelAdministration(id,administrationShell){
        let administration=this.server.coreaas.addSubmodel({
            browseName:"Administration "+id,
            kind: ModelingKind.Instance,
            idShort: "aas_Administration "+String(id),
            identification: new this.Identifier({
                id: "//sb/aas/"+String(id)+"/subs/administration",
                idType: IdentifierType.IRI
            })
        }).submodelOf(administrationShell);

        return administration;
    }

    addPropertySoVersion(id,subModelAdministration,database,soVersionQuery){
        let soVersion=this.server.coreaas.addSubmodelProperty({
            browseName:"So_Version",
            idShort: "So_Version/"+id,
            submodelElementOf: subModelAdministration,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value:{
                    refreshFunc : function(callback) {
                        database.query( soVersionQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_versioneso)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].sb_versioneso}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }) .addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration",
        })]);

        return soVersion;

    }

    addPropertyAppVersion(id,subModelAdministration,database,appVersionQuery){
        let appVersion=this.server.coreaas.addSubmodelProperty({
            browseName:"App_Version",
            idShort: "App_Version/"+id,
            submodelElementOf: subModelAdministration,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value:{
                    refreshFunc : function(callback) {
                        database.query( appVersionQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_versioneapp)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].sb_versioneapp}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }) .addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration",
        })]);

        return appVersion;

    }

    addElementsCollectionCurrentEmployee(id,subModelAdministration){
        let currentEmplyee=this.server.coreaas.addSubmodelElementCollection({
            idShort: "Current_Employee",
            submodelElementOf: subModelAdministration,
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration"
        })]);
        return currentEmplyee
    }

    addPropertyEmplId(id,elementCollection,database,emplIdQuery){
        let emplId=this.server.coreaas.addSubmodelProperty({
            browseName: "Empl_ID",
            idShort: "Empl_ID/"+id,
            valueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    refreshFunc : function(callback) {
                        database.query( emplIdQuery)
                            .then( result=> {
                                console.log(result.rows[0].dip_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].dip_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });
        elementCollection.addElements([emplId])
        return emplId;
    }

    addPropertyBadgeId(id,elementCollection,database,badgeIdQuery){
        let badgeId=this.server.coreaas.addSubmodelProperty({
            browseName: "Badge_ID",
            idShort: "Badge_ID/"+id,
            valueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    refreshFunc : function(callback) {
                        database.query( badgeIdQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].sb_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });
        elementCollection.addElements([badgeId])
        return badgeId;
    }

    addPropertyNameLastNameRole(id,elementCollection,database,nlrQuery){
        let lastname=this.server.coreaas.addSubmodelProperty({
            browseName: "LastName",
            idShort: "LastName/"+id,
            valueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    refreshFunc : function(callback) {
                        database.query( nlrQuery)
                            .then( result=> {
                                console.log(result.rows[0].dip_cognome)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].dip_cognome}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        let name=this.server.coreaas.addSubmodelProperty({
            browseName: "Name",
            idShort: "Name/"+id,
            valueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    refreshFunc : function(callback) {
                        database.query( nlrQuery)
                            .then( result=> {
                                console.log(result.rows[0].dip_nome)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].dip_nome}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        let role=this.server.coreaas.addSubmodelProperty({
            browseName: "Role",
            idShort: "Role"+id,
            valueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    refreshFunc : function(callback) {
                        database.query( nlrQuery)
                            .then( result=> {
                                console.log(result.rows[0].dip_mansione)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].dip_mansione}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        elementCollection.addElements([lastname,name,role])

        return lastname,name,role

    }

    addElementsCollectionGroups(id,elementCollectionCurrentEmployee){
        let groups=this.server.coreaas.addSubmodelElementCollection({
            idShort: "Groups",
            //submodelElementOf: elementCollectionCurrentEmployee,
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration/current_employee"
        })]);
        elementCollectionCurrentEmployee.addElements([groups])
        return groups;

    }

    addPropertyGroups(id,elementCollection,database,groupsIdQuery){
        let groups=this.server.coreaas.addSubmodelProperty({
            browseName: "Group",
            idShort: "Group",
            valueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    refreshFunc : function(callback) {
                        database.query( groupsIdQuery)
                            .then( result=> {
                                console.log(result.rows[0].gruppodip_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].gruppodip_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });
        elementCollection.addElements([groups])
        return groups;

    }

    addElementsCollectionCompanies(id,elementCollectionCurrentEmployee){
        let conpanies=this.server.coreaas.addSubmodelElementCollection({
            idShort: "Companies",
            //submodelElementOf: elementCollectionCurrentEmployee,
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration/current_employee"
        })]);
        elementCollectionCurrentEmployee.addElements([conpanies])
        return conpanies;

    }

    addPropertyCompany(id,elementCollection,database,companyIdQuery){
        let company=this.server.coreaas.addSubmodelProperty({
            browseName: "Company",
            idShort: "Company",
            valueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    refreshFunc : function(callback) {
                        database.query( companyIdQuery)
                            .then( result=> {
                                console.log(result.rows[0].ditta_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].ditta_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });
        elementCollection.addElements([company])
        return company;

    }

    addElementsCollectionHistory(id,subModelAdministration){
        let history=this.server.coreaas.addSubmodelElementCollection({
            idShort: "History",
            submodelElementOf: subModelAdministration,
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration"
        })]);
        return history
    }

    addElementsCollectionEntryHistory(id,elementCollectionHistory){
        let entry=this.server.coreaas.addSubmodelElementCollection({
            idShort: "Entry",
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/administration/history"
        })]);
        elementCollectionHistory.addElements([entry])
        return entry;

    }

    addPropertyEmplStartEnd(id,elementCollection,database,eseQuery){
        let emp=this.server.coreaas.addSubmodelProperty({
            browseName: "Empl",
            idShort: "Empl",
            valueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    refreshFunc : function(callback) {
                        database.query( eseQuery)
                            .then( result=> {
                                console.log(result.rows[0].dip_id)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].dip_id}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        let start=this.server.coreaas.addSubmodelProperty({
            browseName: "Start_usage",
            idShort: "Start_usage",
            valueType: PropertyValueType.DateTime,
            value: {
                dataType: "DateTime",
                value: {
                    refreshFunc : function(callback) {
                        database.query( eseQuery)
                            .then( result=> {
                                console.log(result.rows[0].hst_timestamp_start_usage)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.DateTime, value:result.rows[0].hst_timestamp_start_usage}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        let end=this.server.coreaas.addSubmodelProperty({
            browseName: "End_Usage",
            idShort: "End_Usage",
            valueType: PropertyValueType.DateTime,
            value: {
                dataType: "DateTime",
                value: {
                    refreshFunc : function(callback) {
                        database.query( eseQuery)
                            .then( result=> {
                                console.log(result.rows[0].hst_timestam_end_usage)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.DateTime, value:result.rows[0].hst_timestam_end_usage}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });

        elementCollection.addElements([emp,start,end])

        return emp,start,end

    }

    addSubModelEnergyEfficiency(id,administrationShell){
        let energy=this.server.coreaas.addSubmodel({
            browseName:"Energy Efficiency "+id,
            kind: ModelingKind.Instance,
            idShort: "aas_Energy Efficiency "+String(id),
            identification: new this.Identifier({
                id: "//sb/aas/"+String(id)+"/subs/energy_efficiency",
                idType: IdentifierType.IRI
            })
        }).submodelOf(administrationShell);

        return energy;
    }

    addPropertyBatteryLevel(id,subModelEnergyEfficiency,database,batteryLevelQuery){
        let battery=this.server.coreaas.addSubmodelProperty({
            browseName:"Battery Level",
            idShort: "Battery Level/"+id,
            submodelElementOf: subModelEnergyEfficiency,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value:{
                    refreshFunc : function(callback) {
                        database.query( batteryLevelQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_livellobatteria)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].sb_livellobatteria}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/energy_efficiency",
        })]);

        return battery;
    }

    addPropertySignalLevel(id,subModelEnergyEfficiency,database,signalLevelQuery){
        let signal=this.server.coreaas.addSubmodelProperty({
            browseName:"Signal Level",
            idShort: "Signal Level/"+id,
            submodelElementOf: subModelEnergyEfficiency,
            kind: ModelingKind.Instance,
            category: PropertyCategory.VARIABLE,
            vaueType: PropertyValueType.Double,
            value: {
                dataType: "Double",
                value:{
                    refreshFunc : function(callback) {
                        database.query( signalLevelQuery)
                            .then( result=> {
                                console.log(result.rows[0].sb_livellosegnale)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.Double, value:result.rows[0].sb_livellosegnale}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            },
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/energy_efficiency",
        })]);

        return signal;
    }

    addSubModelNotification(id,administrationShell){
        let notification=this.server.coreaas.addSubmodel({
            browseName:"Notification "+id,
            kind: ModelingKind.Instance,
            idShort: "aas_Notification "+String(id),
            identification: new this.Identifier({
                id: "//sb/aas/"+String(id)+"/subs/notification",
                idType: IdentifierType.IRI
            })
        }).submodelOf(administrationShell);

        return notification;
    }

    addElementsCollectionLastMessage(id,subModelNotification){
        let lmessage=this.server.coreaas.addSubmodelElementCollection({
            idShort: "Last Message",
            submodelElementOf: subModelNotification,
            ordered: true,
            kind: ModelingKind.Instance
        }).addParent([new this.Key({
            idType: KeyType.IRI,
            local: true,
            type: KeyElements.Submodel,
            value: "//sb/aas/"+String(id)+"/subs/notification"
        })]);
        return lmessage
    }

    addPropertyMessageDescription(id,elementCollection,database,messageDesQuery){
        let message=this.server.coreaas.addSubmodelProperty({
            browseName: "Message Description",
            idShort: "Message Description",
            valueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    refreshFunc : function(callback) {
                        database.query( messageDesQuery)
                            .then( result=> {
                                console.log(result.rows[0].msg_descrizione)
                                var dataValue = new DataValue({
                                    value: new Variant({dataType: DataType.String, value:result.rows[0].msg_descrizione}),
                                    statusCode: StatusCodes.Good,
                                    sourceTimestamp: new Date()
                                });
                                callback(null,dataValue);
                            } ).catch(function(err){
                            console.log("Promise rejection error: "+err);
                        })
                    }
                }
            }
        });
        elementCollection.addElements([message])
        return message;

    }

    addPropertyMessageStatus(id,elementCollection,database,messageStatusQuery){
        let message=this.server.coreaas.addSubmodelProperty({
            browseName: "Message Status",
            idShort: "Message Status",
            valueType: PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                       refreshFunc : function(callback) {
                         database.query( messageStatusQuery)
                         .then( result=> {
                             console.log(result.rows[0].msg_status)
                             var dataValue = new DataValue({
                                 value: new Variant({dataType: DataType.String, value:result.rows[0].msg_status}),
                                 statusCode: StatusCodes.Good,
                                 sourceTimestamp: new Date()
                                      });
                               callback(null,dataValue);
                         } ).catch(function(err){
                           console.log("Promise rejection error: "+err);
                         })
                      }
                }
            }
        });
        elementCollection.addElements([message])
        return message;

    }


}

module.exports = {
    AssetAdministrationShellSmartBadge,
};
