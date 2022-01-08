
async function main() {
    console.log("main before calling xml constructor");
    const XMLHandler = require("./XML/XMLHandler");
    let xmlHandler = new XMLHandler.XMLHandler();
    console.log("main called xml constructor");
    while(xmlHandler.running);
}

main();