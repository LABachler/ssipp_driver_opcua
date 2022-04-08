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

export class SSiPP_ModuleReport {
    private _timeStarted: string;
    private _timeFinished: string;
    private _status: State;
    private _message: string;
    private _error: string;
    private _statusSubscription: ClientSubscription;
    private _messageSubscription: ClientSubscription;
    private _errorSubscription: ClientSubscription;
    private _opcSession: ClientSession;
    private readonly _dataBlockName: string;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: string) {
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        this.startStatusSubscription(opcSession, dataBlockName);
        this.startMessageSubscription(opcSession, dataBlockName);
        this.startErrorSubscription(opcSession, dataBlockName);
        this.update(n);
    }

    update (n: Node) {
        let el: Element = <Element> n;
        for (let i = 0; i < el.childNodes.length; i++) {
            switch (el.childNodes[i].nodeName) {
                case "status":
                    this.status = el.childNodes[i].textContent;
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

    private startStatusSubscription (opcSession: ClientSession, dataBlockName: string) {
        this._statusSubscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10,
        }); //TODO understand options, right now its just 10 s monitor
        this._statusSubscription.on("started", function(){
            console.log("Status-Subscription for " + dataBlockName + " started.");
        }).on("keepalive", function () {
            console.log("Status-Subscription for " + dataBlockName + " keepalive.");
        }).on("terminated", function () {
            console.error("Status-Subscription for " + dataBlockName + " terminated.");
        });

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
            this._statusSubscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this.status = dataValue.value.value;
        });
    }

    private startMessageSubscription(opcSession: ClientSession, dataBlockName: string) {
        this._messageSubscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        }); //TODO understand options, right now its just 10 s monitor

        this._messageSubscription.on("started", function(){
            console.log("Message-Subscription for " + dataBlockName + " started.");
        }).on("keepalive", function () {
            console.log("Message-Subscription for " + dataBlockName + " keepalive.");
        }).on("terminated", function () {
            console.error("Message-Subscription for " + dataBlockName + " terminated.");
        });

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
            this._statusSubscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this._message = dataValue.value.value;
            console.log("Message change: " + this._message);
        });
    }

    private startErrorSubscription(opcSession: ClientSession, dataBlockName: string) {
        this._errorSubscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        }); //TODO understand options, right now its just 10 s monitor

        this._messageSubscription.on("started", function(){
            console.log("Error-Subscription for " + dataBlockName + "started.");
        }).on("keepalive", function () {
            console.log("Error-Subscription for " + dataBlockName + " keepalive.");
        }).on("terminated", function () {
            console.error("Error-Subscription for " + dataBlockName + "terminated.");
        });

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
            this._messageSubscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this._message = dataValue.value.value;
        });
    }

    get status(): string {
        if (this._status === State.RUNNING)
            return "RUNNING";
        else if (this._status === State.HOLDING)
            return "HOLDING";
        else if (this._status === State.ABORTING)
            return "ABORTING";
        else if (this._status === State.ABORTED)
            return "ABORTED";
        else if (this._status === State.STOPPED)
            return "STOPPED";
        else if (this._status === State.IDLE)
            return "IDLE";
    }

    set status(status: string) {
        console.log("Status string: " + status);
        let oldStatus: string = this.status;
        if (status === "RUNNING")
            this._status = State.RUNNING;
        else if (status === "HOLDING")
            this._status = State.HOLDING;
        else if (status === "ABORTING")
            this._status = State.ABORTING;
        else if (status === "ABORTED")
            this._status = State.ABORTED;
        else if (status === "STOPPED")
            this._status = State.STOPPED;
        else if (status === "IDLE")
            this._status = State.IDLE;
        else{
            console.error("Could not recognize state \"" + status + "\".");
            this._status = State.IDLE;
        }
        if (oldStatus !== this.status)
            this.writeStatus();
    }

    private writeStatus() {
        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + this._dataBlockName + "\".\"Status\"",
            attributeId: AttributeIds.Value,
            indexRange: null,
            value: {
                value: {
                    dataType: opcua.DataType.String,
                    value: this.status
                }
            }
        }
        this._opcSession.write(nodeToWrite);
        if (this._status === State.STOPPED)
            this.terminateSessions();
    }


    terminateSessions() {
        this._messageSubscription.terminate();
        this._statusSubscription.terminate();
        this._errorSubscription.terminate();
    }

    get xml() : string {
        return "<module_instance_report>" +
            "<time_started>" + this._timeStarted + "</time_started>" +
            "<time_finished></time_finished>" +
            "<status>" + this.status + "</status>" +
            "<message>" + (this._message == undefined ? "" : this._message) + "</message>" +
            "<error>" + (this._error == undefined ? "" : this._error) + "</error>" +
            "</module_instance_report>";
    }
}