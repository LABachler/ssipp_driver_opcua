import { RedisConnector} from "../Redis/RedisConnector";
import { DOMParserImpl as dom } from "xmldom-ts";
import { SSiPP_Process } from "./SSiPP_Process";

export class XMLHandler {
    readonly processId: number;
    private _redisConnector: RedisConnector;
    private _doc: XMLDocument;
    private _running: boolean;
    private _process: SSiPP_Process;

    get running(): boolean {
        return this._running;
    }

    get redisConnector(): RedisConnector {
        return this._redisConnector;
    }

    constructor() {
        if (process.argv[2] === undefined)
            this.processId = 0; //0 is DemoData
        else
            this.processId = parseInt(process.argv[2]);
        this._redisConnector = new RedisConnector();
        this._running = true;
    }

    renewDocFromRedisString() {
        console.log("renewDocFromRedisStringCalled!");
        this._doc = new dom().parseFromString(this._redisConnector.redisString);
        /*return new Promise((resolve, reject) => {
            this._doc = new dom().parseFromString(this._redisConnector.redisString)
        });*/
    }

    private processDoc() {
        this._process = new SSiPP_Process(this._doc);
    }

    renewDoc = async (): Promise<any> => {
        if (this._redisConnector.xmlStringChanged == true) {
            await this.renewDocFromRedisString();
            await this.processDoc();
            this._redisConnector.xmlStringChanged = false;
        }
        return;
    }
}
