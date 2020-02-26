
export const getDarg = (simulation: any) => {
    return d3.drag()
        .on("start", (d: any) => {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart()
            }
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (d: any) => {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        })
        .on("end", (d: any) => {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = undefined;
            d.fy = undefined;
        });
}
