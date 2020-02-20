import { d3Types, slsTypes } from "./types";
import { convert } from "./convert";
import { ForceLink } from "d3";
import { getDarg } from "./drag";
const colorMap = {
    [slsTypes.DeviceType.Coordinator]: 'blue',
    [slsTypes.DeviceType.Router]: 'green',
    [slsTypes.DeviceType.EndDevice]: 'red',
};
let graph: d3Types.d3Graph;
let timeInfo: slsTypes.TimeInfo;
const offlineTimeout = 3600 * 2;
const isOnline = (device: slsTypes.Device): boolean => {
    if (timeInfo && timeInfo.ts) {
        return timeInfo.ts - parseInt(device.last_seen, 10) < offlineTimeout;
    } else {
        return true;
    }
}
const getName = (device: slsTypes.Device): string => {
    if (device.type == slsTypes.DeviceType.Coordinator) {
        return '';
    } else {
        const { friendly_name, ieeeAddr } = device;
        return friendly_name ? friendly_name : `${ieeeAddr.slice(-4)}`;
    }
    
}
const getTitle = (device: slsTypes.Device): string => {
    return `${device.ieeeAddr}\n${device.ManufName} ${device.ModelId}`;
};
const getColor = (device: slsTypes.Device): string => {
    return colorMap[device.type];
};

const init = (selector) => {


    const root = d3.select(selector);
    root.selectAll("*").remove();
    const { width, height } = root.node().getBoundingClientRect();
    const svg = root.append("svg");


    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

    let node,
        link,
        edgepaths,
        edgelabels;

    const ticked = () => {
        link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        node
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        edgepaths.attr('d', (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);

        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                const bbox = this.getBBox();
                const rx = bbox.x + bbox.width / 2;
                const ry = bbox.y + bbox.height / 2;
                return `rotate(180 ${rx} ${ry})`;
            }
            else {
                return 'rotate(0)';
            }
        });
    }

    const simulation = d3.forceSimulation()
        .force("x", d3.forceX(width / 2).strength(.05))
        .force("y", d3.forceY(height / 2).strength(.05))
        .force("link", d3.forceLink().id((d: d3Types.d3Node) => d.id).distance(50).strength(0.1))
        .force("charge", d3.forceManyBody().distanceMin(10).strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked)
        .stop();

    const loadData = () => {
        d3.json("/api/zigbee/devices").then((data) => {
            graph = convert(data);
            render();
        });
    };

    d3.json("/api/time").then((data: slsTypes.TimeInfo) => {
        timeInfo = data;
    }).finally(loadData);

    function render() {
        const { links, nodes } = graph;
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke", "#999")
            .style("stroke-opacity", "0.6")
            .style("stroke-width", "1px");

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .attr('fill-opacity', (d: d3Types.d3Node) => isOnline(d.device) ? 1 : 0.4)
            .call(getDarg(simulation));

        const radialLineGenerator: any = d3.radialLine();

        const r1 = 14;
        const r2 = 5;

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

        const circle = d3.path();

        circle.arc(0, 0, 5, 0, Math.PI * 2);

        const radialData = radialLineGenerator(radialpoints);
        node.append("path")
            .attr("fill", (d: d3Types.d3Node) => getColor(d.device))
            .attr("d", (d: d3Types.d3Node) => {
                switch (d.device.type) {
                    case slsTypes.DeviceType.Coordinator:
                        return radialData
                    default:
                        return circle;
                }
            });

        node.append("title").text((d: d3Types.d3Node) => getTitle(d.device));
        node.append("text").attr("dy", -5).text((d: d3Types.d3Node) => getName(d.device));

        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', (d, i) => `edgepath${i}`)
            .style("pointer-events", "none")

        edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', (d, i) => `edgelabel${i}`)
            .attr('font-size', 10)
            .attr('fill', '#aaa')
            .attr("dy", "10");


        edgelabels.append('textPath')
            .attr('xlink:href', (d, i) => `#edgepath${i}`)
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text((d: d3Types.d3Link) => d.linkQuality);



        simulation.nodes(nodes);
        (simulation.force("link") as ForceLink<d3Types.d3Node, d3Types.d3Link>).links(links);
        simulation.restart();
    }
};
document.addEventListener('DOMContentLoaded', () => init("#map"), false);

