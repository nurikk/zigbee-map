import { d3Types, slsTypes } from "./types";
import { convert } from "./convert";
const colorMap = {
    [slsTypes.DeviceType.Coordinator]: 'blue',
    [slsTypes.DeviceType.Router]: 'green',
    [slsTypes.DeviceType.EndDevice]: 'red',
};

const getName = (device: slsTypes.Device): string => {
    const { friendly_name, ieeeAddr, ModelId } = device;
    const modelParts = ModelId.split('.');
    return friendly_name ? friendly_name : `${ieeeAddr.slice(-4)} ${modelParts.pop()}`;
}
const getTitle = (device: slsTypes.Device) => {
    return `${device.ieeeAddr}\n${device.ManufName} ${device.ModelId}`;
};
const getColor = (device: slsTypes.Device) => {
    return colorMap[device.type];
};




const init = (selector) => {
    const root = d3.select(selector);
    root.selectAll("*").remove();
    const { width, height } = root.node().getBoundingClientRect();
    const svg = root.append("svg");


    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet")



    let node,
        link,
        edgepaths,
        edgelabels;

    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(width / 2).strength(.05))
        .force("y", d3.forceY(height / 2).strength(.05))
        .force("link", d3.forceLink().id((d: d3Types.d3Node) => d.id).distance(50).strength(0.1))
        .force("charge", d3.forceManyBody().distanceMin(10).strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));
    //@ts-ignore
    d3.json("./api/zigbee/devices", (error, data) => {
        if (error) throw error;
        const { links, nodes } = convert(data);
        update(links, nodes);
    });



    function update(links, nodes) {
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke", "#999")
            .style("stroke-opacity", "0.6")
            .style("stroke-width", "1px");





        const drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .call(drag);

        node.append("circle")
            .attr("r", 5)
            .attr("fill", (d: d3Types.d3Node) => getColor(d.device));

        node.append("title").text((d: d3Types.d3Node) => getTitle(d.device));

        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) { return 'edgepath' + i })

            .style("pointer-events", "none");

        edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) { return 'edgelabel' + i })
            .attr('font-size', 10)
            .attr('fill', '#aaa')
            .attr("dy", "10");


        edgelabels.append('textPath')
            .attr('xlink:href', (d, i) => '#edgepath' + i)
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text((d: d3Types.d3Link) => d.linkQuality);

        node.append("text")
            .attr("dy", -5)
            .text((d: d3Types.d3Node) => getName(d.device));

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        (simulation.force("link") as any).links(links);
    }

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
                var bbox = this.getBBox();
                const rx = bbox.x + bbox.width / 2;
                const ry = bbox.y + bbox.height / 2;
                return `rotate(180 ${rx} ${ry})`;
            }
            else {
                return 'rotate(0)';
            }
        });
    }

    const dragstarted = (d) => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    };

    const dragged = (d) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    const dragended = (d) => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = undefined;
        d.fy = undefined;
    };
    //////////////




};
document.addEventListener('DOMContentLoaded', () => init("#map"), false);
