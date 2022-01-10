
async function main() {
    const Redis = require('ioredis');
    const _ = require('lodash');

    const redis = new Redis();
    redis.set('nodeTest', 'OK');
    redis.get("nodeTest", function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result); // Promise resolves to "bar"
        }
    });

    while (true);
}

main();