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

interface moduleInstanceAttributes {
    dataBlockName: String;
    lineId: String;
    plc: String;
    type: String;
};

export class SSiPP_ModuleInstance {
    private _params: Array<SSiPP_Param>;
    private _reports: Array<SSiPP_Report>;
    private _moduleReport: SSiPP_ModuleReport;
    private _opcClient: OPCUAClient;
    private _opcSession: ClientSession;
    private _moduleInstanceAttributes: moduleInstanceAttributes;
    private readonly _endpointUrl: string;
    private _node: XMLDocument;

    constructor(node: Node) {
        this._opcClient = OPCUAClient.create(options);
        this._moduleInstanceAttributes.plc = <string>xpath.select1("/module_instance/@plc", node).valueOf();
        this._endpointUrl = opcUAPrefix + this._moduleInstanceAttributes.plc + socket;
        this._moduleInstanceAttributes.lineId = <String>xpath.select1("/module_instance/@line_id").valueOf();
        this._moduleInstanceAttributes.dataBlockName = <String>xpath.select1("/module_instance/@datablock_name").valueOf();
        this._moduleInstanceAttributes.type = <String>xpath.select1("/module_instance/@type").valueOf();
    }

    setup = async (): Promise<any> => {
        await this._opcClient.connect(this._endpointUrl, function (err){
            if (err) {
                console.error("Cannot connect to endpoint: " + this._endpointUrl);
            } else {
                console.log("Connected " + this._moduleInstanceAttributes + " on " + this._moduleInstanceAttributes.plc
                    + "/" + this._moduleInstanceAttributes.dataBlockName + ".");
            }
        }.bind(this));
        this._opcSession = await this._opcClient.createSession();
        let result = this._node.evaluate(
            "/module_instance/*",
            this._node,
            null,
            xpath.XPathResult.ANY_TYPE,
            null
        );
        let node = result.iterateNext();
        while(node) {
            if (node.nodeName == "param")
                this._params.push(new SSiPP_Param(node, this._opcSession, this._moduleInstanceAttributes.dataBlockName));
            else if (node.nodeName == "report")
                this._reports.push(new SSiPP_Report(node, this._opcSession, this._moduleInstanceAttributes.dataBlockName));
            else if (node.nodeName == "module_instance_report")
                this._moduleReport = new SSiPP_ModuleReport(node);
            node = result.iterateNext();
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