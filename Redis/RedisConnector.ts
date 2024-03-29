import { Tedis, TedisPool } from "tedis";

export class RedisConnector{
    static PORT = 6379;
    static HOST = "127.0.0.1";

    private _redisString: string;
    private _conn: Tedis;
    private _xmlStringChanged: boolean;

    constructor() {
        this._conn = new Tedis({
            port: RedisConnector.PORT,
            host: RedisConnector.HOST
        });
        this._conn.on("connect", function(){
            console.log("Redis Connector: Redis connected!");
        });
        this._redisString = "";
    }

    get redisString(): string {
        return this._redisString;
    }

    get xmlStringChanged(): boolean {
        return this._xmlStringChanged;
    }

    xmlStringChangeProcessed() {
        this._xmlStringChanged = false;
    }

    setRedis(value: string, processId: string) {
        if (value !== this._redisString){
            this._redisString = value;
            this._conn.set("ssipp_" + processId, value);
        }
    }

    async renewRedisString (processId: string) {
        await this._conn.get("ssipp_" + processId).then(function (result) {
            if (result != this._redisString) {
                this._redisString = result;
                this._xmlStringChanged = true;
            }
        }.bind(this));
    }
}