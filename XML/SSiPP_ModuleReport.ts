import {
    AttributeIds,
    ClientMonitoredItem,
    ClientSession,
    ClientSubscription,
    TimestampsToReturn
} from "node-opcua-client";
import {DataValue, MonitoringParametersOptions, ReadValueIdOptions} from "node-opcua";

enum State {
    RUNNING,
    HOLDING,
    ABORTING,
    ABORTED,
    STOPPED
}

export class SSiPP_ModuleReport {
    private _timeStarted: string;
    private _timeFinished: string;
    private _status: State;
    private _message: string;
    private _error: string;
    private _statusSubscription: ClientSubscription;
    private _messageSubscription: ClientSubscription;
    private _errorSubscription: ClientSubscription; //todo do we need this?

    constructor(opcSession: ClientSession, dataBlockName: string) {
        this.startStatusSubscription(opcSession, dataBlockName);
        this.startMessageSubscription(opcSession, dataBlockName);
        this.startErrorSubscription(opcSession, dataBlockName);
    }

    private startStatusSubscription (opcSession: ClientSession, dataBlockName: string) {
        this._statusSubscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        }); //TODO understand options, right now its just 10 s monitor
        this._statusSubscription.on("started", function(){
            console.log("Status-Subscription for " + this._name + "started.");
        }).on("keepalive", function () {
            console.log("Status-Subscription for " + this._name + "keepalive.");
        }).on("terminated", function () {
            console.error("Status-Subscription for " + this._name + "terminated.");
        });

        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"STATUS\"",
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
            if (dataValue.toString() === "Running")
                this._status = State.RUNNING;
            else if (dataValue.toString() === "HOLDING")
                this._status = State.HOLDING;
            else if (dataValue.toString() === "ABORTING")
                this._status = State.ABORTING;
            else if (dataValue.toString() === "ABORTED")
                this._status = State.ABORTED;
            else if (dataValue.toString() === "STOPPED")
                this._status = State.STOPPED;
            else
                console.error("Could not recognize state of " + dataBlockName + ": " + dataValue.toString());
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

        this._errorSubscription.on("started", function(){
            console.log("Error-Subscription for " + this._name + "started.");
        }).on("keepalive", function () {
            console.log("Error-Subscription for " + this._name + "keepalive.");
        }).on("terminated", function () {
            console.error("Error-Subscription for " + this._name + "terminated.");
        });

        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"ERROR\"",
            attributeId: AttributeIds.Value
        };

        const parameters: MonitoringParametersOptions = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };

        const monitoredItem = ClientMonitoredItem.create(
            this._errorSubscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this._error = dataValue.toString();
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
            console.log("Message-Subscription for " + this._name + "started.");
        }).on("keepalive", function () {
            console.log("Message-Subscription for " + this._name + "keepalive.");
        }).on("terminated", function () {
            console.error("Message-Subscription for " + this._name + "terminated.");
        });

        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"MESSAGE\"",
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
            this._message = dataValue.toString();
        });
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
        if (value == State.RUNNING && this._timeStarted == "")
            this._timeStarted = String(new Date().valueOf());
    }

    get message(): string {
        return this._message;
    }

    get error(): string {
        return this._error;
    }

    terminateSessions() {
        this._messageSubscription.terminate();
        this._statusSubscription.terminate();
        this._errorSubscription.terminate();
        this._timeFinished = String(new Date().valueOf());
    }

    get xml() : string {
        //todo
        return "";
    }
}