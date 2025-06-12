import type { AdjacencyLists, Itinerary } from "./types";
import Heap from "heap";

/**
 * Checks if a graph is connected using Depth-First Search
 * @param graph Adjacency list representation of the graph
 * @returns true if the graph is connected, false otherwise
 */
export function checkConnectivity(graph: AdjacencyLists): boolean {
    if (graph.size === 0) return false;

    const visited = new Set<number>();
    const startNode = graph.keys().next().value!;
    const stack: number[] = [startNode];

    // Perform DFS to visit all reachable nodes
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

    return visited.size === graph.size;
}

/**
 * Computes the Minimum Spanning Tree using Prim's algorithm
 * @param graph Adjacency list representation of the graph
 * @returns Adjacency list representation of the MST
 */
export function getMinimumSpanningTree(graph: AdjacencyLists): AdjacencyLists {
    const mst: AdjacencyLists = new Map();
    const visited = new Set<number>();
    const startNode = graph.keys().next().value!;

    // Priority queue for edges: [from, to, weight]
    const queue = new Heap<[number, number, number]>((a, b) => a[2] - b[2]);

    // Initialize with edges from start node
    visited.add(startNode);
    for (const [neighbor, weight] of graph.get(startNode)!) {
        queue.push([startNode, neighbor, weight]);
    }

    // Build MST by processing edges in order of increasing weight
    while (visited.size < graph.size && queue.size() > 0) {
        const [from, to, weight] = queue.pop()!;
        if (visited.has(to)) continue;

        visited.add(to);
        if (!mst.has(from)) mst.set(from, []);
        if (!mst.has(to)) mst.set(to, []);
        mst.get(to)!.push([from, weight]);

        // Add edges from the newly visited node
        for (const [neighbor, edgeWeight] of graph.get(to)!) {
            if (!visited.has(neighbor)) {
                queue.push([to, neighbor, edgeWeight]);
            }
        }
    }

    return mst;
}

/**
 * Finds the shortest path between two stops using Dijkstra's algorithm
 * @param graph Adjacency list representation of the graph
 * @param start Starting stop ID
 * @param end Destination stop ID
 * @returns Object containing the path stops and their durations
 */
export function dijkstra(graph: AdjacencyLists, start: number, end: number): Itinerary {
    const distances: Record<number, number> = {};
    const previous: Record<number, number | null> = {};
    const queue = new Heap<[number, number]>((a, b) => a[1] - b[1]);

    // Set initial distances
    for (const node of graph.keys()) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    queue.push([start, 0]);

    // Process nodes in order of increasing distance
    while (queue.size() > 0) {
        const [currentNode, currentDistance] = queue.pop()!;

        // Found the destination
        if (currentNode === end) {
            const stops: number[] = [];
            let durations: number[] = [];
            let node: number | null = end;

            // Reconstruct path
            while (node !== null) {
                stops.unshift(node!);
                durations.unshift(distances[node!]);
                node = previous[node];
            }

            // Calculate durations between stops
            durations = durations.map((time, index) => {
                if (index === 0) return time;
                return time - durations[index - 1];
            });

            return { stops, durations };
        }

        // Skip if we found a better path
        if (currentDistance > distances[currentNode]) continue;

        // Process neighbors
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



