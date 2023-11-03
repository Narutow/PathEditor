import { useCallback, useState } from "react"
import { useStore } from "../../store"
import { Vector3Tuple } from "three"
import { ControlPoints } from "../../types"

export const UI = () => {
  const segments = useStore((state) => state.segments)
  const addRandomSegment = useStore((state) => state.addRandomSegment)
  const removeSegments = useStore((state) => state.removeSegments)
  const setPlayAnimation = useStore((state) => state.setPlayAnimation)
  const addSegment = useStore((state) => state.addSegment);

  // 定义四个input框的状态数据
  const [start, setStart] = useState('');
  const [controlA, setControlA] = useState('');
  const [controlB, setControlB] = useState('');
  const [end, setEnd] = useState('');
  const onInputChanged = (type: string, value: string) => {
    if (type === 'Start') {
      setStart(value);
    } else if (type === 'ControlA') {
      setControlA(value);
    } else if (type === 'ControlB') {
      setControlB(value);
    } else if (type === 'End') {
      setEnd(value);
    }
  }

  function parseInput(input: string): {success: boolean, result: number[]} {
    const result = input.split(',').map(s => parseFloat(s.trim()));
    let success = true;
    if (result.some(isNaN)) {
      success = false;
    }    
    return {success, result};
  }


  const tryAddSegment = () => {
    const parsedStartData = parseInput(start);
    const parsedControlAData = parseInput(controlA);
    const parsedControlBData = parseInput(controlB);
    const parsedEndData = parseInput(end);
    if (!parsedStartData.success) {
      alert('请检查起始点数据输入格式,是\"1.0, 2, 3.5\"这种形式的数据');
      return;
    }
    if (!parsedControlAData.success) {
      alert('请检查控制点A数据输入格式,是\"1.0, 2, 3.5\"这种形式的数据');
      return;
    }
    if (!parsedControlBData.success) {
      alert('请检查控制点B数据输入格式,是\"1.0, 2, 3.5\"这种形式的数据');
      return;
    }
    if (!parsedEndData.success) {
      alert('请检查结束点数据输入格式,是\"1.0, 2, 3.5\"这种形式的数据');
      return;
    }
    const controlPoints = {
      startPoint: parsedStartData.result as Vector3Tuple,
      endPoint: parsedEndData.result as Vector3Tuple,
      midPointA: parsedControlAData.result as Vector3Tuple,
      midPointB: parsedControlBData.result as Vector3Tuple,
    };
    addSegment(controlPoints);
  }

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
        随机添加轨迹
      </button>
      <button className="button" onClick={removeSegments}>
        清除全部
      </button>
      <button className="button" onClick={onCurveExport}>
        导出参数
      </button>
      <button className="button" onClick={() => setPlayAnimation(true)}>
        播放动画
      </button>
      <button className="button" onClick={() => setPlayAnimation(false)}>
        暂停动画
      </button>
      <input placeholder="起始点" onChange={(event) => {onInputChanged('Start', event.target.value)}} />
      <input placeholder="控制点A" onChange={(event) => {onInputChanged('ControlA', event.target.value)}} />
      <input placeholder="控制点B" onChange={(event) => {onInputChanged('ControlB', event.target.value)}} />
      <input placeholder="结束点" onChange={(event) => {onInputChanged('End', event.target.value)}} />
      <button className="button" onClick={tryAddSegment}>
        添加轨迹
      </button>
          </div>
  )
}

type CurveProps = {
  controlPoints: ControlPoints,
};

function CurveItem(props: CurveProps) {
  const { startPoint, endPoint, midPointA, midPointB } = props.controlPoints;
  
  const startPointStr = startPoint.map(val => val.toFixed(2)).join(', ');
  const controlAPointStr = midPointA.map(val => val.toFixed(2)).join(', ');
  const controlBPointStr = midPointB.map(val => val.toFixed(2)).join(', ');
  const endPointStr = endPoint.map(val => val.toFixed(2)).join(', ');

  const removeSegment = useStore((state) => state.removeSegment)

  return (
    <div className="curve-item-container">
      <div className="points-container">
        <div className="points-row">
          <text className="point-text">S:{startPointStr}</text>
          <div style={{width: "10px"}}/>
          <text className="point-text">E:{endPointStr}</text>
        </div>
        <div className="points-row">
          <text className="point-text">A:{controlAPointStr}</text>
          <div style={{width: "10px"}}/>
          <text className="point-text">B:{controlBPointStr}</text>
        </div>
      </div>
      <button className="button" onClick={() => removeSegment(props.controlPoints)}>删除</button>
    </div>
  );
}

export function CurveList() {
  const segments = useStore((state) => state.segments);

  return (
    <div className="curve-list-container">
    {segments && segments.map((value: ControlPoints, index: number) => {
      return <CurveItem controlPoints={value} key={index} />
    })}
    </div>
  );
}
