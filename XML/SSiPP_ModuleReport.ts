import {
    AttributeIds,
    ClientMonitoredItem,
    ClientSession,
    ClientSubscription,
    TimestampsToReturn
} from "node-opcua-client";
import {DataValue, MonitoringParametersOptions, ReadValueIdOptions} from "node-opcua";
import * as opcua from "node-opcua";

enum State {
    RUNNING,
    HOLDING,
    ABORTING,
    ABORTED,
    STOPPED,
    IDLE
}

enum Command {

}

export class SSiPP_ModuleReport {
    private _timeStarted: string;
    private _timeFinished: string;
    private _status: String;
    private _command: Command;
    private _message: string;
    private _error: string;
    private _opcSession: ClientSession;
    private readonly _dataBlockName: string;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: string, subscription: ClientSubscription) {
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        this.startStatusSubscription(subscription, dataBlockName);
        this.startMessageSubscription(subscription, dataBlockName);
        this.startErrorSubscription(subscription, dataBlockName);
        this.update(n);
    }

    update (n: Node) {
        let el: Element = <Element> n;
        for (let i = 0; i < el.childNodes.length; i++) {
            switch (el.childNodes[i].nodeName) {
                case "status":
                    this._status = el.childNodes[i].textContent;
                    break;
                case "command":
                    this.command = el.childNodes[i].textContent;
                    break;
                case "time_started":
                    this._timeStarted = el.childNodes[i].textContent;
                    break;
                case "time_finished":
                    this._timeFinished = el.childNodes[i].textContent;
                    break;
            }
        }
    }

    private startStatusSubscription (subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"Status\"",
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
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"Message\"",
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
            console.log("Message change: " + this._message);
        });
    }
    private startErrorSubscription(subscription: ClientSubscription, dataBlockName: string) {
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"Error\"",
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

    //todo
    set status(status: number) {
        console.log("Status string: " + status);
        if (status == State.RUNNING)
            this._status = "Running";
        else if (status == State.HOLDING)
            this._status = "HOLDING";
        else if (status == State.ABORTING)
            this._status = "ABORTING";
        else if (status == State.ABORTED)
            this._status = "ABORTED";
        else if (status == State.STOPPED)
            this._status = "STOPPED";
        else if (status == State.IDLE)
            this._status = "IDLE";
        else{
            console.error("Could not recognize state \"" + status + "\".");
            this._status = "???";
        }
    }

    set command(command: String) {
        if (command.length == 0)
            return;

        this.writeCommand();
    }

    private writeCommand() {
        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + this._dataBlockName + "\".\"COMMAND\"",
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

    //todo
    get command(): String {
        return "";
    }

    //todo
    isFinished(): boolean {
        return false;
    }

    get xml() : string {
        return "<module_instance_report>" +
            "<time_started>" + this._timeStarted + "</time_started>" +
            "<time_finished></time_finished>" +
            "<status>" + this._status + "</status>" +
            "<message>" + (this._message == undefined ? "" : this._message) + "</message>" +
            "<error>" + (this._error == undefined ? "" : this._error) + "</error>" +
            "</module_instance_report>";
    }
}