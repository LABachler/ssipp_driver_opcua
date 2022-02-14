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
            console.log("Redis connected!");
        });
    }

    get conn(): Tedis {
        return this._conn;
    }

    get redisString(): string {
        return this._redisString;
    }

    get xmlStringChanged(): boolean {
        return this._xmlStringChanged;
    }

    set xmlStringChanged(value: boolean) {
        this._xmlStringChanged = value;
    }

    xmlStringChangeProcessed() {
        this._xmlStringChanged = false;
    }

    async renewRedisString (processId: number) {
        await this._conn.lrange("ssipp_process_data", processId, processId).then(function (result) {
            if (result !== this.redisString){
                console.log("New String from Redis: ");
                console.log(result);
                this._redisString = result;
                this._xmlStringChanged = true;
            }
        }.bind(this));
        return;
    }
}