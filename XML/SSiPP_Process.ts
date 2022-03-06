import { SSiPP_ModuleInstance } from "./SSiPP_ModuleInstance";
import { SSiPP_Paralell } from "./SSiPP_Paralell";
import * as xpath from "xpath-ts";
import { DOMParserImpl } from "xmldom-ts";

export class SSiPP_Process {
    readonly _scale: number;
    readonly _name: String;
    readonly _defaultQuantity: String;
    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    constructor(doc: XMLDocument) {
        let nodes = xpath.select("/process", doc);
        console.log("Process Constructor found process node: " + nodes[0].toString());
        this._scale = <number>xpath.select1("/process/@scale", doc).valueOf();
        this._name = <String>xpath.select1("/process/@name", doc).valueOf();
        this._defaultQuantity = <String>xpath.select1("/process/@default_quantity", doc).valueOf();
        let result = doc.evaluate(
            "/process/*",
            doc,
            null,
            xpath.XPathResult.ANY_TYPE,
            null
        );
        let node = result.iterateNext();
        while(node) {
            console.log("Process Constructor: Node Name Test: " + node.nodeName)
            if (node.nodeName === "module_instance") {
                this._moduleInstances.push(new SSiPP_ModuleInstance(node));
            } else {
                this._moduleInstances.push(new SSiPP_Paralell(node));
            }
            node = result.iterateNext();
        }
    }

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }

    updateProcess(doc: XMLDocument) {

    }
}