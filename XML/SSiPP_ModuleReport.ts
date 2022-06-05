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

    constructor(n: Node, opcSession: ClientSession, dataBlockName: string, subscription: ClientSubscription) {
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        this.startStatusSubscription(subscription, dataBlockName);
        this.startMessageSubscription(subscription, dataBlockName);
        this.startErrorMessageSubscription(subscription, dataBlockName);
        this.startErrorSubscription(subscription, dataBlockName);
        this.startCommandSubscription(subscription, dataBlockName)
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
                case "STATUS":
                    this.status = +el.childNodes[i].textContent;
                    break;
                case "COMMAND":
                    this.command = +el.childNodes[i].textContent;
                    break;
                case "MESSAGE":
                    this._message = el.childNodes[i].textContent;
                    break;
                case "E_MSG":
                    this._errorMessage = el.childNodes[i].textContent;
                    break;
                case "ERROR":
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
    private startCommandSubscription (subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"COMMUNICATION_DATA\".\"PLI\".\"COMMAND\"",
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
            this._command = dataValue.value.value;
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


    get status(): number {
        if (this._status == undefined)
            return 1;
        return this._status;
    }

    set status(status: number) {
        this._status = status;
    }

    isFinished(): boolean {
        if (this.status == 2 && this._command == 5)
            return true;
        return false;
    }

    get xml() : string {
        return "<module_instance_report>" +
            "<time_started>" + this._timeStarted + "</time_started>" +
            "<time_finished></time_finished>" +
            "<STATUS>" + this._status + "</STATUS>" +
            "<COMMAND>" + this._command + "</COMMAND>" +
            "<MESSAGE>" + (this._message == undefined ? "" : this._message) + "</MESSAGE>" +
            "<E_MSG>" + (this._errorMessage == undefined ? "" : this._errorMessage) + "</E_MSG>" +
            "<ERROR>" + this._error.toString() + "</ERROR>" +
            "</module_instance_report>";
    }
}