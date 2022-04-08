import { SSiPP_ModuleReport } from "./SSiPP_ModuleReport";
import { SSiPP_Param, SSiPP_Report } from "./SSiPP_Params";
import { ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy } from "node-opcua-client";
import * as xpath from "xpath-ts";

const socket = ":4840";
const opcUAPrefix = "opc.tcp://"

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
};

export class SSiPP_ModuleInstance {
    private _params: Array<SSiPP_Param>;
    private _reports: Array<SSiPP_Report>;
    private _moduleReport: SSiPP_ModuleReport;
    private _opcClient: OPCUAClient;
    private _opcSession: ClientSession;
    private _moduleInstanceAttributes: moduleInstanceAttributes;
    private readonly _endpointUrl: string;
    private _rootDoc: XMLDocument;
    private _element: Element;

    constructor(node: Node, rootDoc: XMLDocument) {
        console.log("Module instance constructor: " + node);
        this._opcClient = OPCUAClient.create(options);
        let el: Element = <Element>node;
        this._moduleInstanceAttributes = new moduleInstanceAttributes();
        this._moduleInstanceAttributes.plc = el.attributes.getNamedItem("plc").value;
        this._endpointUrl = opcUAPrefix + this._moduleInstanceAttributes.plc + socket;
        this._moduleInstanceAttributes.lineId = el.attributes.getNamedItem("line_id").value;
        this._moduleInstanceAttributes.dataBlockName = el.attributes.getNamedItem("datablock_name").value;
        this._moduleInstanceAttributes.type = el.attributes.getNamedItem("type").value;
        this._rootDoc = rootDoc;
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
                this._opcSession = await this._opcClient.createSession();
                for (let i = 0; i < this._element.childNodes.length; i++){
                    let node = this._element.childNodes[i];
                    if (node.nodeName == "param")
                        this._params.push(new SSiPP_Param(node, this._opcSession, this._moduleInstanceAttributes.dataBlockName));
                    else if (node.nodeName == "report")
                        this._reports.push(new SSiPP_Report(node, this._opcSession, this._moduleInstanceAttributes.dataBlockName));
                    else if (node.nodeName == "module_instance_report")
                        this._moduleReport = new SSiPP_ModuleReport(this._element.childNodes[i], this._opcSession,
                            this._moduleInstanceAttributes.dataBlockName);
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
            else if (node.nodeName == "module_report")
                this._moduleReport.update(node);
        }
    }

    get params(): Array<SSiPP_Param> {
        return this._params;
    }

    get reports(): Array<SSiPP_Report> {
        return this._reports;
    }

    get moduleReport(): SSiPP_ModuleReport {
        return this._moduleReport;
    }
}