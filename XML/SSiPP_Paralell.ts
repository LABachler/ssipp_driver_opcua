import {SSiPP_ModuleInstance} from "./SSiPP_ModuleInstance";
import * as xpath from "xpath-ts";

export class SSiPP_Paralell {

    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    constructor(n: Node, rootDoc: XMLDocument) {
        let el: Element = <Element> n;
        for (let i = 0; i < el.childNodes.length; i++) {
            let node: Node = el.childNodes[i];
            if (node.nodeName === "module_instance") {
                this._moduleInstances.push(new SSiPP_ModuleInstance(node, rootDoc));
                (<SSiPP_ModuleInstance>this._moduleInstances[this._moduleInstances.length - 1]).setup().then();
            } else {
                this._moduleInstances.push(new SSiPP_Paralell(node, rootDoc));
            }
        }
    }

    update(n: Node) {
        let el: Element = <Element> n;
        for (let i = 0; i < el.childNodes.length; i++) {
            this._moduleInstances[i].update(el.childNodes[i]);
        }
    }

    get xml(): string {
        let ret = "<paralell>";
        for (let i = 0; i < this._moduleInstances.length; i++)
            ret += this._moduleInstances[i].xml;
        ret += "</paralell>";

        return ret;
    }
}