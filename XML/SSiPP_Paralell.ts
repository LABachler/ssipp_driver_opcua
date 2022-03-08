import {SSiPP_ModuleInstance} from "./SSiPP_ModuleInstance";
import * as xpath from "xpath-ts";

export class SSiPP_Paralell {

    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    constructor(n: Node, rootDoc: XMLDocument) {
        let result = rootDoc.evaluate(
            "/paralell/*",
            n,
            null,
            xpath.XPathResult.ANY_TYPE,
            null
        );
        let node = result.iterateNext();
        while(node) {
            console.log("Process Constructor: Node Name Test: " + node.nodeName)
            if (node.nodeName === "module_instance") {
                this._moduleInstances.push(new SSiPP_ModuleInstance(node, rootDoc));
            } else {
                this._moduleInstances.push(new SSiPP_Paralell(node, rootDoc));
            }
            node = result.iterateNext();
        }
    }

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }
}