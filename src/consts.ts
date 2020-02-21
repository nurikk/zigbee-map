import { d3Types, slsTypes } from "./types";

export const GATEWAY: slsTypes.Device = {
    ieeeAddr: 'Coordinator node',
    last_seen: (Date.now() / 1000).toString(),
    type: slsTypes.DeviceType.Coordinator,
    ManufName: 'SLS gateway',
    ModelId: '',
    st: {
        linkquality: 1,
    },
    friendly_name: 'sls gateway'
};



export const STAR = (r1, r2) => {
    const radialLineGenerator: any = d3.radialLine();
    const radialpoints = [
        [0, r1],
        [Math.PI * 0.2, r2],
        [Math.PI * 0.4, r1],
        [Math.PI * 0.6, r2],
        [Math.PI * 0.8, r1],
        [Math.PI * 1, r2],
        [Math.PI * 1.2, r1],
        [Math.PI * 1.4, r2],
        [Math.PI * 1.6, r1],
        [Math.PI * 1.8, r2],
        [Math.PI * 2, r1]
    ];
    return radialLineGenerator(radialpoints);
};

export const CIRCLE = (radius) => {
    const circle = d3.path();
    circle.arc(0, 0, radius, 0, Math.PI * 2);
    return circle;
}