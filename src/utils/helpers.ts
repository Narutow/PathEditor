import { MutableRefObject } from "react"

import { CubicBezierCurve3, Vector3, Vector3Tuple } from "three"
import { ControlPoints } from "../types"

const p0 = new Vector3()
const p1 = new Vector3()
const p2 = new Vector3()
const p3 = new Vector3()
const curve = new CubicBezierCurve3(p0, p1, p2, p3)

export const updateCurve = (
  newPoints: ControlPoints,
  curveRef: MutableRefObject<any>
) => {
  p0.fromArray(newPoints.startPoint)
  p1.fromArray(newPoints.midPointA as Vector3Tuple)
  p2.fromArray(newPoints.midPointB as Vector3Tuple)
  p3.fromArray(newPoints.endPoint)

  curve.v0.copy(p0)
  curve.v1.copy(p1)
  curve.v2.copy(p2)
  curve.v3.copy(p3)
  const points = curve.getPoints(50)
  if (curveRef.current.geometry) {
    curveRef.current.geometry.setPositions(
      points.map((p) => p.toArray()).flat()
    )
  }
}

export const getRandomPoint = () =>
  [
    Math.random() * 20 - 10,
    Math.random() * 20 - 10,
    Math.random() * 20 - 10,
  ] as Vector3Tuple
