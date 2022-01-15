import { Tedis, TedisPool } from "tedis";

class RedisConnector{
    static PORT = 6379;
    static HOST = "127.0.0.1";

    private _redisString: string;
    private _conn;

    constructor() {
        this._conn = new Tedis({
            port: RedisConnector.PORT,
            host: RedisConnector.HOST
        });
    }

    get redisString(): string {
        return this._redisString;
    }

    renewRedisString = (processId: number) => {
        this._redisString = this._conn.lrange("ssipp_process_data", processId, processId).then(function (result) {
            console.log(result);
            return result;
        });
    }
}

export { RedisConnector }