import { slsTypes, d3Types } from "./types";

import { GATEWAY } from "./consts";

export const convert = (file: { [k: string]: slsTypes.Device }): d3Types.d3Graph => {
    const coordinator: d3Types.d3Node = {
        id: 'SLS GW',
        device: GATEWAY
    };

    const graph: d3Types.d3Graph = {
        nodes: [coordinator],
        links: []
    };

    Object.entries(file).forEach(([deviceKey, deviceData]) => {
        graph.nodes.push({
            id: deviceKey,
            device: deviceData
        });
        if (Array.isArray(deviceData.Rtg) && deviceData.Rtg.length) {
            deviceData.Rtg.forEach((route) => {
                graph.links.push({
                    source: deviceKey,
                    target: route.toString(),
                    linkQuality: deviceData?.st?.linkquality
                });
            });
        } else {
            graph.links.push({
                source: deviceKey,
                target: coordinator.id,
                linkQuality: deviceData?.st?.linkquality
            });
        }
    });
    return graph;
}