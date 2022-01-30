import { RedisConnector} from "../Redis/RedisConnector";
import { DOMParserImpl as dom } from "xmldom-ts";

export class XMLHandler {
    readonly processId: number;
    private _redisConnector: RedisConnector;
    private _doc: Document;
    private _running: boolean;

    get running(): boolean {
        return this._running;
    }

    constructor() {
        if (process.argv[2] === undefined)
            this.processId = 0; //0 is DemoData
        else
            this.processId = parseInt(process.argv[2]);
        this._redisConnector = new RedisConnector();
        this._running = true;
    }

    renewRedisString() {
        console.log("renewRedisString called!");
        return new Promise((resolve, reject) => {
            this._redisConnector.renewRedisString(this.processId);
        });
    }

    renewDocFromRedisString() {
        console.log("renewDocFromRedisStringCalled!");
        this._doc = new dom().parseFromString(this._redisConnector.redisString);
        /*return new Promise((resolve, reject) => {
            this._doc = new dom().parseFromString(this._redisConnector.redisString)
        });*/
    }

    private processDoc() {
    }

    public async run() {
        while (this._running) {
            this.renewRedisString();
            setTimeout( () => {
                if (this._redisConnector.xmlStringChanged) {
                    this.renewDocFromRedisString();
                    this.processDoc();
                    this._redisConnector.xmlStringChangeProcessed();
                }
            }, 5000);
        }
    }
}
