import { XMLHandler } from "./XML/XMLHandler";

async function main() {
    let xmlHandler = new XMLHandler();
    //https://stackoverflow.com/questions/39894777/how-to-have-an-async-endless-loop-with-promises
    Promise.resolve().then(function resolver() {
        return xmlHandler.renewRedisString()
            .then(resolver);
    }).catch((error) => {
        console.log("Error: " + error);
    });
}

main();