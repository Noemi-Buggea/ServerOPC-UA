
const { coreaasXmlFile, nodesets, LocalizedText, CoreServer, IdentifierType, AssetKind, KeyType, KeyElements } = require("./node_modules/node-opcua-coreaas");
const { Database} = require("./database");
const {AssetAdministrationShellSmartBadge}=require("./informationModelFunctionSmartBadge")


//Configurazione del database
const config = {
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    database: 'postgres',
    password: '12345'
}; 

//Connessione al database con la configurazione
const db=new Database(config);

db.listen('new_badge_event')
db.listen('del_badge_event')

    db.connection.on('notification', (data) => {
        const payload = JSON.parse(data.payload);
        switch (data.channel){

            case "new_badge_event": {
                console.log('row added!' , payload)
                add_smartbadge(payload)
            }
            break;

            case "del_badge_event": {
                console.log('row delete!' , payload)
                removeBadge(payload.sb_id)
            }
            break;

            default:
                console.log("Unknown channel");
                break;
        }
    });



let xmlFiles = [nodesets.standard, coreaasXmlFile]


let server = new CoreServer({
    nodeset_filename: xmlFiles,
    port: 4848
})

let assetAdministrationBadgeArray=[];

let asb = undefined;

function post_initialize() {
    
    console.log("Starting post initialize")
    let admin = server.coreaas.addAdministrativeInformation({
        version: "1",
        revision: "0"
    });
    asb=new AssetAdministrationShellSmartBadge(server,admin);

    console.log("ASB created")

    let stringQuery="SELECT * from smartbadge"
    db.query(stringQuery).then( result => {

        console.log("Result length: " + result.rows.length)

        let rows = result.rows;
        for(let i = 0; i < rows.length; i++){
            add_smartbadge(rows[i])
        }

    } ).catch(function(err){
        console.log("Promise rejection error: "+err);
    })


    server.start(function () {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}

function add_smartbadge(badge) {

    let id = badge.sb_id;

    //CREO ASSET ADMINISTRATION SHELL BADGE
    let assetAdministrationShellBadge=asb.addShellBadge(id);
    //CREO ASSET
    let assetBadge=asb.addAssetBadge(id, assetAdministrationShellBadge);

    //CREO SUBMODEL LOCALIZATION
    let subModelLocalization=asb.addSubModelLocalization(id,assetAdministrationShellBadge)
    //CREO PROPRIETA' PER LOCALIZATION

    //LE FUNZIONI PER CREARE LE PROPRIETA' PRENDERANNO COME INPUT PURE IL DATABASE E LA QUERY
    let queryPosition= 'SELECT sb_posizione FROM smartbadge WHERE sb_id ='+ id
    let propertyPosition=asb.addPropertyPosition(id,subModelLocalization,db,queryPosition)
    let ipQuery='SELECT sb_ip FROM smartbadge WHERE sb_id ='+ id
    let propertyIp=asb.addPropertyIp(id,subModelLocalization,db,ipQuery)
    let cellIDQuery='SELECT cella_id FROM smartbadge WHERE sb_id ='+ id
    let propertyCellID=asb.addPropertyCellID(id,subModelLocalization,db,cellIDQuery)

    //CREO SUBMODEL ADMINISTRATION
    let subModelAdministration=asb.addSubModelAdministration(id,assetAdministrationShellBadge);
    //CREO PROPRIETA' PER ADMINISTRATION
    let soVersionQuery='SELECT sb_versioneso FROM smartbadge WHERE sb_id ='+ id
    let propertySoVersion=asb.addPropertySoVersion(id,subModelAdministration,db,soVersionQuery);
    let appVersionQuery='SELECT sb_versioneapp FROM smartbadge WHERE sb_id ='+ id
    let propertyAppVersion=asb.addPropertyAppVersion(id,subModelAdministration,db,appVersionQuery);

    //CREO ELEMENT COLLECTION CURRENT EMPLOYEE
    let propertyCurrentEmployee=asb.addElementsCollectionCurrentEmployee(id,subModelAdministration);
    let emplIdQuery='SELECT dip_id FROM smartbadge WHERE sb_id ='+ id;
    let propertyEmplId=asb.addPropertyEmplId(id,propertyCurrentEmployee,db,emplIdQuery);
    //devo modificare questa query
    let badgeIdQuery='SELECT badge_id FROM smartbadge WHERE sb_id ='+ id;
    let propertyBadgeId=asb.addPropertyBadgeId(id,propertyCurrentEmployee,db,badgeIdQuery);
    let nlrQuery="SELECT * FROM dip WHERE dip_id ="+ badge.dip_id;
    let lastname,name,role=asb.addPropertyNameLastNameRole(id,propertyCurrentEmployee,db,nlrQuery);

    let collectionGroups=asb.addElementsCollectionGroups(id,propertyCurrentEmployee)
    let groupsIdQuery="SELECT gruppodip_id FROM gruppo_dip WHERE dip_id ="+ badge.dip_id
    let propertyGroups=asb.addPropertyGroups(id,collectionGroups,db,groupsIdQuery)

    let collectionCompanies=asb.addElementsCollectionCompanies(id,propertyCurrentEmployee)
    let companyIdQuery="SELECT * FROM ditta WHERE dip_id ="+ badge.dip_id
    let propertyCompany=asb.addPropertyCompany(id,collectionCompanies,db,companyIdQuery)

    let collectionHistory=asb.addElementsCollectionHistory(id,subModelAdministration)
    let collectionEntryHistory=asb.addElementsCollectionEntryHistory(id,collectionHistory);
    let eseQuery="SELECT * FROM hst WHERE dip_id ="+ badge.dip_id;
    let emplId,start1,end1=asb.addPropertyEmplStartEnd(id,collectionEntryHistory,db,eseQuery);

    //CREO SUBMODEL Energy Efficiency
    let subModelEnergyEfficiency=asb.addSubModelEnergyEfficiency(id,assetAdministrationShellBadge)
    let batteryLevelQuery='SELECT sb_livellobatteria FROM smartbadge WHERE sb_id ='+ id;
    let propertyBatteryLevel=asb.addPropertyBatteryLevel(id,subModelEnergyEfficiency,db,batteryLevelQuery)
    let signalLevelQuery='SELECT sb_livellosegnale FROM smartbadge WHERE sb_id ='+ id;
    let propertySignalLevel=asb.addPropertySignalLevel(id,subModelEnergyEfficiency,db,signalLevelQuery)

    //CREO SUBMODEL Notification
    let subModelNotification=asb.addSubModelNotification(id,assetAdministrationShellBadge)
    let collectionLastMessage=asb.addElementsCollectionLastMessage(id,subModelNotification)
    let messageDesQuery="SELECT * FROM msg WHERE msg_id ="+badge.msg_id
    let propertyMessageDescription=asb.addPropertyMessageDescription(id,collectionLastMessage,db,messageDesQuery)
    //Proprietò non aconra implementata nel databse
    let messageStatusQuery="SELCET msg_status FROM msg WHERE msg_id ="+badge.msg_id
    let propertyMessageStatus=asb.addPropertyMessageStatus(id,collectionLastMessage,db,messageStatusQuery)

    //Creo una variabile che mi mantiene tutto l'information model
    let b={
        AssetAdministrationShell: assetAdministrationShellBadge,
        Asset:assetBadge,
        SubModelLocalization:{
            Submodel:subModelLocalization,
            PropertyLocalization:{
                position:propertyPosition,
                ip:propertyIp,
                cellID:propertyCellID,
            },
        },
        SubModelAdministration:{
            Submodel:subModelAdministration,
            PropertyAdministration:{
                soVersion:propertySoVersion,
                appVersion:propertyAppVersion,
                currentEmployee:{
                    elementCollection:propertyCurrentEmployee,
                    propertyCurrentEmployee:{
                        emplId:propertyEmplId,
                        badgeId:propertyBadgeId,
                        lastname:lastname,
                        name:name,
                        role:role,
                        groups:{
                            elementCollection:collectionGroups,
                            groups:propertyGroups,
                        },
                        companies:{
                            elementCollection:collectionCompanies,
                            company:propertyCompany,
                        },

                    },
                    propertyHistory:{
                        elementCollection:collectionHistory,
                        propertyHistory:{
                            elementCollection:collectionEntryHistory,
                            empl:emplId,
                            start:start1,
                            end:end1,
                        }


                    }
                }

            }
        },
        SubModelEnergyEfficiency:{
            Submodel:subModelEnergyEfficiency,
            PropertyEnergyEfficiency:{
                batteryLevel:propertyBatteryLevel,
                signalLevel:propertySignalLevel,
            }
        },
        SubmodelNotification:{
            Submodel:subModelNotification,
            PropertyNotification:{
                LastMessage:{
                    elementCollection:collectionLastMessage,
                    propertyLastMessage:{
                        messageDescription:propertyMessageDescription,
                        messageStatus:propertyMessageStatus,
                    },
                }
            }

        }
    }
    assetAdministrationBadgeArray[id]=b;

    console.log('New SmartBadge added. id: ' +  id);
}

function removeBadge(id){
    let badge = assetAdministrationBadgeArray[id];
    if(badge != undefined){
        asb.deleteBadge(badge.Asset.nodeId)
        asb.deleteBadge(badge.AssetAdministrationShell.nodeId)
        asb.deleteBadge(badge.SubModelAdministration.Submodel.nodeId)
        asb.deleteBadge(badge.SubModelEnergyEfficiency.Submodel.nodeId)
        asb.deleteBadge(badge.SubModelLocalization.Submodel.nodeId)
        asb.deleteBadge(badge.SubmodelNotification.Submodel.nodeId)

        assetAdministrationBadgeArray[id] = undefined;
        console.log("Successfully removed Badge with Id: " + id)
    } else {
        console.log("The badge with id " + id + " doesn't exist");
    }
}

server.initialize(post_initialize);
