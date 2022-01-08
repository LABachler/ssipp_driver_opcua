const MyRedisConnector = require("../Redis/RedisConnector")
const MyDOMParser = require ("xmldom");
const MyXPath = require("xpath-ts");


class XMLHandler {
    readonly processId: number;
    private _redisConnection;
    private _doc;
    private _xPath;
    private _running: boolean;

    get running(): boolean {
        return this._running;
    }

    constructor() {
        console.log("XML Constructor called");
        if (process.argv[2] === undefined)
            this.processId = 0; //0 is DemoData
        else
            this.processId = parseInt(process.argv[2]);
        this._redisConnection = MyRedisConnector.RedisConnector.getRedisInstance();
        this.renewDocFromRedis();
        this._xPath = require("xpath-ts"); //TODO
        this._running = true;
    }

    renewDocFromRedis() {
        this._doc = new MyDOMParser.DOMParser().parseFromString(
            this._redisConnection.zrange("ssipp_process_data", this.processId, this.processId), "text/xml");
        console.log(this._doc.toString());
    }
}

export {XMLHandler}