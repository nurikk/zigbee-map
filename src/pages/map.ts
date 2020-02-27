import { d3Types, slsTypes } from "../types";
import { convert } from "../convert";
import { ForceLink, keys } from "d3";
import { getDarg } from "../drag";
import { STAR, CIRCLE } from "../consts";
import { getSimulation } from "../simulation";
const colorMap = {
    [slsTypes.DeviceType.Coordinator]: 'blue',
    [slsTypes.DeviceType.Router]: 'blue',
    [slsTypes.DeviceType.EndDevice]: 'green',
};
let graph: d3Types.d3Graph;
let timeInfo: slsTypes.TimeInfo | undefined;
const offlineTimeout = 3600 * 2;
const isOnline = (device: slsTypes.Device): boolean => {
    if (timeInfo?.ts && device.last_seen) {
        return timeInfo.ts - parseInt(device.last_seen, 10) < offlineTimeout;
    } else {
        return true;
    }
}
const getName = (device: slsTypes.Device): string => {
    switch (device.type) {
        case slsTypes.DeviceType.Coordinator:
            return ''
        default:
            const { friendly_name, ieeeAddr } = device;
            return friendly_name ?? `${ieeeAddr?.slice(-4) ?? 'Unknow device'}`;
    }
}

const getTooltip = (device: slsTypes.Device): string => {
    const strings: string[] = [];
    if (device.ManufName) {
        if (device.ModelId) {
            strings.push(`${device.ManufName} ${device.ModelId}`);
        } else {
            strings.push(device.ManufName);
        }
    }
    if (device.ieeeAddr) {
        strings.push(device.ieeeAddr);
    }
    if (device?.st?.linkquality) {
        strings.push(`LinkQuality: ${device.st.linkquality}`)
    }
    if (strings.length == 0) {
        strings.push("A very strange device...");
    }
    return strings.join("<br/>");
};
const getColor = (device: slsTypes.Device): string => {
    if (device.type) {
        return colorMap[device.type]
    } else {
        return '';
    }
};

const init = (selector: string) => {
    const root = d3.select(selector);
    root.selectAll("*").remove();

    const { width, height } = (root.node() as HTMLElement).getBoundingClientRect(),
        svg = root.append("svg");


    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

    let node: any,
        link: any,
        edgepaths: any,
        edgelabels: any;

    const ticked = () => {
        link
            .attr("x1", (d: { source: { x: any; }; }) => d.source.x)
            .attr("y1", (d: { source: { y: any; }; }) => d.source.y)
            .attr("x2", (d: { target: { x: any; }; }) => d.target.x)
            .attr("y2", (d: { target: { y: any; }; }) => d.target.y);

        node
            .attr("transform", (d: { x: any; y: any; }) => `translate(${d.x}, ${d.y})`);


        edgepaths.attr('d', (d: { source: { x: any; y: any; }; target: { x: any; y: any; }; }) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);

        edgelabels.attr('transform', function (d: { target: { x: number; }; source: { x: number; }; }) {
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

    const simulation = getSimulation(width, height).on("tick", ticked);

    const loadData = () => {
        d3.json("/api/zigbee/devices").then((data) => {
            graph = convert(data);
            render();
        });
    };

    d3.json("/api/time").then((data: slsTypes.TimeInfo) => {
        timeInfo = data;
    }).finally(loadData);

    var Tooltip = root
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");
    var mouseover = function () {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("opacity", 1)
    }

    var mousemove = (d: d3Types.d3Node) => Tooltip.html(getTooltip(d.device))
        .style("top", (d3.event.pageY - 10) + "px")
        .style("left", (d3.event.pageX + 10) + "px");

    var mouseleave = function (d: any) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }


    const render = () => {
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
            .call(getDarg(simulation))
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("dblclick", (d: d3Types.d3Node) => {
                const id = parseInt(d.id, 10);
                window.open(`/zigbee?nwkAddr=0x${id.toString(16)}`, '_blank');
            });

        const pathPicker = (d: d3Types.d3Node) => {
            switch (d.device.type) {
                case slsTypes.DeviceType.Coordinator:
                    return STAR(14, 5);
                default:
                    return CIRCLE(5);
            }
        };
        node.append("path")
            .attr("fill", (d: d3Types.d3Node) => getColor(d.device))
            .attr("d", pathPicker);

        node.append("text")
            .attr("dy", -5)
            .text((d: d3Types.d3Node) => getName(d.device))
            .style("color", (d: d3Types.d3Node) => getColor(d.device))

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
            .attr('xlink:href', (d: any, i: any) => `#edgepath${i}`)
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text((d: d3Types.d3Link) => d.linkQuality);



        simulation.nodes(nodes);
        (simulation.force("link") as ForceLink<d3Types.d3Node, d3Types.d3Link>).links(links);
        simulation.restart();
    };
};
document.addEventListener('DOMContentLoaded', () => init("#map"), false);

