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
        last_seen: (Date.now() / 1000).toString(),
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
    var graph;
    var timeInfo;
    var offlineTimeout = 3600 * 2;
    var isOnline = function (device) {
        if (timeInfo && timeInfo.ts) {
            return timeInfo.ts - parseInt(device.last_seen, 10) < offlineTimeout;
        }
        else {
            return true;
        }
    };
    var getName = function (device) {
        var friendly_name = device.friendly_name, ieeeAddr = device.ieeeAddr;
        // const modelParts = ModelId.split('.'); // ${modelParts.pop()}
        return friendly_name ? friendly_name : "" + ieeeAddr.slice(-4);
    };
    var getTitle = function (device) {
        return device.ieeeAddr + "\n" + device.ManufName + " " + device.ModelId;
    };
    var getColor = function (device) {
        return colorMap[device.type];
    };
    var init = function (selector) {
        var root = d3.select(selector);
        root.selectAll("*").remove();
        var _a = root.node().getBoundingClientRect(), width = _a.width, height = _a.height;
        var svg = root.append("svg");
        svg.attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid meet");
        var node, link, edgepaths, edgelabels;
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
        var simulation = d3.forceSimulation()
            .force("x", d3.forceX(width / 2).strength(.05))
            .force("y", d3.forceY(height / 2).strength(.05))
            .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(50).strength(0.1))
            .force("charge", d3.forceManyBody().distanceMin(10).strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked)
            .stop();
        var drag = d3.drag()
            .on("start", function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        })
            .on("drag", function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        })
            .on("end", function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = undefined;
            d.fy = undefined;
        });
        var loadData = function () {
            d3.json("/api/zigbee/devices").then(function (data) {
                // if (error) throw error;
                graph = convert(data);
                render();
            });
        };
        d3.json("/api/time").then(function (data) {
            timeInfo = data;
        }).finally(loadData);
        function render() {
            var links = graph.links, nodes = graph.nodes;
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
                .attr('fill-opacity', function (d) { return isOnline(d.device) ? 1 : 0.4; })
                // .attr('stroke-opacity', 0)
                .call(drag);
            node.append("circle")
                .attr("r", 5)
                .attr("fill", function (d) { return getColor(d.device); });
            node.append("title").text(function (d) { return getTitle(d.device); });
            node.append("text").attr("dy", -5).text(function (d) { return getName(d.device); });
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
            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.restart();
        }
    };
    document.addEventListener('DOMContentLoaded', function () { return init("#map"); }, false);

}());
