import type { AdjacencyLists, Itinerary } from "./types";
import Heap from "heap";


export function checkConnectivity(graph: AdjacencyLists): boolean {
    if (graph.size === 0) return false;

    const visited = new Set<number>();

    // Start DFS from the first node in the graph
    const startNode = graph.keys().next().value!;
    const stack: number[] = [startNode];

    while (stack.length > 0) {
        const node = stack.pop()!;
        if (!visited.has(node)) {
            visited.add(node);
            for (const [neighbor] of graph.get(node)!) {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }

    // If all nodes are visited, the graph is connected
    return visited.size === graph.size;
}

export function getMinimumSpanningTree(graph: AdjacencyLists): AdjacencyLists {
    const mst: AdjacencyLists = new Map();

    const visited = new Set<number>();
    const startNode = graph.keys().next().value!;
    const queue = new Heap<[number, number, number]>((a, b) => a[2] - b[2]); // [from, to, weight]

    visited.add(startNode);
    for (const [neighbor, weight] of graph.get(startNode)!) {
        queue.push([startNode, neighbor, weight]);
    }
    while (visited.size < graph.size && queue.size() > 0) {
        const [from, to, weight] = queue.pop()!;
        if (visited.has(to)) continue;
        visited.add(to);
        if (!mst.has(from)) mst.set(from, []);
        if (!mst.has(to)) mst.set(to, []);
        mst.get(to)!.push([from, weight]);

        for (const [neighbor, edgeWeight] of graph.get(to)!) {
            if (!visited.has(neighbor)) {
                queue.push([to, neighbor, edgeWeight]);
            }
        }
    }
    return mst;
}

/**
 * Dijkstra's algorithm to find the shortest path between two stops.
 * @param graph - The adjacency list representation of the graph.
 * @param start - The starting stop.
 * @param end - The destination stop.
 * @returns An array containing the shortest path and an array of times for each stop.
 */
export function dijkstra(graph: AdjacencyLists, start: number, end: number): Itinerary {
    const distances: Record<number, number> = {};
    const previous: Record<number, number | null> = {};
    const queue = new Heap<[number, number]>((a, b) => a[1] - b[1]);
    for (const node of graph.keys()) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    queue.push([start, 0]);
    while (queue.size() > 0) {
        const [currentNode, currentDistance] = queue.pop()!;
        if (currentNode === end) {
            const stops: number[] = [];
            let durations: number[] = [];
            let node: number | null = end;
            while (node !== null) {
                stops.unshift(node!);
                durations.unshift(distances[node!]);
                node = previous[node];
            }
            durations = durations.map((time, index) => {
                if (index === 0) return time; // First stop time is the distance to itself
                return time - durations[index - 1]; // Calculate time from previous stop
            });
            return { stops, durations };
        }
        if (currentDistance > distances[currentNode]) continue;
        for (const [neighbor, time] of graph.get(currentNode)!) {
            const distance = currentDistance + time;
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                queue.push([neighbor, distance]);
            }
        }
    }

    return { stops: [], durations: [] };
}



