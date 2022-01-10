class RedisConnector{
    static PORT = 6379;
    static HOST = "127.0.0.1";
    static IP_PROTOCOL = 4;
    static PASSWORD = '';
    static DB = 0;
    private _redisString: string;

    get redisString(): string {
        return this._redisString;
    }

    static renewRedisString(processId: number) {
        const redis = require("redis");
        const client = redis.createClient("memurai://127.0.0.1:6379");

        client.on('connect', function() {
            console.log('Connected!');
        });

        client.lRange("ssipp_process_data", processId, processId).then(function (result) {
            console.log('Promise');
            this._redisString = result;
        });
    }

    static getRedisClient() {
        const Redis = require("redis");
        const client = Redis.createClient();
        client.on('connect', function() {
            console.log('Connected!');
        });
        return client;
    }

    static getRedisInstance(){
        const Redis = require("ioredis");
        return new Redis();
        /*return new Redis({
            port: RedisConnector.PORT,
            host: RedisConnector.HOST,
            family: RedisConnector.IP_PROTOCOL,
            password: RedisConnector.PASSWORD,
            db: RedisConnector.DB
        });*/
    }
}

export {RedisConnector}