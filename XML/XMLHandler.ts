import { RedisConnector} from "../Redis/RedisConnector";
import { DOMParserImpl as dom } from "xmldom-ts";
import {SSiPP_ModuleInstance} from "./SSiPP_ModuleInstance";

export class XMLHandler {
    readonly processId: string;
    private readonly _redisConnector: RedisConnector;
    private _doc: XMLDocument;
    private _moduleInstance: SSiPP_ModuleInstance;

    get redisConnector(): RedisConnector {
        return this._redisConnector;
    }

    constructor() {
        if (process.argv[2] === undefined)
            this.processId = "" + 0; //0 is DemoData
        else
            this.processId = process.argv[2];
        this._redisConnector = new RedisConnector();
    }

    renewDocFromRedisString() {
        console.log("XMLHandler: renewDocFromRedisString called!");
        this._doc = new dom().parseFromString(this._redisConnector.redisString.toString());
    }

    private processDoc() {
        console.log("XMLHandler: processDoc called!");
        if (this._moduleInstance == null)
            this._moduleInstance = new SSiPP_ModuleInstance(this._doc);
        else
            this._moduleInstance.update(this._doc);
        this._redisConnector.xmlStringChangeProcessed();
    }

    renewDoc = async (): Promise<any> => {
        if (this._redisConnector.xmlStringChanged == true) {
            this.renewDocFromRedisString();
            this.processDoc();
        }
        return;
    }

    get xml():string {
        return this._moduleInstance.xml;
    }

    isFinished() : boolean {
        return this._moduleInstance.isFinished();
    }
}
