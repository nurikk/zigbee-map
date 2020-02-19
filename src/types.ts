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

    export interface TimeInfo {
        ntp_enable: boolean
        ntp_server: string;
        tz: string
        ts: number
    };
    export enum DeviceType {
        EndDevice = "EndDevice",
        Router = "Router",
        Coordinator = "Coordinator"
    }

    export type DeviceStats = {
        linkquality: number;
    }

    export type Device = {
        ieeeAddr: string;
        last_seen: string;
        type: DeviceType;

        ManufName: string;
        ModelId: string;
        st: DeviceStats;
        friendly_name?: string;
        Rtg?: number[],
    }
}