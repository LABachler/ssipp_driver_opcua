import { SSiPP_ModuleInstance } from "./SSiPP_ModuleInstance";
import { SSiPP_Paralell } from "./SSiPP_Paralell";
import * as xpath from "xpath-ts";

export class SSiPP_Process {
    readonly _scale: number;
    readonly _name: String;
    readonly _defaultQuantity: String;
    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;
    readonly _id: number;

    constructor(doc: XMLDocument) {
        let nodes = xpath.select("/process", doc);
        console.log("Process Constructor found process node: " + nodes[0].toString());
        //TODO reenable
        //this._scale = <number>xpath.select1("/process/@scale", doc).valueOf();
        this._name = <String>xpath.select1("/process/@name", doc).valueOf();
        this._defaultQuantity = <String>xpath.select1("/process/@default_quantity", doc).valueOf();
        this._id = <number>xpath.select1("/process/@id", doc).valueOf();
        let children: Node[] = <Node[]>xpath.select("/process/*", doc);

        this._moduleInstances = new Array<SSiPP_ModuleInstance | SSiPP_Paralell>();
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            console.log("Process Constructor: Node Name Test: " + node.nodeName);
            if (node.nodeName === "module_instance") {
                this._moduleInstances.push(new SSiPP_ModuleInstance(node, doc));
                (<SSiPP_ModuleInstance>this._moduleInstances[this._moduleInstances.length - 1]).setup().then();
            } else {
                this._moduleInstances.push(new SSiPP_Paralell(node, doc));
            }
        }
    }

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }

    updateProcess(doc: XMLDocument) {
        let children: Node[] = <Node[]>xpath.select("/process/*", doc);
        for (let i = 0; i < this._moduleInstances.length && i < children.length; i++){
            this._moduleInstances[i].update(children[i]);
        }
    }

    get xml(): string {
        let ret = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?>" +
            "<process" +
            this._defaultQuantity +
            this._id +
            this._scale +
            this._name +
            ">";
        for (let i = 0; i < this._moduleInstances.length; i++) {
            ret += this._moduleInstances[i].xml;
        }
        ret += "</process>";
        return ret;
    }
}