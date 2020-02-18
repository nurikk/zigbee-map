import { d3Types, slsTypes } from "./types";

export const GATEWAY: slsTypes.Device = {
    ieeeAddr: '',
    last_seen: '',
    type: slsTypes.DeviceType.Coordinator,
    powerSource: slsTypes.PowerSourceType.Main,

    ManufName: 'sls',
    ModelId: 'sls',
    st: {
        linkquality: 1,
        trSeqNum: 1,
        warning: '',
        battery: 1,
        voltage: 1
    },
    supported: 1,
    friendly_name: 'sls gateway'

};