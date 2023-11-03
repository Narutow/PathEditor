import { Vector3Tuple } from "three"

export type ControlPointName =
  | "startPoint"
  | "endPoint"
  | "midPointA"
  | "midPointB"

export interface ControlPoints {
  startPoint: Vector3Tuple
  endPoint: Vector3Tuple
  midPointA: Vector3Tuple
  midPointB: Vector3Tuple
}

export function isEqual(cp1 : ControlPoints, cp2 : ControlPoints) : boolean {
  return JSON.stringify(cp1) === JSON.stringify(cp2);
}

export function removeElement(elements : ControlPoints[], target : ControlPoints) {
  return elements.filter(element => !isEqual(element, target))
}
