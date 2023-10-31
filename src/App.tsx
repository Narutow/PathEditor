import "./styles.css"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei/core"
import { BezierCurveEditor } from "./components/BezierCurveEditor"
import { UI } from "./components/UI/UI"

export default function App() {
  return (
    <div className="App" id="container">
      <div className="ui-container">
        <UI />
      </div>
      <Canvas
        style={{ background: "#000" }}
        id="canvas"
        dpr={window.devicePixelRatio}
        camera={{
          position: [0, 5, 15],
          near: 0.01,
          far: 100,
          fov: 45,
        }}
      >
        <BezierCurveEditor />
        <ambientLight intensity={2} />
        <gridHelper args={[20, 20]} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
