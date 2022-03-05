import { SSiPP_ModuleReport } from "./SSiPP_ModuleReport";
import { SSiPP_Param, SSiPP_Report } from "./SSiPP_Params";
import { ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy } from "node-opcua-client";

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

    constructor(node: Node) {
        this._opcClient = OPCUAClient.create(options);

    }

    setup = async (): Promise<any> => {
        const endpointUrl = "opc.tcp://10.0.0.120:4840";
        await this._opcClient.connect("opc.tcp://10.0.0.120:4840", function (err){
            if (err) {
                console.error("Cannot connect to endpoint: " + endpointUrl);
            } else {
                console.log("Connected " + this._moduleInstanceAttributes + " on " + endpointUrl + "/"
                    + this._moduleInstanceAttributes.dataBlockName + ".");
            }
        }.bind(this));
        this._opcSession = await this._opcClient.createSession();
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