import { XMLHandler } from "./XML/XMLHandler";

async function main() {
    let xmlHandler = new XMLHandler();
    //https://stackoverflow.com/questions/39894777/how-to-have-an-async-endless-loop-with-promises
    Promise.resolve().then(function resolver(): any {
        return xmlHandler.redisConnector.renewRedisString(xmlHandler.processId)
            .then(xmlHandler.renewDoc)
            .then(function (): Promise<any> {
                xmlHandler.redisConnector.setRedis(xmlHandler.xml, xmlHandler.processId);
                return;
            })
            .catch(e => console.log(e))
            .then((function (){
                if (!xmlHandler.isFinished())
                    process.nextTick(resolver);
                }));
    }).catch((error) => {
        console.log("Error: " + error);
    });
}

main();