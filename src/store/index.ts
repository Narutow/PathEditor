import create from "zustand"
import { ControlPoints, generateAbsoluteControlPoints, cloneControlPointsArray, convertRelativeControlPointsArray, removeElement, convertToRelativeControlPoints, smoothControlPoints, convertToRelativeControlPointsArray } from "../types"
import { getRandomPoint } from "../utils/helpers"
import { Vector3 } from "three"

/**
 * 存储贝塞尔曲线的数据,包括基础数据和显示数据.
 * 基础数据是最原始的数据,无法直接提供给渲染使用,需要经过加工,变成显示数据.
 * 这样做的原因是,需要支持贝塞尔曲线相对不同麦位展示,生成相对于要预览的麦位的数据,而这个数据不是固定的,
 * 需要随着相对麦位Index的变化而重新生成.如果直接改底层数据,那么会带来诸多不便,难以维护.
 */
interface SegmentsState {
  segments: ControlPoints[]; // 贝塞尔曲线的坐标,可能是相对的也可能是绝对的
  viewSegments: ControlPoints[]; // 经过处理后,实际要渲染的曲线数据
  micseats: Vector3[]; // 麦位的绝对位置
  playAnimation: boolean; // 是否继续播放动画
  relativePointIndex: number; // 当前相对于哪个坐标做编辑和预览

  /**
   * 更新贝塞尔曲线数据
   * @param segmentIndex 具体更新的是哪个曲线
   * @param newPoints 以什么数据替代
   * @returns void
   */
  updateSegment: (segmentIndex: number, newPoints: ControlPoints) => void;

  // To be deprected
  addRandomSegment: (isRelative: boolean, duration: number) => void;

  // 移除所有曲线
  removeSegments: () => void;

  // 开始/暂停动画
  setPlayAnimation: (v: boolean) => void;

  // 添加一条贝塞尔曲线
  addSegment: (segment: ControlPoints) => void;

  // 删除一条指定的贝塞尔曲线
  removeSegment: (segment: ControlPoints) => void;

  // 设置当前相对于哪个坐标做编辑和预览
  setRelativePointIndex: (v: number) => void;
}

export const useStore = create<SegmentsState>((set) => ({
  micseats: [
    new Vector3(0, 4.9, 0),
    new Vector3(-3.35, 2.1, 0),
    new Vector3(-1.2, 2.1, 0),
    new Vector3(1.2, 2.1, 0),
    new Vector3(3.35, 2.1, 0),
    new Vector3(-3.35, -0.35, 0),
    new Vector3(-1.2, -0.35, 0),
    new Vector3(1.2, -0.35, 0),
    new Vector3(3.35, -0.35, 0),
  ],

  segments: [
    {
      startPoint: [-2, -2, 1],
      midPointA: [-1, 1, 4],
      midPointB: [1, -1, -4],
      endPoint: [2, 2, -1],
    },
  ],

  // 初始值同segments一样
  viewSegments: [
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
      const micseats = state.micseats;
      const relativeIndex = state.relativePointIndex;
      const newViewSegments = [...state.viewSegments]
      newViewSegments[segmentIndex] = {
        ...newViewSegments[segmentIndex],
        ...newPoints,
      }
      // 拷贝完数组后,需要遍历viewSegments,对其中的相对坐标特殊处理成绝对坐标
      return {
        segments: convertToRelativeControlPointsArray(newViewSegments, micseats, relativeIndex),
        viewSegments: newViewSegments,
      }
    }),

  relativePointIndex: 3,

  addRandomSegment: (isRelative: boolean, duration: number) =>
    set((state) => {
      // 用viewSegments绝对坐标生成绝对坐标,再转换成相对坐标加入到segments中
      const micseats = state.micseats;
      const relativeIndex = state.relativePointIndex;
      const newSegments = cloneControlPointsArray(state.segments);
      const viewSegments = state.viewSegments;
      // 生成了一个相对坐标在绝对坐标系下的值
      const newControlPoints = generateAbsoluteControlPoints(viewSegments, 0.4, isRelative, duration);
      const relativePoints = convertToRelativeControlPoints(newControlPoints, micseats, relativeIndex);
      if (relativePoints) {
        newSegments.push(relativePoints);
      }
      const newViewSegments = convertRelativeControlPointsArray(cloneControlPointsArray(newSegments), micseats, relativeIndex);
      return {
        segments: newSegments,
        viewSegments: newViewSegments,
      };
    }),

  removeSegments: () => set({ segments: [], viewSegments: [] }),

  setPlayAnimation: (v: boolean) => set({ playAnimation: v }),

  setRelativePointIndex: (v: number) => set((state) => {
    const micseats = state.micseats;
    const newSegments = [...state.segments];
    const newViewSegments = convertRelativeControlPointsArray(cloneControlPointsArray(newSegments), micseats, v);
    
    return {
      relativePointIndex: v,
      viewSegments: smoothControlPoints(newViewSegments),
    };
  }),

  addSegment: (segment: ControlPoints) =>
    set((state) => {
      const micseats = state.micseats;
      const relativeIndex = state.relativePointIndex;
      const newSegments = [...state.segments];
      newSegments.push(segment);
      const newViewSegments = convertRelativeControlPointsArray(cloneControlPointsArray(newSegments), micseats, relativeIndex);
      
      return {
        segments: newSegments,
        viewSegments: newViewSegments,
      };
    }),
  
  removeSegment: (segment: ControlPoints) =>
    set((state) => {
      const newSegments = removeElement(state.segments, segment);
      return {
        segments: newSegments,
        viewSegments: newSegments,
      };
    }),
}))
