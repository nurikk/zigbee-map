import { d3Types, slsTypes } from "./types";
import { convert } from "./convert";

const init = () => {
    const getName = (device: slsTypes.Device): string => {
        const { friendly_name, ieeeAddr } = device;
        return friendly_name ? friendly_name : ieeeAddr.slice(-4);
    }
    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        node,
        link,
        edgepaths,
        edgelabels;

    // svg.append('defs').append('marker')
    //     .attr('id', 'arrowhead')
    //     .attr('viewBox', '-0 -5 10 10')
    //     .attr('refX', 13)
    //     .attr('refY', 0)
    //     .attr('orient', 'auto')
    //     .attr('markerWidth', 13)
    //     .attr('markerHeight', 13)
    //     .attr('xoverflow', 'visible')
    //     .append('svg:path')
    //     .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    //     .attr('fill', '#999')
    //     .style('stroke', 'none');

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d: d3Types.d3Node) { return d.id; }).distance(50).strength(0.1))
        .force("charge", d3.forceManyBody().distanceMin(10).strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));
    // @ts-ignore
    d3.json("/api/zigbee/devices", function (error, data) {
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
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', "xMinYMin meet")
        // .attr('marker-end', 'url(#arrowhead)')

        link.append("title")
            .text(function (d) { return d.type; });

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
            .attr('fill', '#aaa');


        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) { return '#edgepath' + i })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d: d3Types.d3Link) { return d.linkQuality });

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")

            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                //.on("end", dragended)
            );

        node.append("circle")
            .attr("r", 5)
            .style("fill", function (d, i) { return colors(i); })

        node.append("title")
            .text(function (d) { return d.id; });

        node.append("text")
            .attr("dy", -3)
            .text(function (d: d3Types.d3Node) { return getName(d.device) });

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        (simulation.force("link") as any).links(links);
    }

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });

        edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });

        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                const rx = bbox.x + bbox.width / 2;
                const ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    //    function dragended(d) {
    //        if (!d3.event.active) simulation.alphaTarget(0);
    //        d.fx = undefined;
    //        d.fy = undefined;
    //    }

}

init();