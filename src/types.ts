import { Vector3, Vector3Tuple } from "three"

export const WORLD_WIDTH = 5.438624575852244;
export const WORLD_HEIGHT = 11.547005383792515;
export const BACKGROUND_RATIO = 2.2222222222222;

export type ControlPointName =
  | "startPoint"
  | "endPoint"
  | "midPointA"
  | "midPointB"

export interface ControlPoints {
  startPoint: Vector3Tuple,
  endPoint: Vector3Tuple,
  midPointA: Vector3Tuple,
  midPointB: Vector3Tuple,
  pathExtra?: PathExtra, // 这里很无奈地加上了附加信息
}

export interface PathExtra {
  duration: number; // 此段动画将持续的时长
  isRelative: boolean; // 是否是相对坐标系中的曲线
}

export function isEqual(cp1 : ControlPoints, cp2 : ControlPoints) : boolean {
  return JSON.stringify(cp1) === JSON.stringify(cp2);
}

export function removeElement(elements : ControlPoints[], target : ControlPoints) {
  return elements.filter(element => !isEqual(element, target))
}

export function cloneControlPoints(controlPoints: ControlPoints): ControlPoints {
  const { startPoint, endPoint, midPointA, midPointB, pathExtra } = controlPoints;

  const cloneStartPoint: Vector3Tuple = [...startPoint];
  const cloneEndPoint: Vector3Tuple = [...endPoint];
  const cloneMidPointA: Vector3Tuple = [...midPointA];
  const cloneMidPointB: Vector3Tuple = [...midPointB];

  return {
    startPoint: cloneStartPoint,
    endPoint: cloneEndPoint,
    midPointA: cloneMidPointA,
    midPointB: cloneMidPointB,
    pathExtra: pathExtra,
  };
}

export function cloneControlPointsArray(controlPointsArray: ControlPoints[]): ControlPoints[] {
  return controlPointsArray.map(controlPoints => cloneControlPoints(controlPoints));
}

export function subtractVector(controlPoints: ControlPoints, point: Vector3): ControlPoints {
  const subtractVector3Tuple = (tuple: Vector3Tuple) => [tuple[0] - point.x, tuple[1] - point.y, tuple[2] - point.z] as Vector3Tuple;

  return {
    startPoint: subtractVector3Tuple(controlPoints.startPoint),
    endPoint: subtractVector3Tuple(controlPoints.endPoint),
    midPointA: subtractVector3Tuple(controlPoints.midPointA),
    midPointB: subtractVector3Tuple(controlPoints.midPointB),
    pathExtra: controlPoints.pathExtra
  };
};

export function addVector(controlPoints: ControlPoints, point: Vector3): ControlPoints {
  const addVector3Tuple = (tuple: Vector3Tuple) => [tuple[0] + point.x, tuple[1] + point.y, tuple[2] + point.z] as Vector3Tuple;

  return {
    startPoint: addVector3Tuple(controlPoints.startPoint),
    endPoint: addVector3Tuple(controlPoints.endPoint),
    midPointA: addVector3Tuple(controlPoints.midPointA),
    midPointB: addVector3Tuple(controlPoints.midPointB),
    pathExtra: controlPoints.pathExtra
  };
};

// 让贝塞尔曲线丝滑
export function smoothControlPoints(
  controlPoints: ControlPoints[],
  plan: number,
): ControlPoints[] {
  for (let i = 0; i < controlPoints.length - 1; i++) {
    let cur = controlPoints[i];
    let next = controlPoints[i+1];

    //确保两个控制点相连
    next.startPoint = cur.endPoint;

    if (plan === 1) {
      if (cur.pathExtra?.isRelative !== next.pathExtra?.isRelative) {
        adjustControlPointsForSameAngleAndDistance3D(cur, next);
      }
    } else {
      adjustControlPointsForSameAngleAndDistance3D(cur, next);
    }
  }  
  return controlPoints;
}

// 根据指定的向量对点进行调整
function adjustPoint(point: Vector3Tuple, vector: Vector3Tuple): Vector3Tuple {
  return [
      point[0] + vector[0],
      point[1] + vector[1],
      point[2] + vector[2]
  ];
}

export function convertRelativeControlPoints(controlPoints: ControlPoints, micseat: Vector3[], relativeIndex: number): ControlPoints {
  const { startPoint, endPoint, midPointA, midPointB, pathExtra } = controlPoints;
  let relativePoint = new Vector3(0, 0, 0);

  if (pathExtra?.isRelative) {
    relativePoint = micseat[relativeIndex];
  }

  const convertPoint = (point: Vector3Tuple): Vector3Tuple => {
    return [
      point[0] + relativePoint.x,
      point[1] + relativePoint.y,
      point[2] + relativePoint.z
    ];
  }

  return {
    startPoint: convertPoint(startPoint),
    endPoint: convertPoint(endPoint),
    midPointA: convertPoint(midPointA),
    midPointB: convertPoint(midPointB),
    pathExtra: pathExtra
  };
}

