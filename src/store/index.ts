import create from "zustand"
import { ControlPoints } from "../types"
import { getRandomPoint } from "../utils/helpers"

interface SegmentsState {
  segments: ControlPoints[]
  playAnimation: boolean
  updateSegment: (segmentIndex: number, newPoints: ControlPoints) => void
  addRandomSegment: () => void
  removeSegments: () => void
  setPlayAnimation: (v: boolean) => void
}

export const useStore = create<SegmentsState>((set) => ({
  segments: [
    {
      startPoint: [-2, -2, 1],
      midPointA: [-1, 1, 4],
      midPointB: [1, -1, -4],
      endPoint: [2, 2, -1],
    },
  ],
  playAnimation: true,
  updateSegment: (segmentIndex: number, newPoints: ControlPoints) =>
    set((state) => {
      const newSegments = [...state.segments]
      newSegments[segmentIndex] = {
        ...newSegments[segmentIndex],
        ...newPoints,
      }
      return {
        segments: newSegments,
      }
    }),
  addRandomSegment: () =>
    set((state) => {
      const newSegments = [...state.segments]
      newSegments.push({
        startPoint: newSegments[newSegments.length - 1]?.endPoint || [0, 0, 0],
        endPoint: getRandomPoint(),
        midPointA: getRandomPoint(),
        midPointB: getRandomPoint(),
      })
      return { segments: newSegments }
    }),
  removeSegments: () => set({ segments: [] }),
  setPlayAnimation: (v: boolean) => set({ playAnimation: v }),
}))
