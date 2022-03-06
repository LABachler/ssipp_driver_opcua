import { RedisConnector} from "../Redis/RedisConnector";
import { DOMParserImpl as dom } from "xmldom-ts";
import { SSiPP_Process } from "./SSiPP_Process";
import { ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy } from "node-opcua-client";
import * as xpath from "xpath-ts";

export class XMLHandler {
    readonly processId: number;
    private _redisConnector: RedisConnector;
    private _doc: XMLDocument;
    private _process: SSiPP_Process;

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
        console.log("XMLHandler: renewDocFromRedisString called!");
        this._doc = new dom().parseFromString(this._redisConnector.redisString);
    }

    private processDoc() {
        console.log("XMLHandler: processDoc called!");
        this._process = new SSiPP_Process(this._doc);
        this._redisConnector.xmlStringChangeProcessed();
    }

    renewDoc = async (): Promise<any> => {
        if (this._redisConnector.xmlStringChanged == true) {
            this.renewDocFromRedisString();
            this.processDoc();
        }
        return;
    }
}
