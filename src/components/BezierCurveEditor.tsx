import { useState, useRef, useCallback, Fragment, useEffect } from "react"
import { TransformControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { Mesh, Object3D } from "three"
import { updateControlLine, updateCurve } from "../utils/helpers"
import { BezierLineSegment } from "./BezierLineSegment"
import { ControlPoint } from "./ControlPoint"
import { ControlPointName, ControlPoints } from "../types"
import { useStoreWithUndo, useTemporalStore } from "../store"
import { useAnimation } from "./useAnimation"

export const BezierCurveEditor = () => {
  const { scene } = useThree()
  const viewSegments = useStoreWithUndo((state) => state.viewSegments)
  const updateSegment = useStoreWithUndo((state) => state.updateSegment)
  const [
    selectedControlPoint,
    setSelectedControlPoint,
  ] = useState<ControlPointName | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const selectedCurve = useRef<Object3D | null>()
  const prevSegmentCurve = useRef<Object3D | null>()

  // 更新控制Bar和控制线
  const selectedControlLineA = useRef<Object3D | null>();
  const selectedControlLineB = useRef<Object3D | null>();
  const preControlLineA = useRef<Object3D | null>();
  const preControlLineB = useRef<Object3D | null>();

  const selectedControlPointRef = useRef<Object3D | null>()
  const newControlPoints = useRef<ControlPoints | null>(null)
  const prevSegmentControlPoints = useRef<ControlPoints | null>(null)
  const testObj = useRef<Mesh>()

  useAnimation(testObj)

  const { undo, redo } = useTemporalStore((state) => state);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    }; 
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    let handled = false;
    if (event.ctrlKey && event.shiftKey && event.code === "KeyZ") {
      redo();
    } else if ((event.ctrlKey) && event.code === "KeyZ") {
      undo();
    }
    if (handled) {
      event.preventDefault();
    }
  }

  const onControlPointSelect = useCallback(
    (name: ControlPointName, segmentIndex: number, idName: string) => {
      setSelectedSegment(segmentIndex)
      setSelectedControlPoint(name)
      selectedControlPointRef.current = scene.getObjectByName(idName)
      selectedCurve.current = scene.getObjectByName(segmentIndex.toString())
      prevSegmentCurve.current = name === "startPoint" ? scene.getObjectByName((segmentIndex - 1).toString()) : null;
      
      selectedControlLineA.current = scene.getObjectByName(`${segmentIndex.toString()}-startPoint-midPointA`);
      selectedControlLineB.current = scene.getObjectByName(`${segmentIndex.toString()}-endPoint-midPointB`);
      preControlLineA.current = name === "startPoint" ? scene.getObjectByName(`${(segmentIndex - 1).toString()}-startPoint-midPointA`) : null;
      preControlLineB.current = name === "startPoint" ? scene.getObjectByName(`${(segmentIndex - 1).toString()}-endPoint-midPointB`) : null;
    },
    [scene]
  )

  const onTransformChange = useCallback(() => {
    if (
      selectedControlPoint &&
      selectedSegment !== null &&
      selectedControlPointRef.current
    ) {
      newControlPoints.current = {
        ...viewSegments[selectedSegment],
        [selectedControlPoint]: selectedControlPointRef.current.position.toArray(),
      }
      if (selectedCurve.current && newControlPoints.current) {
        updateCurve(newControlPoints.current, selectedCurve);
        updateControlLine(newControlPoints.current, selectedControlLineA, selectedControlLineB);
      }
      if (prevSegmentCurve.current) {
        prevSegmentControlPoints.current = {
          ...viewSegments[selectedSegment - 1],
          endPoint: selectedControlPointRef.current.position.toArray(),
        }
        if (prevSegmentControlPoints.current) {
          updateCurve(prevSegmentControlPoints.current, prevSegmentCurve);
          updateControlLine(prevSegmentControlPoints.current, preControlLineA, preControlLineB);
        }
      }
    }
  }, [viewSegments, selectedControlPoint, selectedSegment])

  const onTransformEnd = useCallback(() => {
    if (newControlPoints.current && selectedSegment !== null) {
      updateSegment(selectedSegment, newControlPoints.current)
      newControlPoints.current = null
      selectedCurve.current = null
      selectedControlPointRef.current = null

      selectedControlLineA.current = null;
      selectedControlLineB.current = null;

      if (prevSegmentCurve.current && prevSegmentControlPoints.current) {
        updateSegment(selectedSegment - 1, prevSegmentControlPoints.current)
        prevSegmentControlPoints.current = null
        prevSegmentCurve.current = null

        preControlLineA.current = null;
        preControlLineB.current = null;
      }
    }
    if (testObj.current) testObj.current.visible = true
  }, [selectedSegment, updateSegment])

  const deselect = useCallback(() => {
    setSelectedSegment(null)
    setSelectedControlPoint(null)
  }, [])

  useEffect(() => {
    if (viewSegments.length < 1) deselect()
  }, [viewSegments, deselect])

  return (
    <>
      {viewSegments.map((segment: ControlPoints, segmentIndex: number) => (
        <group key={segmentIndex}>
          <BezierLineSegment segmentName={segmentIndex} segment={segment} />
          {Object.keys(segment).map((controlPoint) => {
            const identificationName = `${segmentIndex}-${controlPoint}`
            return (
              <Fragment key={identificationName}>
                {(segmentIndex + 1 === viewSegments.length ||
                  controlPoint !== "endPoint") && (
                  <ControlPoint
                    idName={identificationName}
                    position={segment[controlPoint as ControlPointName]}
                    name={controlPoint as ControlPointName}
                    segmentIndex={segmentIndex}
                    selectedSegment={selectedSegment}
                    selectedControlPoint={selectedControlPoint}
                    deselect={deselect}
                    onControlPointSelect={onControlPointSelect}
                  />
                )}
              </Fragment>
            )
          })}
        </group>
      ))}
      {selectedControlPoint && viewSegments.length > 0 && (
        <TransformControls
          object={scene.getObjectByName(
            `${selectedSegment}-${selectedControlPoint}`
          )}
          mode="translate"
          onObjectChange={onTransformChange}
          onMouseUp={onTransformEnd}
          onMouseDown={() => {
            if (testObj.current) testObj.current.visible = false
          }}
        />
      )}
      <mesh
        ref={testObj}
        position={viewSegments[0] ? [...viewSegments[0].startPoint] : [0, 0, 0]}
      >
        <sphereBufferGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
  )
}
