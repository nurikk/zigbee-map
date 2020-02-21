!function(){"use strict";var t;!function(t){!function(t){t.EndDevice="EndDevice",t.Router="Router",t.Coordinator="Coordinator"}(t.DeviceType||(t.DeviceType={}))}(t||(t={}));var e,n,r,a={ieeeAddr:"Coordinator node",last_seen:(Date.now()/1e3).toString(),type:t.DeviceType.Coordinator,ManufName:"SLS gateway",ModelId:"",st:{linkquality:1},friendly_name:"sls gateway"},i=((e={})[t.DeviceType.Coordinator]="blue",e[t.DeviceType.Router]="blue",e[t.DeviceType.EndDevice]="green",e),o=function(t){return i[t.type]},d=function(e){var i=d3.select(e);i.selectAll("*").remove();var d,c,s,l,u=i.node().getBoundingClientRect(),f=u.width,y=u.height,p=i.append("svg");p.attr("viewBox","0 0 "+f+" "+y).attr("preserveAspectRatio","xMidYMid meet");var v=function(t,e){return d3.forceSimulation().force("x",d3.forceX(t/2).strength(.05)).force("y",d3.forceY(e/2).strength(.05)).force("link",d3.forceLink().id((function(t){return t.id})).distance(50).strength(.1)).force("charge",d3.forceManyBody().distanceMin(10).strength(-200)).force("center",d3.forceCenter(t/2,e/2)).stop()}(f,y).on("tick",(function(){c.attr("x1",(function(t){return t.source.x})).attr("y1",(function(t){return t.source.y})).attr("x2",(function(t){return t.target.x})).attr("y2",(function(t){return t.target.y})),d.attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})),s.attr("d",(function(t){return"M "+t.source.x+" "+t.source.y+" L "+t.target.x+" "+t.target.y})),l.attr("transform",(function(t){if(t.target.x<t.source.x){var e=this.getBBox();return"rotate(180 "+(e.x+e.width/2)+" "+(e.y+e.height/2)+")"}return"rotate(0)"}))}));d3.json("/api/time").then((function(t){r=t})).finally((function(){d3.json("/api/zigbee/devices").then((function(t){n=function(t){var e={id:"SLS GW",device:a},n={nodes:[e],links:[]};return Object.entries(t).forEach((function(t){var r=t[0],a=t[1];n.nodes.push({id:r,device:a}),Array.isArray(a.Rtg)&&a.Rtg.length?a.Rtg.forEach((function(t){n.links.push({source:r,target:t.toString(),linkQuality:a.st.linkquality})})):n.links.push({source:r,target:e.id,linkQuality:a.st.linkquality})})),n}(t),M()}))}));var h=i.append("div").style("opacity",0).style("position","absolute").style("background-color","white").style("border","solid").style("border-width","2px").style("border-radius","5px").style("padding","5px"),g=function(t){h.style("opacity",1),d3.select(this).style("opacity",1)},x=function(t){return h.html((e=t.device,[e.ManufName+" "+e.ModelId,e.ieeeAddr,"LinkQuality: "+e.st.linkquality].join("<br/>"))).style("top",d3.event.pageY-10+"px").style("left",d3.event.pageX+10+"px");var e},k=function(t){h.style("opacity",0),d3.select(this).style("stroke","none").style("opacity",.8)},M=function(){var e=n.links,a=n.nodes;c=p.selectAll(".link").data(e).enter().append("line").attr("class","link").style("stroke","#999").style("stroke-opacity","0.6").style("stroke-width","1px");(d=p.selectAll(".node").data(a).enter().append("g").attr("class","node").style("cursor","pointer").attr("fill-opacity",(function(t){return e=t.device,!r||!r.ts||r.ts-parseInt(e.last_seen,10)<7200?1:.4;var e})).call(function(t){return d3.drag().on("start",(function(e){d3.event.active||t.alphaTarget(.3).restart(),e.fx=e.x,e.fy=e.y})).on("drag",(function(t){t.fx=d3.event.x,t.fy=d3.event.y})).on("end",(function(e){d3.event.active||t.alphaTarget(0),e.fx=void 0,e.fy=void 0}))}(v)).on("mouseover",g).on("mousemove",x).on("mouseleave",k).on("dblclick",(function(t){var e=parseInt(t.id,10);window.open("/zigbee?nwkAddr=0x"+e.toString(16),"_blank")}))).append("path").attr("fill",(function(t){return o(t.device)})).attr("d",(function(e){switch(e.device.type){case t.DeviceType.Coordinator:return a=14,i=5,d3.radialLine()([[0,a],[.2*Math.PI,i],[.4*Math.PI,a],[.6*Math.PI,i],[.8*Math.PI,a],[1*Math.PI,i],[1.2*Math.PI,a],[1.4*Math.PI,i],[1.6*Math.PI,a],[1.8*Math.PI,i],[2*Math.PI,a]]);default:return n=5,(r=d3.path()).arc(0,0,n,0,2*Math.PI),r}var n,r,a,i})),d.append("text").attr("dy",-5).text((function(e){return function(e){if(e.type==t.DeviceType.Coordinator)return"";var n=e.friendly_name,r=e.ieeeAddr;return n||""+r.slice(-4)}(e.device)})).style("color",(function(t){return o(t.device)})),s=p.selectAll(".edgepath").data(e).enter().append("path").attr("class","edgepath").attr("fill-opacity",0).attr("stroke-opacity",0).attr("id",(function(t,e){return"edgepath"+e})).style("pointer-events","none"),(l=p.selectAll(".edgelabel").data(e).enter().append("text").style("pointer-events","none").attr("class","edgelabel").attr("id",(function(t,e){return"edgelabel"+e})).attr("font-size",10).attr("fill","#aaa").attr("dy","10")).append("textPath").attr("xlink:href",(function(t,e){return"#edgepath"+e})).style("text-anchor","middle").style("pointer-events","none").attr("startOffset","50%").text((function(t){return t.linkQuality})),v.nodes(a),v.force("link").links(e),v.restart()}};document.addEventListener("DOMContentLoaded",(function(){return d("#map")}),!1)}();
