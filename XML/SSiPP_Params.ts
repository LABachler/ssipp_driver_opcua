
export class SSiPP_Param {
    private readonly _name: string;
    private readonly _value: number;

    constructor(e: Element){
        this._name = e.getAttribute("name");
        this._value = parseInt(e.innerHTML);
    }

    get name(): string {
        return this._name;
    }

    get value(): number {
        return this._value;
    }
}

export class SSiPP_Report {
    private readonly _name: string;
    private _value: number;

    constructor(e: Element) {
        this._name = e.getAttribute("name");
        this._value = parseInt(e.innerHTML);
    }

    get name(): string {
        return this._name;
    }

    get value(): number {
        return this._value;
    }
}