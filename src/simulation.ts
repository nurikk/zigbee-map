import { d3Types } from "./types";

export const getSimulation = (width: number, height: number) => {
    return d3.forceSimulation()
    .force("x", d3.forceX(width / 2).strength(.05))
    .force("y", d3.forceY(height / 2).strength(.05))
    .force("link", d3.forceLink().id((d: d3Types.d3Node) => d.id).distance(50).strength(0.1))
    .force("charge", d3.forceManyBody().distanceMin(10).strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .stop();
}