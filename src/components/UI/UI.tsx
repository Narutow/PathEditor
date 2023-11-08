import { InputHTMLAttributes, useCallback, useRef } from "react"
import { useStore } from "../../store"
import { ControlPoints } from "../../types"
import { Radio, RadioChangeEvent } from "antd"

export const UI = () => {
  const segments = useStore((state) => state.segments);
  const addRandomSegment = useStore((state) => state.addRandomSegment)
  const removeSegments = useStore((state) => state.removeSegments)
  const setPlayAnimation = useStore((state) => state.setPlayAnimation)
  const relativePointIndex = useStore((state) => state.relativePointIndex);
  const setRelativePointIndex = useStore((state) => state.setRelativePointIndex);

  const onRadioChanged = (e: RadioChangeEvent) => {
    console.log('radio checked, set relative micseat index: ', e.target.value);
    setRelativePointIndex(e.target.value);
  };

  const onCurveExport = useCallback(async () => {
    let str = "";
    segments.forEach((controlPoints) => {
      str += `S:(${controlPoints.startPoint}). A:(${controlPoints.midPointA}). B:(${controlPoints.midPointB}), E:(${controlPoints.endPoint}), R:(${controlPoints.pathExtra?.isRelative}), D:(${controlPoints.pathExtra?.duration}) \n\n`
    });
    
    await navigator.clipboard.writeText(str)
    alert('已复制如下内容到剪贴板:\n' + str);
  }, [segments])

  const tryAddControlPoints = () => {
    const relativeChecked = (relativeCheckBoxRef?.current as InputHTMLAttributes<HTMLInputElement>)?.checked;
    const duration = (durationInputRef?.current as InputHTMLAttributes<HTMLInputElement>)?.value as number;
    addRandomSegment(relativeChecked, duration);
  }

  const smoothCurveLines = () => {
    
  }

  const relativeCheckBoxRef = useRef();
  const durationInputRef = useRef();

  return (
    <div className="ui-content">
      <button className="button" onClick={() => setPlayAnimation(true)}>
        开始动画
      </button>
      <button className="button" onClick={() => setPlayAnimation(false)}>
        暂停动画
      </button>
      <button className="button" onClick={removeSegments}>
        清除全部
      </button>
      <Radio.Group onChange={onRadioChanged} value={relativePointIndex}>
        <Radio value={0}>0</Radio>
        <div>
          <Radio value={1}>1</Radio>
          <Radio value={2}>2</Radio>
          <Radio value={3}>3</Radio>
          <Radio value={4}>4</Radio>
        </div>
        <div>
        <Radio value={5}>5</Radio>
        <Radio value={6}>6</Radio>
        <Radio value={7}>7</Radio>
        <Radio value={8}>8</Radio>
        </div>
      </Radio.Group>
      <div style={{flexDirection: "row", justifyContent: "space-between"}}>
        <input type="checkbox" ref={relativeCheckBoxRef} />
        <text style={{fontSize: "12px"}}>使用相对坐标添加这条轨迹</text>
      </div>
      <div style={{flexDirection: "row", justifyContent: "space-between"}}>
        <text style={{fontSize: "12px"}}>这条轨迹的动画时长(秒)(默认2秒):</text>
        <input style={{width: "25px"}} ref={durationInputRef} value={2} />
      </div>
      <button className="button" onClick={tryAddControlPoints}>
        添加轨迹
      </button>
      <button className="button" onClick={() => smoothCurveLines()}>
        丝滑一下
      </button>
      <button className="button" onClick={onCurveExport}>
        导出参数
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
      <view>
        <button className="button" onClick={() => alert('编辑线段')}>编辑</button>
        <button className="button" onClick={() => removeSegment(props.controlPoints)}>删除</button>  
      </view>      
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
