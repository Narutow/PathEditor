import "./styles.css"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei/core"
import { BezierCurveEditor } from "./components/BezierCurveEditor"
import { UI } from "./components/UI/UI"
import { Vector3 } from "three"
import SeatSphereContainer from "./components/SeatSphereContainer"

export default function App() {
  return (
    <div className="App" id="container">
      <div className="ui-container">
        <UI />
      </div>
      <Canvas
        style={{ background: "#888" }}
        id="canvas"
        dpr={window.devicePixelRatio}
        camera={{
          position: new Vector3(0, 5, 15),
          near: 0.01,
          far: 100,
          fov: 45,
        }}
      >
        <BezierCurveEditor />
        <ambientLight intensity={2} />
        <gridHelper args={[20, 20, "#FFF", "#CCC"]} />
        <OrbitControls makeDefault />
        <SeatSphereContainer />
      </Canvas>
    </div>
  )
}
