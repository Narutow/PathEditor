import { CubicBezierLine, Line } from "@react-three/drei"
import { ControlPoints } from "../types"

const lineProps = {
  lineWidth: 0.7,
  color: 1.0,
}

export const BezierLineSegment = ({
  segmentName,
  segment,
}: {
  segmentName: number
  segment: ControlPoints
}) => (
  <>
    <CubicBezierLine
      name={segmentName.toString()}
      start={segment.startPoint}
      midA={segment.midPointA}
      midB={segment.midPointB}
      end={segment.endPoint}
      segments={50}
      {...lineProps}
    />
    <Line
      name={`${segmentName.toString()}-startPoint-midPointA`}
      points={[segment['startPoint'], segment['midPointA']]}
      dashed={false}
      lineWidth={0.15}
      color={0.2}
    />
    <Line
      name={`${segmentName.toString()}-endPoint-midPointB`}
      points={[segment['endPoint'], segment['midPointB']]}      
      dashed={false}
      lineWidth={0.15}
      color={0.2}
    />
  </>
)
