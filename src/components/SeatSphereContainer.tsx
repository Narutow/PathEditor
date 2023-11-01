import { useTexture } from "@react-three/drei";
import { useEffect, useState } from "react";
import { DoubleSide, TextureLoader, Vector3 } from "three";

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

  const spherePositions: Array<Vector3> = [
    new Vector3(0, 4.9, 0),
    new Vector3(-3.35, 2.1, 0),
    new Vector3(-1.2, 2.1, 0),
    new Vector3(1.2, 2.1, 0),
    new Vector3(3.35, 2.1, 0),
    new Vector3(-3.35, -0.35, 0),
    new Vector3(-1.2, -0.35, 0),
    new Vector3(1.2, -0.35, 0),
    new Vector3(3.35, -0.35, 0),
  ];

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
      {seatSphere(spherePositions[0], 0.9)}
      {seatSphere(spherePositions[1], 0.7)}
      {seatSphere(spherePositions[2], 0.7)}
      {seatSphere(spherePositions[3], 0.7)}
      {seatSphere(spherePositions[4], 0.7)}
      {seatSphere(spherePositions[5], 0.7)}
      {seatSphere(spherePositions[6], 0.7)}
      {seatSphere(spherePositions[7], 0.7)}
      {seatSphere(spherePositions[8], 0.7)}
    </>
  );
}
