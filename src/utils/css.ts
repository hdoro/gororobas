import { randomBetween } from './numbers'

export interface ElementTransform {
	rotate: number
	x: number
	y: number
}

export function getRandomTransform(
	// CSS Degrees
	rotateRange: [min: number, max: number],

	// CSS Pixels
	xRange: [min: number, max: number],
	yRange: [min: number, max: number],
): ElementTransform {
	return {
		rotate: randomBetween(rotateRange[0], rotateRange[1]),
		x: randomBetween(xRange[0], xRange[1]),
		y: randomBetween(yRange[0], yRange[1]),
	}
}

export function getNoteCardTransform() {
	return getRandomTransform([-3, 3], [-7.5, 7.5], [-7.5, 7.5])
}
