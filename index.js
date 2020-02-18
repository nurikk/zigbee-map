!function(){"use strict";var t;!function(t){!function(t){t.EndDevice="EndDevice",t.Router="Router",t.Coordinator="Coordinator"}(t.DeviceType||(t.DeviceType={}))}(t||(t={}));var e,n={ieeeAddr:"",last_seen:"",type:t.DeviceType.Coordinator,ManufName:"sls",ModelId:"sls",st:{linkquality:1},friendly_name:"sls gateway"},r=((e={})[t.DeviceType.Coordinator]="blue",e[t.DeviceType.Router]="green",e[t.DeviceType.EndDevice]="red",e),a=function(t){var e,a,i,o,d=d3.select(t),c=d.node().getBoundingClientRect(),l=c.width,s=c.height,u=d3.forceSimulation().force("link",d3.forceLink().id((function(t){return t.id})).distance(50).strength(.1)).force("charge",d3.forceManyBody().distanceMin(10).strength(-300)).force("center",d3.forceCenter(l/2,s/2));d3.json("./api/zigbee/devices",(function(t,c){if(t)throw t;var g,h,x,k=(g=c,x={nodes:[h={id:"SLS GW",device:n}],links:[]},Object.entries(g).forEach((function(t){var e=t[0],n=t[1];x.nodes.push({id:e,device:n}),Array.isArray(n.Rtg)&&n.Rtg.length?n.Rtg.forEach((function(t){x.links.push({source:e,target:t.toString(),linkQuality:n.st.linkquality})})):x.links.push({source:e,target:h.id,linkQuality:n.st.linkquality})})),x);!function(t,n){(a=d.selectAll(".link").data(t).enter().append("line").attr("class","link").style("stroke","#999").style("stroke-opacity","0.6").style("stroke-width","1px").attr("viewBox","0 0 "+l+" "+s).attr("preserveAspectRatio","xMinYMin meet")).append("title").text((function(t){return t.type})),i=d.selectAll(".edgepath").data(t).enter().append("path").attr("class","edgepath").attr("fill-opacity",0).attr("stroke-opacity",0).attr("id",(function(t,e){return"edgepath"+e})).style("pointer-events","none"),(o=d.selectAll(".edgelabel").data(t).enter().append("text").style("pointer-events","none").attr("class","edgelabel").attr("id",(function(t,e){return"edgelabel"+e})).attr("font-size",10).attr("fill","#aaa").attr("dy","10")).append("textPath").attr("xlink:href",(function(t,e){return"#edgepath"+e})).style("text-anchor","middle").style("pointer-events","none").attr("startOffset","50%").text((function(t){return t.linkQuality}));var c=d3.drag().on("start",p).on("drag",y).on("end",v);(e=d.selectAll(".node").data(n).enter().append("g").attr("class","node").style("cursor","pointer").call(c)).append("circle").attr("r",5).attr("fill",(function(t){return e=t.device,r[e.type];var e})),e.append("title").text((function(t){return(e=t.device).ieeeAddr+"\n"+e.ManufName+" "+e.ModelId;var e})),e.append("text").attr("dy",-5).text((function(t){return e=t.device,n=e.friendly_name,r=e.ieeeAddr,a=e.ModelId.split("."),n||r.slice(-4)+" "+a.pop();var e,n,r,a})),u.nodes(n).on("tick",f),u.force("link").links(t)}(k.links,k.nodes)}));var f=function(){a.attr("x1",(function(t){return t.source.x})).attr("y1",(function(t){return t.source.y})).attr("x2",(function(t){return t.target.x})).attr("y2",(function(t){return t.target.y})),e.attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})),i.attr("d",(function(t){return"M "+t.source.x+" "+t.source.y+" L "+t.target.x+" "+t.target.y})),o.attr("transform",(function(t){if(t.target.x<t.source.x){var e=this.getBBox();return"rotate(180 "+(e.x+e.width/2)+" "+(e.y+e.height/2)+")"}return"rotate(0)"}))},p=function(t){d3.event.active||u.alphaTarget(.3).restart(),t.fx=t.x,t.fy=t.y},y=function(t){t.fx=d3.event.x,t.fy=d3.event.y},v=function(t){d3.event.active||u.alphaTarget(0),t.fx=void 0,t.fy=void 0}};document.addEventListener("DOMContentLoaded",(function(){return a("#map")}),!1)}();
