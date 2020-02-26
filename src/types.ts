import { SimulationNodeDatum } from "d3";

export namespace d3Types {
    export interface d3Node extends SimulationNodeDatum {
        id: string,
        device: slsTypes.Device
    };

    export type d3Link = {
        source: string,
        target: string,
        linkQuality: number | undefined
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
        ieeeAddr?: string | undefined;
        last_seen: string | undefined;
        type?: DeviceType | undefined;
        ManufName?: string | undefined;
        ModelId?: string | undefined;
        st?: DeviceStats | undefined;
        friendly_name?: string | undefined;
        Rtg?: number[] | undefined,
    }
}