const MyRedisConnector = require("../Redis/RedisConnector")
const MyDOMParser = require ("xmldom");
const MyXPath = require("xpath-ts");


class XMLHandler {
    readonly processId: number;
    private _redisConnector;
    private _doc;
    private _xPath;
    private _running: boolean;

    get running(): boolean {
        return this._running;
    }

    constructor() {
        if (process.argv[2] === undefined)
            this.processId = 0; //0 is DemoData
        else
            this.processId = parseInt(process.argv[2]);
        this._redisConnector = new MyRedisConnector.RedisConnector();
        this.renewDocFromRedis();
        this._xPath = require("xpath-ts"); //TODO
        this._running = true;
    }

    renewDocFromRedis() {
        this._redisConnector.renewRedisString(this.processId);
    }
}

export {XMLHandler}
