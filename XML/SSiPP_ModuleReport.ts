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
                case "status":
                    this.status = +el.childNodes[i].textContent;
                    break;
                case "command":
                    this.command = +el.childNodes[i].textContent;
                    break;
                case "message":
                    this._message = el.childNodes[i].textContent;
                    break;
                case "e_msg":
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
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"STATUS\"",
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
            console.log("status: " + this._status);
        });
    }
    private startCommandSubscription (subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"COMMAND\"",
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
            console.log("command: " + this._command);
        });
    }
    private startMessageSubscription(subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"MSG\"",
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
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"E_MSG\"",
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
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"ERROR\"",
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
        if (this._command == 0)
            return;

        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + this._dataBlockName + "\".\"DATA_COMMUNICATION\".\"PLI\".\"COMMAND\"",
            attributeId: opcua.AttributeIds.Value,
            value: {
                statusCode: opcua.StatusCodes.Good,
                value: {
                    dataType: opcua.DataType.Int16,
                    value: this._command
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
        if (this._timeFinished != "") {
            return true;
        }
        return false;
    }

    get xml() : string {
        return "<module_instance_report>" +
            "<time_started>" + this._timeStarted + "</time_started>" +
            "<time_finished>" + this._timeFinished + "</time_finished>" +
            "<status>" + (this._timeFinished == "" ? this._status : "1") + "</status>" +
            "<command>" + (this._command == undefined ? "" : this._command) + "</command>" +
            "<message>" + (this._message == undefined ? "" : this._message) + "</message>" +
            "<e_msg>" + (this._errorMessage == undefined ? "" : this._errorMessage) + "</e_msg>" +
            "<error>" + (this._error == undefined ? "" : this._error) + "</error>" +
            "</module_instance_report>";
    }
}