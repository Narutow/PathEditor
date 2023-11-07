import { useEffect, useState } from "react";
import { DoubleSide, TextureLoader, Vector3 } from "three";
import { useStore } from "../store";

export default function SeatSphereContainer() {

  function seatSphere(pos: Vector3, size: number) {
    return (
      <mesh
        position={pos}
      >
        <sphereBufferGeometry args={[size, 64]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    );
  }

  const micseats = useStore((state) => state.micseats)
  
  const [texture, setTexture] = useState(null)
  
  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      '/main_audio_scene.png',
      texture => {
        // 在纹理成功加载后进行更新
        setTexture(texture)
      }, undefined, error => {
        console.error('An error occurred while loading the texture.', error)
      }
    )
  }, [])

  return (
    <>
      <mesh
        position={[0, 0, 0]}
      >
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial map={texture} side={DoubleSide} opacity={0.5} transparent />
      </mesh>
      
      {seatSphere(micseats[0], 0.9)}
      {seatSphere(micseats[1], 0.7)}
      {seatSphere(micseats[2], 0.7)}
      {seatSphere(micseats[3], 0.7)}
      {seatSphere(micseats[4], 0.7)}
      {seatSphere(micseats[5], 0.7)}
      {seatSphere(micseats[6], 0.7)}
      {seatSphere(micseats[7], 0.7)}
      {seatSphere(micseats[8], 0.7)}
    </>
  );
}
