import { SSiPP_ModuleReport } from "./SSiPP_ModuleReport";
import { SSiPP_Param, SSiPP_Report } from "./SSiPP_Params";

export class SSiPP_ModuleInstance {
    private _params: Array<SSiPP_Param>;
    private _reports: Array<SSiPP_Report>;
    private _moduleReport: SSiPP_ModuleReport;

    get params(): Array<SSiPP_Param> {
        return this._params;
    }

    get reports(): Array<SSiPP_Report> {
        return this._reports;
    }

    get moduleReport(): SSiPP_ModuleReport {
        return this._moduleReport;
    }
}