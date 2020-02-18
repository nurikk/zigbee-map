import { d3Types, slsTypes } from "./types";

export const GATEWAY: slsTypes.Device = {
    ieeeAddr: '',
    last_seen: '',
    type: slsTypes.DeviceType.Coordinator,
    ManufName: 'sls',
    ModelId: 'sls',
    st: {
        linkquality: 1,
    },
    friendly_name: 'sls gateway'
};