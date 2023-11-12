import gsap from "gsap"
import { MutableRefObject, useEffect, useMemo, useState } from "react"
import { Object3D } from "three"
import { useStore } from "../store"
import { getCubicBezierPoint } from "../utils/interpolation"

export const useAnimation = (
  object: MutableRefObject<Object3D | undefined>
) => {
  const [objectLoading, setObjectLoading] = useState(true)
  const viewSegments = useStore((state) => state.viewSegments)
  const playAnimation = useStore((state) => state.playAnimation)
  const relativePointIndex = useStore((state) => state.relativePointIndex)

  useEffect(() => {
    if (object.current) setObjectLoading(false)
  }, [object])

  const timeline = useMemo(
    () =>
      gsap.timeline({
        repeat: -1,
        defaults: { duration: 2, ease: "ease" },
      }),
    []
  )

  useEffect(() => {
    if (!object.current || objectLoading || !timeline) return
    timeline.clear()
    viewSegments.forEach((controlPoints) => {
      if (!object.current) return
      timeline.to(
        object.current.position,
        {
          duration: controlPoints.pathExtra?.duration || 2,
          x: controlPoints.endPoint[0],
          y: controlPoints.endPoint[1],
          z: controlPoints.endPoint[2],
          onUpdate: function () {
            const time = this.progress()
            if (!object.current) return
            object.current.position.copy(
              getCubicBezierPoint(
                controlPoints.startPoint,
                controlPoints.midPointA,
                controlPoints.midPointB,
                controlPoints.endPoint,
                time
              )
            )
          },
        },
        ">"
      )
    })
  }, [object, viewSegments, objectLoading, timeline, relativePointIndex])

  useEffect(() => {
    if (playAnimation) {
      timeline?.resume()
    } else timeline?.pause()
  }, [playAnimation, timeline])
}
