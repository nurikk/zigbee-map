import { SimulationNodeDatum } from "d3";

export namespace d3Types {
    export interface d3Node extends SimulationNodeDatum {
        id: string,
        device: slsTypes.Device
    };

    export type d3Link = {
        source: string,
        target: string,
        linkQuality: number
    };

    export type d3Graph = {
        nodes: d3Node[],
        links: d3Link[]
    };
}
export namespace slsTypes {

    export enum PowerSourceType {
        Main,
        Battery
    }
    export enum DeviceType {
        EndDevice,
        Router,
        Coordinator
    }

    export type DeviceStats = {
        linkquality: number;
        trSeqNum: number;
        warning: string;
        battery: number;
        voltage: number;
    }

    export type Device = {
        ieeeAddr: string;
        last_seen: string;
        type: DeviceType;
        powerSource: PowerSourceType;

        ManufName: string;
        ModelId: string;
        st: DeviceStats;
        supported: number;
        friendly_name?: string;
        Rtg?: number[],
    }
    export type DevicesList = {
        [k: string]: Device
    }
}