import {
    AttributeIds,
    ClientMonitoredItem,
    ClientSession,
    ClientSubscription,
    TimestampsToReturn
} from "node-opcua-client";
import * as opcua from "node-opcua";
import { DataValue, MonitoringParametersOptions, ReadValueIdOptions } from "node-opcua";

export class SSiPP_Param {
    private readonly _name: string;
    private readonly _plcName: string;
    private readonly _engineeringUnit: string;
    private readonly _minVal: string;
    private readonly _maxVal: string;
    private _value: number;
    private _opcSession: ClientSession;
    private readonly _dataBlockName: String;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String){
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        let el: Element = <Element> n;
        this._name = el.attributes.getNamedItem("name").value;
        this._plcName = el.attributes.getNamedItem("plc_name").value;
        this._engineeringUnit = el.attributes.getNamedItem("engineering_unit").value;
        this._minVal = el.attributes.getNamedItem("min_val").value;
        this._maxVal = el.attributes.getNamedItem("max_val").value;
        console.log("Param value: " + el.textContent);
        this._value = parseInt(el.textContent);
        console.log("Param " + this._name + " has value " + this._value);
        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"" + this._name + "\"",
            attributeId: AttributeIds.Value,
            indexRange: null,
            value: {
                value: {
                    dataType: opcua.DataType.Double,
                    value: this._value
                }
            }
        }
        opcSession.write(nodeToWrite);
    }

    update(n: Node) {
        let el: Element = <Element> n;
        if (parseInt(el.textContent) != this._value) {
            this._value = parseInt(el.textContent);
            const nodeToWrite = {
                nodeId: "ns=3;s=\"" + this._dataBlockName + "\".\"COMMUNICATION_DATA\".\"" + this._name + "\"",
                attributeId: AttributeIds.Value,
                indexRange: null,
                value: {
                    value: {
                        dataType: opcua.DataType.Double,
                        value: this._value
                    }
                }
            }
            this._opcSession.write(nodeToWrite);
        }
    }

    get name(): string {
        return this._name;
    }

    get value(): number {
        return this._value;
    }

    get xml(): string {
        return "<param name=\"" + this.name + "\"" +
                    "engineering_unit=\"" + this._engineeringUnit + "\"" +
                    "plc_name=\"" + this._plcName + "\"" +
                    "min_val=\"" + this._minVal + "\"" +
                    "max_val=\"" + this._maxVal + "\"" +
            ">" +
            (this.value == undefined ? "" : this.value) +
            "</param>";
    }
}

export class SSiPP_Report {
    private readonly _name: string;
    private readonly _plcName: string;
    private readonly _engineeringUnit: string;
    private _value: string;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String, subscription: ClientSubscription) {
        let el: Element = <Element> n;
        this._name = el.attributes.getNamedItem("name").value;
        this._plcName = el.attributes.getNamedItem("plc_name").value;
        this._engineeringUnit = el.attributes.getNamedItem("engineering_unit").value;

        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"" + this._plcName + "\"",
            attributeId: AttributeIds.Value
        }
        const parameters: MonitoringParametersOptions = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };

        const monitoredItem = ClientMonitoredItem.create(
            subscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this._value = dataValue.value.value;
            console.log(this._name + " has value: " + this._value);
        });
    }

    get name(): string {
        return this._name;
    }

    get value(): string {
        if (this._value == undefined)
            return "";
        return this._value;
    }

    get xml(): string {
        return "<report name=\"" + this.name + "\"" +
            "engineering_unit=\"" + this._engineeringUnit + "\"" +
            "plc_name=\"" + this._plcName + "\"" +
            ">" +
            this.value +
            "</report>";
    }
}