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
    ieeeAddr: 'Coordinator node',
    last_seen: (Date.now() / 1000).toString(),
    type: slsTypes.DeviceType.Coordinator,
    ManufName: 'SLS gateway'
};
var STAR = function (r1, r2) {
    var radialLineGenerator = d3.radialLine();
    var radialpoints = [
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
var CIRCLE = function (radius) {
    var circle = d3.path();
    circle.arc(0, 0, radius, 0, Math.PI * 2);
    return circle;
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
        var _b, _c;
        graph.nodes.push({
            id: deviceKey,
            device: deviceData
        });
        if (Array.isArray(deviceData.Rtg) && deviceData.Rtg.length) {
            deviceData.Rtg.forEach(function (route) {
                var _a, _b;
                graph.links.push({
                    source: deviceKey,
                    target: route.toString(),
                    linkQuality: (_b = (_a = deviceData) === null || _a === void 0 ? void 0 : _a.st) === null || _b === void 0 ? void 0 : _b.linkquality
                });
            });
        }
        else {
            graph.links.push({
                source: deviceKey,
                target: coordinator.id,
                linkQuality: (_c = (_b = deviceData) === null || _b === void 0 ? void 0 : _b.st) === null || _c === void 0 ? void 0 : _c.linkquality
            });
        }
    });
    return graph;
};

var getDarg = function (simulation) {
    return d3.drag()
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
};

var getSimulation = function (width, height) {
    return d3.forceSimulation()
        .force("x", d3.forceX(width / 2).strength(.05))
        .force("y", d3.forceY(height / 2).strength(.05))
        .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(50).strength(0.1))
        .force("charge", d3.forceManyBody().distanceMin(10).strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .stop();
};

var _a;
var colorMap = (_a = {},
    _a[slsTypes.DeviceType.Coordinator] = 'blue',
    _a[slsTypes.DeviceType.Router] = 'blue',
    _a[slsTypes.DeviceType.EndDevice] = 'green',
    _a);
var graph;
var timeInfo;
var offlineTimeout = 3600 * 2;
var isOnline = function (device) {
    var _a;
    if (((_a = timeInfo) === null || _a === void 0 ? void 0 : _a.ts) && device.last_seen) {
        return timeInfo.ts - parseInt(device.last_seen, 10) < offlineTimeout;
    }
    else {
        return true;
    }
};
var getName = function (device) {
    var _a, _b;
    switch (device.type) {
        case slsTypes.DeviceType.Coordinator:
            return '';
        default:
            var friendly_name = device.friendly_name, ieeeAddr = device.ieeeAddr;
            return (friendly_name !== null && friendly_name !== void 0 ? friendly_name : "" + (_b = (_a = ieeeAddr) === null || _a === void 0 ? void 0 : _a.slice(-4), (_b !== null && _b !== void 0 ? _b : 'Unknow device')));
    }
};
var getTooltip = function (device) {
    var _a, _b;
    var strings = [];
    if (device.ManufName) {
        if (device.ModelId) {
            strings.push(device.ManufName + " " + device.ModelId);
        }
        else {
            strings.push(device.ManufName);
        }
    }
    if (device.ieeeAddr) {
        strings.push(device.ieeeAddr);
    }
    if ((_b = (_a = device) === null || _a === void 0 ? void 0 : _a.st) === null || _b === void 0 ? void 0 : _b.linkquality) {
        strings.push("LinkQuality: " + device.st.linkquality);
    }
    if (strings.length == 0) {
        strings.push("A very strange device...");
    }
    return strings.join("<br/>");
};
var getColor = function (device) {
    if (device.type) {
        return colorMap[device.type];
    }
    else {
        return '';
    }
};
var init = function (selector) {
    var root = d3.select(selector);
    root.selectAll("*").remove();
    var _a = root.node().getBoundingClientRect(), width = _a.width, height = _a.height, svg = root.append("svg");
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
    var simulation = getSimulation(width, height).on("tick", ticked);
    var loadData = function () {
        d3.json("/api/zigbee/devices").then(function (data) {
            graph = convert(data);
            render();
        });
    };
    d3.json("/api/time").then(function (data) {
        timeInfo = data;
    })["finally"](loadData);
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
            .style("opacity", 1);
        d3.select(this)
            .style("opacity", 1);
    };
    var mousemove = function (d) { return Tooltip.html(getTooltip(d.device))
        .style("top", (d3.event.pageY - 10) + "px")
        .style("left", (d3.event.pageX + 10) + "px"); };
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8);
    };
    var render = function () {
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
            .call(getDarg(simulation))
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("dblclick", function (d) {
            var id = parseInt(d.id, 10);
            window.open("/zigbee?nwkAddr=0x" + id.toString(16), '_blank');
        });
        var pathPicker = function (d) {
            switch (d.device.type) {
                case slsTypes.DeviceType.Coordinator:
                    return STAR(14, 5);
                default:
                    return CIRCLE(5);
            }
        };
        node.append("path")
            .attr("fill", function (d) { return getColor(d.device); })
            .attr("d", pathPicker);
        node.append("text")
            .attr("dy", -5)
            .text(function (d) { return getName(d.device); })
            .style("color", function (d) { return getColor(d.device); });
        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) { return "edgepath" + i; })
            .style("pointer-events", "none");
        edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) { return "edgelabel" + i; })
            .attr('font-size', 10)
            .attr('fill', '#aaa')
            .attr("dy", "10");
        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) { return "#edgepath" + i; })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) { return d.linkQuality; });
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.restart();
    };
};
document.addEventListener('DOMContentLoaded', function () { return init("#map"); }, false);
