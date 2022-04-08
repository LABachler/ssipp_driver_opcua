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
    private _value: number;
    private _opcSession: ClientSession;
    private _dataBlockName: String;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String){
        this._opcSession = opcSession;
        this._dataBlockName = dataBlockName;
        let el: Element = <Element> n;
        this._name = el.attributes.getNamedItem("name").value;
        console.log("Param value: " + el.textContent);
        this._value = parseInt(el.textContent);
        console.log("Param " + this._name + " has value " + this._value);
        const nodeToWrite = {
            nodeId: "ns=3;s=\"" + dataBlockName + "\".\"" + this._name + "\"",
            attributeId: AttributeIds.Value,
            indexRange: null,
            value: {
                value: {
                    dataType: opcua.DataType.Int16,
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
                nodeId: "ns=3;s=\"" + this._dataBlockName + "\".\"" + this._name + "\"",
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
        return "<param name=\"" + this._name + "\">" +
            (this.value == undefined ? "" : this.value) +
            "</param>";
    }
}

export class SSiPP_Report {
    private readonly _name: string;
    private _value: string;
    private _subscription: ClientSubscription;

    constructor(n: Node, opcSession: ClientSession, dataBlockName: String) {
        let el: Element = <Element> n;
        this._name = el.attributes.getNamedItem("name").value;
        this._subscription = ClientSubscription.create(opcSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        }); //TODO understand options, right now its just 10 s monitor
        this._subscription.on("started", function(){
            console.log("Report-Subscription for " + dataBlockName + "started.");
        }).on("keepalive", function () {
            console.log("Report-Subscription for " + dataBlockName + "keepalive.");
        }).on("terminated", function () {
            console.error("Report-Subscription for " + dataBlockName + "terminated.");
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

    terminateSubscription() {
        this._subscription.terminate();
    }

    get xml(): string {
        return "<report name=\"" + this._name + "\">" +
            this.value +
            "</report>";
    }
}