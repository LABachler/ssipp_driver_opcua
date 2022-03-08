import {
    AttributeIds,
    ClientMonitoredItem,
    ClientSession,
    ClientSubscription,
    TimestampsToReturn
} from "node-opcua-client";
import * as opcua from "node-opcua";
import { DataValue, MonitoringParametersOptions, ReadValueIdOptions } from "node-opcua";
import * as xpath from "xpath-ts";

export class SSiPP_Param {
    private readonly _name: string;
    private readonly _value: number;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String){
        this._name = "P_" + < string>xpath.select1("/param/@name", n).valueOf();
        this._value = parseInt(<string>xpath.select1("/param", n).valueOf());
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

    get name(): string {
        return this._name;
    }

    get value(): number {
        return this._value;
    }
}

export class SSiPP_Report {
    private readonly _name: string;
    private _value: DataValue;
    private _subscription: ClientSubscription;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String) {
        this._name = "R_" + <string>xpath.select1("/report/@name", n).valueOf();
        this._subscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        }); //TODO understand options, right now its just 10 s monitor
        this._subscription.on("started", function(){
            console.log("Subscription for " + this._name + "started.");
        }).on("keepalive", function () {
            console.log("Subscription for " + this._name + "keepalive.");
        }).on("terminated", function () {
            console.error("Subscription for " + this._name + "terminated.");
        });
        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"" + this._name + "\"",
            attributeId: AttributeIds.Value
        }
        const parameters: MonitoringParametersOptions = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };

        const monitoredItem = ClientMonitoredItem.create(
            this._subscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        );

        monitoredItem.on("changed", (dataValue: DataValue) => {
            this._value = dataValue;
        });
    }

    get name(): string {
        return this._name;
    }

    get value(): DataValue {
        return this._value;
    }

    terminateSubscription() {
        this._subscription.terminate();
    }
}