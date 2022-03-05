import { SSiPP_ModuleInstance } from "./SSiPP_ModuleInstance";
import { SSiPP_Paralell } from "./SSiPP_Paralell";
import * as xpath from "xpath-ts";

export class SSiPP_Process {
    readonly _scale: number;
    readonly _name: String;
    readonly _defaultQuantity: String;
    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    constructor(doc) {
    }

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }
}