import { RedisConnector} from "../Redis/RedisConnector";
import { DOMParserImpl as dom } from "xmldom-ts";
import { SSiPP_Process } from "./SSiPP_Process";
import { ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy } from "node-opcua-client";
import * as xpath from "xpath-ts";

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

export class XMLHandler {
    readonly processId: number;
    private _redisConnector: RedisConnector;
    private _doc: XMLDocument;
    private _process: SSiPP_Process;
    private _opcClient: OPCUAClient;
    private _opcSession: ClientSession;

    get redisConnector(): RedisConnector {
        return this._redisConnector;
    }

    constructor() {
        if (process.argv[2] === undefined)
            this.processId = 0; //0 is DemoData
        else
            this.processId = parseInt(process.argv[2]);
        this._redisConnector = new RedisConnector();
    }

    renewDocFromRedisString() {
        console.log("renewDocFromRedisStringCalled!");
        this._doc = new dom().parseFromString(this._redisConnector.redisString);
    }

    private processDoc() {
        this._process = new SSiPP_Process(this._doc);
    }

    renewDoc = async (): Promise<any> => {
        if (this._redisConnector.xmlStringChanged == true) {
            await this.renewDocFromRedisString();
            await this.processDoc();
            this._redisConnector.xmlStringChangeProcessed();
            if (this._opcSession == null){
                this._opcClient = OPCUAClient.create(options);
                var endpointUrl = "opc.tcp://10.0.0.120:4840"; //TODO filter Doc for target ip
                await this._opcClient.connect(endpointUrl);
                this._opcSession = await this._opcClient.createSession();
            }
        }
        return;
    }
}
