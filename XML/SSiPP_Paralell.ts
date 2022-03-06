import {SSiPP_ModuleInstance} from "./SSiPP_ModuleInstance";

export class SSiPP_Paralell {
    constructor(node: Node) {
        
    }

    private _moduleInstances: Array<SSiPP_ModuleInstance|SSiPP_Paralell>;

    get moduleInstances(): Array<SSiPP_ModuleInstance | SSiPP_Paralell> {
        return this._moduleInstances;
    }
}