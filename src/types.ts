import { Vector3, Vector3Tuple } from "three"

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
export function smoothControlPoints(controlPoints: ControlPoints[]): ControlPoints[] {
  for (let i = 0; i < controlPoints.length - 1; i++) {
      let cur = controlPoints[i];
      let next = controlPoints[i+1];

      //确保两个控制点相连
      cur.endPoint = next.startPoint;

      //计算连接向量
      let connectVector: Vector3Tuple = [
          next.startPoint[0] - cur.endPoint[0],
          next.startPoint[1] - cur.endPoint[1],
          next.startPoint[2] - cur.endPoint[2]
      ];

      //使用连接向量调整当前曲线的第二个控制点 (midPointB)
      cur.midPointB = adjustPoint(cur.midPointB, connectVector);

      //使用反向连接向量调整下一条曲线的第一个控制点 (midPointA)
      let reverseConnectVector: Vector3Tuple = [
          -connectVector[0],
          -connectVector[1],
          -connectVector[2]
      ];
      next.midPointA = adjustPoint(next.midPointA, reverseConnectVector);
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
      startPoint: [-2, -2, 1],
      midPointA: [-1, 1, 4],
      midPointB: [1, -1, -4],
      endPoint: [2, 2, -1],
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