import { d3Types, slsTypes } from "./types";

export const GATEWAY: slsTypes.Device = {
    ieeeAddr: 'Coordinator node',
    last_seen: (Date.now()/1000).toString(),
    type: slsTypes.DeviceType.Coordinator,
    ManufName: 'SLS gateway',
    ModelId: '',
    st: {
        linkquality: 1,
    },
    friendly_name: 'sls gateway'
};