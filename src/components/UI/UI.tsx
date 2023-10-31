import { useCallback } from "react"
import { useStore } from "../../store"

export const UI = () => {
  const segments = useStore((state) => state.segments)
  const addRandomSegment = useStore((state) => state.addRandomSegment)
  const removeSegments = useStore((state) => state.removeSegments)
  const setPlayAnimation = useStore((state) => state.setPlayAnimation)

  const onCurveExport = useCallback(() => {
    let str = ""
    segments.forEach((controlPoints) => {
      str += `B(t) = (1-t)³(${controlPoints.startPoint}) + 3(1 - t)²t(${controlPoints.midPointA}) + 3(1 - t)t²(${controlPoints.midPointB}) + t³(${controlPoints.endPoint}); \n`
    })
    alert(str)
  }, [segments])

  return (
    <div className="ui-content">
      <button className="button" onClick={addRandomSegment}>
        Add Random Point
      </button>
      <button className="button" onClick={removeSegments}>
        Clear All
      </button>
      <button className="button" onClick={onCurveExport}>
        Export Curve
      </button>
      <button className="button" onClick={() => setPlayAnimation(true)}>
        Play
      </button>
      <button className="button" onClick={() => setPlayAnimation(false)}>
        Pause
      </button>
    </div>
  )
}
