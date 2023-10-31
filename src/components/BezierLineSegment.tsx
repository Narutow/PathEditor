import { CubicBezierLine } from "@react-three/drei"
import { ControlPoints } from "../types"

const lineProps = {
  lineWidth: 0.7,
  color: "#fa00a0",
}

export const BezierLineSegment = ({
  segmentName,
  segment,
}: {
  segmentName: number
  segment: ControlPoints
}) => (
  <CubicBezierLine
    name={segmentName.toString()}
    start={segment.startPoint}
    midA={segment.midPointA}
    midB={segment.midPointB}
    end={segment.endPoint}
    segments={50}
    {...lineProps}
  />
)
