import { SSiPP_ModuleInstance } from "./SSiPP_ModuleInstance";
import { SSiPP_Paralell } from "./SSiPP_Paralell";
import * as xpath from "xpath-ts";

export class SSiPP_Process {
    readonly scale: number;
    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    constructor(doc: Document) {
        //TODO https://www.npmjs.com/package/xpath-ts
    }

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }
}