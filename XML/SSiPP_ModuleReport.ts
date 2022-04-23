import {
    AttributeIds,
    ClientMonitoredItem,
    ClientSession,
    ClientSubscription,
    TimestampsToReturn
} from "node-opcua-client";
import {DataValue, MonitoringParametersOptions, ReadValueIdOptions} from "node-opcua";
import * as opcua from "node-opcua";

export class SSiPP_ModuleReport {
    private _timeStarted: string;
    private _timeFinished: string;
    private _status: number;
    private _command: number;
    private _message: string;
    private _errorMessage: string;
    private _error: string;
    private _opcSession: ClientSession;
    private readonly _dataBlockName: string;
    private _finished: boolean;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: string, subscription: ClientSubscription) {
        this._finished = false;
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        this.startStatusSubscription(subscription, dataBlockName);
        this.startMessageSubscription(subscription, dataBlockName);
        this.startErrorMessageSubscription(subscription, dataBlockName);
        this.startErrorSubscription(subscription, dataBlockName);
        this.update(n);
    }

    update (n: Node) {
        let el: Element = <Element> n;
        for (let i = 0; i < el.childNodes.length; i++) {
            switch (el.childNodes[i].nodeName) {
                case "time_started":
                    this._timeStarted = el.childNodes[i].textContent;
                    break;
                case "time_finished":
                    this._timeFinished = el.childNodes[i].textContent;
                    break;
                case "status":
                    this._status = +el.childNodes[i].textContent;
                    break;
                case "command":
                    this.command = +el.childNodes[i].textContent;
                    break;
                case "message":
                    this._message = el.childNodes[i].textContent;
                    break;
                case "error_message":
                    this._errorMessage = el.childNodes[i].textContent;
                    break;
                case "error":
                    this._error = el.childNodes[i].textContent;
                    break;
            }
        }
    }

    private startStatusSubscription (subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"PLI\".\"STATUS\"",
            attributeId: AttributeIds.Value
        };

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
            this.status = dataValue.value.value;
        });
    }
    private startMessageSubscription(subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"PLI\".\"MSG\"",
            attributeId: AttributeIds.Value
        };

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
            this._message = dataValue.value.value;
        });
    }
    private startErrorMessageSubscription(subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"PLI\".\"E_MSG\"",
            attributeId: AttributeIds.Value
        };

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
            this._errorMessage = dataValue.value.value;
        });
    }
    private startErrorSubscription(subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"PLI\".\"ERROR\"",
            attributeId: AttributeIds.Value
        };

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
            this._errorMessage = dataValue.value.value;
        });
    }

    set command(command: number) {
        this._command = command;
        this.writeCommand();
    }

    private writeCommand() {
        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + "\".\"COMMUNICATION_DATA\".\"PLI\".\"COMMAND\"",
            attributeId: AttributeIds.Value,
            indexRange: null,
            value: {
                value: {
                    dataType: opcua.DataType.Int32,
                    value: this.command
                }
            }
        }
        this._opcSession.write(nodeToWrite);
    }

    set status(status: number) {
        this._status = status;
        if (this._status == 2)
            this._finished = true;
    }

    isFinished(): boolean {
        return false;
    }

    get xml() : string {
        return "<module_instance_report>" +
            "<time_started>" + this._timeStarted + "</time_started>" +
            "<time_finished></time_finished>" +
            "<status>" + this._status + "</status>" +
            "<command>" + this._command + "</command>" +
            "<message>" + (this._message == undefined ? "" : this._message) + "</message>" +
            "<error_message>" + (this._errorMessage == undefined ? "" : this._errorMessage) + "</error_message>" +
            "<error>" + this._error.toString() + "</error>" +
            "</module_instance_report>";
    }
}