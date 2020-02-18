(function () {
    'use strict';

    var slsTypes;
    (function (slsTypes) {
        var DeviceType;
        (function (DeviceType) {
            DeviceType["EndDevice"] = "EndDevice";
            DeviceType["Router"] = "Router";
            DeviceType["Coordinator"] = "Coordinator";
        })(DeviceType = slsTypes.DeviceType || (slsTypes.DeviceType = {}));
    })(slsTypes || (slsTypes = {}));

    var GATEWAY = {
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

    var convert = function (file) {
        var coordinator = {
            id: 'SLS GW',
            device: GATEWAY
        };
        var graph = {
            nodes: [coordinator],
            links: []
        };
        Object.entries(file).forEach(function (_a) {
            var deviceKey = _a[0], deviceData = _a[1];
            graph.nodes.push({
                id: deviceKey,
                device: deviceData
            });
            if (Array.isArray(deviceData.Rtg) && deviceData.Rtg.length) {
                deviceData.Rtg.forEach(function (route) {
                    graph.links.push({
                        source: deviceKey,
                        target: route.toString(),
                        linkQuality: deviceData.st.linkquality
                    });
                });
            }
            else {
                graph.links.push({
                    source: deviceKey,
                    target: coordinator.id,
                    linkQuality: deviceData.st.linkquality
                });
            }
        });
        return graph;
    };

    var _a;
    var colorMap = (_a = {},
        _a[slsTypes.DeviceType.Coordinator] = 'blue',
        _a[slsTypes.DeviceType.Router] = 'green',
        _a[slsTypes.DeviceType.EndDevice] = 'red',
        _a);
    var getName = function (device) {
        var friendly_name = device.friendly_name, ieeeAddr = device.ieeeAddr, ModelId = device.ModelId;
        var modelParts = ModelId.split('.');
        return friendly_name ? friendly_name : ieeeAddr.slice(-4) + " " + modelParts.pop();
    };
    var getTitle = function (device) {
        return device.ieeeAddr + "\n" + device.ManufName + " " + device.ModelId;
    };
    var getColor = function (device) {
        return colorMap[device.type];
    };
    var init = function (selector) {
        var svg = d3.select(selector);
        var _a = svg.node().getBoundingClientRect(), width = _a.width, height = _a.height;
        var node, link, edgepaths, edgelabels;
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(50).strength(0.1))
            .force("charge", d3.forceManyBody().distanceMin(10).strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));
        //@ts-ignore
        d3.json("./api/zigbee/devices", function (error, data) {
            if (error)
                throw error;
            var _a = convert(data), links = _a.links, nodes = _a.nodes;
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
                .style("stroke-width", "1px")
                .attr('viewBox', "0 0 " + width + " " + height)
                .attr('preserveAspectRatio', "xMinYMin meet");
            link.append("title")
                .text(function (d) { return d.type; });
            edgepaths = svg.selectAll(".edgepath")
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'edgepath')
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0)
                .attr('id', function (d, i) { return 'edgepath' + i; })
                .style("pointer-events", "none");
            edgelabels = svg.selectAll(".edgelabel")
                .data(links)
                .enter()
                .append('text')
                .style("pointer-events", "none")
                .attr('class', 'edgelabel')
                .attr('id', function (d, i) { return 'edgelabel' + i; })
                .attr('font-size', 10)
                .attr('fill', '#aaa')
                .attr("dy", "10");
            edgelabels.append('textPath')
                .attr('xlink:href', function (d, i) { return '#edgepath' + i; })
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("startOffset", "50%")
                .text(function (d) { return d.linkQuality; });
            var drag = d3.drag()
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
                .attr("fill", function (d) { return getColor(d.device); });
            node.append("title").text(function (d) { return getTitle(d.device); });
            node.append("text")
                .attr("dy", -5)
                .text(function (d) { return getName(d.device); });
            simulation
                .nodes(nodes)
                .on("tick", ticked);
            simulation.force("link").links(links);
        }
        var ticked = function () {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
            node
                .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });
            edgepaths.attr('d', function (d) { return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y; });
            edgelabels.attr('transform', function (d) {
                if (d.target.x < d.source.x) {
                    var bbox = this.getBBox();
                    var rx = bbox.x + bbox.width / 2;
                    var ry = bbox.y + bbox.height / 2;
                    return "rotate(180 " + rx + " " + ry + ")";
                }
                else {
                    return 'rotate(0)';
                }
            });
        };
        var dragstarted = function (d) {
            if (!d3.event.active)
                simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };
        var dragged = function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };
        var dragended = function (d) {
            if (!d3.event.active)
                simulation.alphaTarget(0);
            d.fx = undefined;
            d.fy = undefined;
        };
    };
    document.addEventListener('DOMContentLoaded', function () { return init("#map"); }, false);

}());
