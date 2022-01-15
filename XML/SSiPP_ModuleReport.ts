enum State {
    RUNNING,
    HOLDING,
    ABORTING,
    ABORTED,
    STOPPED
}

export class SSiPP_ModuleReport {
    private readonly _timeStarted: string;
    private _timeFinished: string;
    private _status: State;
    private _message: string;
    private _error: string;

    constructor(e: Element) {
        //todo
    }

    get timeStarted(): string {
        return this._timeStarted;
    }

    get timeFinished(): string {
        return this._timeFinished;
    }

    get status(): State {
        return this._status;
    }

    set status(value: State) {
        this._status = value;
    }

    get message(): string {
        return this._message;
    }

    get error(): string {
        return this._error;
    }

    get xml() : string {
        //todo
        return "";
    }
}