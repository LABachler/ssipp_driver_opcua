class XMLHandler {
    processId: number;
    redisConnection;
    doc;
    xPath;

    constructor() {
        this.processId = parseInt(process.argv[2]);
        if (this.processId == null) {
            this.processId = 0; // 0 is the stored demo process for testing
        }
        this.redisConnection = RedisConnector.getRedisInstance();
        const DOMParser = require ("xmldom");
        this.renewDocFromRedis();
        this.xPath = require("xpath-ts");
    }

    renewDocFromRedis() {
        this.doc = new DOMParser().parseFromString(
            this.redisConnection.zrange("ssipp_process_data", this.processId, this.processId), "text/xml");
    }
}

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