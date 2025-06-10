export type AdjancencyList = Map<number, [number, number][]>;
export type Path = [number[], number[]]; // [stops, times]
export type Stop = {
	id: number;
	name: string;
	plain_name: string;
	line: string;
	is_terminal: boolean;
	branch: number;
	pos_x: number;
	pos_y: number;
}
export type Link = {
	stop1: number;
	stop2: number;
	time: number; // in seconds
}