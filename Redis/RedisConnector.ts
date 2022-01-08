class RedisConnector{
    static PORT = 6379;
    static HOST = "localhost";
    static IP_PROTOCOL = 4;
    static PASSWORD = '';
    static DB = 0;

    static getRedisInstance(){
        const Redis = require("ioredis");
        return new Redis({
            port: RedisConnector.PORT,
            host: RedisConnector.HOST,
            family: RedisConnector.IP_PROTOCOL,
            password: RedisConnector.PASSWORD,
            db: RedisConnector.DB
        });
    }
}

export {RedisConnector}