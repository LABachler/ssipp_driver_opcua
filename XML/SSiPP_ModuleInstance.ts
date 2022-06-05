import { SSiPP_ModuleReport } from "./SSiPP_ModuleReport";
import { SSiPP_Param, SSiPP_Report } from "./SSiPP_Params";
import { ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy, ClientSubscription } from "node-opcua-client";
import * as xpath from "xpath-ts";

const socket = ":4840";
const opcUAPrefix = "opc.tcp://"
const OPCUAUser = "diplomarbeit";
const OPCUAPassword = "NLB2022";

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 3
}
const options = {
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpointMustExist: false,
};

class moduleInstanceAttributes {
    public dataBlockName: string;
    public lineId: string;
    public plc: string;
    public type: string;
    public driverType: string;
}

export class SSiPP_ModuleInstance {
    private _params: Array<SSiPP_Param>;
    private _reports: Array<SSiPP_Report>;
    private _moduleReport: SSiPP_ModuleReport;
    private _opcClient: OPCUAClient;
    private _opcSession: ClientSession;
    private _moduleInstanceAttributes: moduleInstanceAttributes;
    private readonly _endpointUrl: string;
    private _element: Element;
    private _subscription: ClientSubscription;

    constructor(doc: XMLDocument) {
        let node = xpath.select("/module_instance", doc);
        console.log("Module instance constructor: " + node);
        this._opcClient = OPCUAClient.create(options);
        let el: Element = <Element>node[0];
        this._moduleInstanceAttributes = new moduleInstanceAttributes();
        this._moduleInstanceAttributes.plc = el.attributes.getNamedItem("plc").value;
        this._endpointUrl = opcUAPrefix + this._moduleInstanceAttributes.plc + socket;
        this._moduleInstanceAttributes.lineId = el.attributes.getNamedItem("line_id").value;
        this._moduleInstanceAttributes.dataBlockName = el.attributes.getNamedItem("datablock_name").value;
        this._moduleInstanceAttributes.type = el.attributes.getNamedItem("type").value;
        this._moduleInstanceAttributes.driverType = el.attributes.getNamedItem("driver").value;
        this._element = el;
        this._params = new Array<SSiPP_Param>();
        this._reports = new Array<SSiPP_Report>();
    }

    setup = async (): Promise<any> => {
        this._opcClient.connect(this._endpointUrl, async function (err) {
            if (err) {
                console.error("Cannot connect to endpoint: " + this._endpointUrl);
            } else {
                console.log("Connected " + this._moduleInstanceAttributes + " on " + this._moduleInstanceAttributes.plc
                    + "/" + this._moduleInstanceAttributes.dataBlockName + ".");
                this._opcSession = await this._opcClient.createSession(/*{userName: OPCUAUser, password: OPCUAPassword}*/);
                this._subscription = ClientSubscription.create(this._opcSession, {
                    requestedPublishingInterval: 1000,  // subscription publishing interval
                    requestedLifetimeCount: 100,        // how often publishing interval expires without having a connection
                    requestedMaxKeepAliveCount: 10,     // how many times the publishing interval expires before server sends empty msg
                    maxNotificationsPerPublish: 0,      // endless notifications per publish
                    publishingEnabled: true,
                    priority: 10
                });

                this._subscription.on("started", function(){
                    console.log("Subscription for " + this._moduleInstanceAttributes.dataBlockName + "started.");
                }).on("keepalive", function () {
                    console.log("Error-Subscription for " + this._moduleInstanceAttributes.dataBlockName + " keepalive.");
                }).on("terminated", function () {
                    console.error("Error-Subscription for " + this._moduleInstanceAttributes.dataBlockName + "terminated.");
                });

                for (let i = 0; i < this._element.childNodes.length; i++){
                    let node = this._element.childNodes[i];
                    if (node.nodeName == "param")
                        this._params.push(new SSiPP_Param(node, this._opcSession,
                            this._moduleInstanceAttributes.dataBlockName));
                    else if (node.nodeName == "report")
                        this._reports.push(new SSiPP_Report(node, this._opcSession,
                            this._moduleInstanceAttributes.dataBlockName, this._subscription));
                    else if (node.nodeName == "module_instance_report")
                        this._moduleReport = new SSiPP_ModuleReport(this._element.childNodes[i], this._opcSession,
                            this._moduleInstanceAttributes.dataBlockName, this._subscription);
                }
            }
        }.bind(this));
    }

    update(node: Node) {
        this._element = <Element> node;
        for (let i = 0, paramsCounter = 0; i < this._element.childNodes.length; i++){
            let node = this._element.childNodes[i];
            if (node.nodeName == "param")
                this._params[paramsCounter++].update(node);
            else if (node.nodeName == "module_report"){
                this._moduleReport.update(node);
                if (this._moduleReport.isFinished())
                    this._subscription.terminate();
            }
        }
    }

    get xml(): string {
        let ret = "<module_instance " +
            "datablock_name=\"" + this._moduleInstanceAttributes.dataBlockName + "\" " +
            "line_id=\"" + this._moduleInstanceAttributes.lineId + "\" " +
            "plc=\"" + this._moduleInstanceAttributes.plc + "\" " +
            "type=\"" + this._moduleInstanceAttributes.type + "\"" +
            "driver=\"" + this._moduleInstanceAttributes.driverType + "\"" +
            ">";
        ret += this._moduleReport.xml;
        for (let i = 0; i < this._params.length; i++)
            ret += this._params[i].xml;
        for (let i = 0; i < this._reports.length; i++)
            ret += this._reports[i].xml;
        ret += "</module_instance>";

        return ret;
    }

    isFinished(): boolean {
        return this._moduleReport.isFinished();
    }
}