export function convertRelativeControlPointsArray(controlPointsArray: ControlPoints[], micseat: Vector3[], relativeIndex: number): ControlPoints[] {
  return controlPointsArray.map(controlPoints => convertRelativeControlPoints(controlPoints, micseat, relativeIndex));
}

/**
 * 将绝对坐标转换为相对坐标
 */
export function convertToRelativeControlPoints(controlPoints: ControlPoints, micseat: Vector3[], relativeIndex: number): ControlPoints {
  if (!controlPoints) {
    return {
      startPoint: [1.91, -0.91, 0],
      midPointA: [0, -0.62, 0],
      midPointB: [0, 0.35, 0],
      endPoint: [0, 1.23, 0],
      pathExtra: {duration: 2, isRelative: false}
    };
  }
  const { startPoint, endPoint, midPointA, midPointB, pathExtra } = controlPoints;
  let relativePoint = new Vector3(0, 0, 0);

  if (pathExtra?.isRelative) {
    relativePoint = micseat[relativeIndex];
  }

  const convertPoint = (point: Vector3Tuple): Vector3Tuple => {
    return [
      point[0] - relativePoint.x,
      point[1] - relativePoint.y,
      point[2] - relativePoint.z
    ];
  }

  return {
    startPoint: convertPoint(startPoint),
    endPoint: convertPoint(endPoint),
    midPointA: convertPoint(midPointA),
    midPointB: convertPoint(midPointB),
    pathExtra: pathExtra
  };
}

export function convertToRelativeControlPointsArray(controlPointsArray: ControlPoints[], micseat: Vector3[], relativeIndex: number): ControlPoints[] {
  return controlPointsArray.map(controlPoints => convertToRelativeControlPoints(controlPoints, micseat, relativeIndex));
}


export function generateAbsoluteControlPoints(
  segments: ControlPoints[],
  stepSize: number,
  isRelative: boolean,
  duration: number
): ControlPoints {
  if (segments.length <= 0) {
    return;
  }
  const last = segments[segments.length - 1];
  const { endPoint, midPointB } = last;

  // Calculate direction
  const direction: Vector3Tuple = [
    endPoint[0] - midPointB[0],
    endPoint[1] - midPointB[1],
    endPoint[2] - midPointB[2],
  ];

  // Add a new control point at position moving in the direction
  const newControlPoints: ControlPoints = {
    startPoint: endPoint,
    midPointA: [endPoint[0] + stepSize * direction[0], endPoint[1] + stepSize * direction[1], endPoint[2] + stepSize * direction[2]],
    midPointB: [endPoint[0] + 2 * stepSize * direction[0], endPoint[1] + 2 * stepSize * direction[1], endPoint[2] + 2 * stepSize * direction[2]],
    endPoint: [endPoint[0] + 3 * stepSize * direction[0], endPoint[1] + 3 * stepSize * direction[1], endPoint[2] + 3 * stepSize * direction[2]],
    pathExtra: { isRelative, duration }
  };

  return newControlPoints;
}

function adjustControlPointsForSameAngleAndDistance3D(
  controlPoints1: ControlPoints,
  controlPoints2: ControlPoints
){
  // calculate the average distance from the control points to the join point
  let distance1 = Math.sqrt(
    Math.pow(controlPoints1.midPointB[0] - controlPoints1.endPoint[0], 2) +
    Math.pow(controlPoints1.midPointB[1] - controlPoints1.endPoint[1], 2) +
    Math.pow(controlPoints1.midPointB[2] - controlPoints1.endPoint[2], 2)
  );
  let distance2 = Math.sqrt(
    Math.pow(controlPoints2.midPointA[0] - controlPoints2.startPoint[0], 2) +
    Math.pow(controlPoints2.midPointA[1] - controlPoints2.startPoint[1], 2) +
    Math.pow(controlPoints2.midPointA[2] - controlPoints2.startPoint[2], 2)
  );
  let averageDistance = (distance1 + distance2) / 2;

  // compute the direction vector from the join point to the mid point
  let dx = controlPoints1.midPointB[0] - controlPoints1.endPoint[0];
  let dy = controlPoints1.midPointB[1] - controlPoints1.endPoint[1];
  let dz = controlPoints1.midPointB[2] - controlPoints1.endPoint[2];
  let directionMagnitude = Math.sqrt(dx*dx + dy*dy + dz*dz);
  
  // normalize the direction vector
  dx /= directionMagnitude;
  dy /= directionMagnitude;
  dz /= directionMagnitude;
  
  // calculate the position of the new control points
  controlPoints1.midPointB = [
    controlPoints1.endPoint[0] + dx * averageDistance,
    controlPoints1.endPoint[1] + dy * averageDistance,
    controlPoints1.endPoint[2] + dz * averageDistance
  ];
  controlPoints2.midPointA = [
    controlPoints2.startPoint[0] - dx * averageDistance,
    controlPoints2.startPoint[1] - dy * averageDistance,
    controlPoints2.startPoint[2] - dz * averageDistance
  ];
}
