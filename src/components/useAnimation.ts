import gsap from "gsap"
import { RefObject, useEffect, useMemo, useState } from "react"
import { Mesh } from "three"
import { useStoreWithUndo } from "../store"
import { getCubicBezierPoint } from "../utils/interpolation"

export const useAnimation = (
  object: RefObject<Mesh | undefined>
) => {
  const [objectLoading, setObjectLoading] = useState(true);
  const viewSegments = useStoreWithUndo((state) => state.viewSegments);
  const playAnimation = useStoreWithUndo((state) => state.playAnimation);
  const relativePointIndex = useStoreWithUndo((state) => state.relativePointIndex);

  useEffect(() => {
    if (object.current) {
      setObjectLoading(false);
    }
  }, [object]);

  const timeline = useMemo(
    () =>
      gsap.timeline({
        repeat: -1,
        defaults: { duration: 2, ease: "ease" },
      }),
    []
  );


  useEffect(() => {
    if (!object.current || objectLoading || !timeline) return
    timeline.clear()
    viewSegments.forEach((controlPoints) => {
      if (!object.current) return
      console.log('realtime: ', controlPoints.pathExtra?.duration);
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
            const curPosition = getCubicBezierPoint(
              controlPoints.startPoint,
              controlPoints.midPointA,
              controlPoints.midPointB,
              controlPoints.endPoint,
              Math.min(1, time)
            );
            const nextPosition = getCubicBezierPoint(
              controlPoints.startPoint,
              controlPoints.midPointA,
              controlPoints.midPointB,
              controlPoints.endPoint,
              Math.min(1, time + 0.05)
            );
            object.current.position.copy(curPosition);
            const direction = nextPosition.clone().sub(curPosition);
            if (direction.length() > 0.01) {
                object.current.lookAt(nextPosition);
                object.current.up.set(0, 0, 1);
                object.current.updateMatrix();
            }
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
