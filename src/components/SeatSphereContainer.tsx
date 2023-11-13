import { useEffect, useState } from "react";
import { DoubleSide, TextureLoader, Vector3, Texture } from "three";
import { useStoreWithUndo } from "../store";
import { BACKGROUND_RATIO, WORLD_WIDTH } from "../types";
import React from "react";

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

  const micseats = useStoreWithUndo((state) => state.micseats)
  
  const [texture, setTexture] = useState<Texture>();
  
  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      '/main_audio_scene.png',
      t => {
        // 在纹理成功加载后进行更新
        setTexture(t)
      }, undefined, error => {
        console.error('An error occurred while loading the texture.', error)
      }
    )
  }, [])

  return (
    <>
      <mesh
        position={[0, 0.65, 0]}
      >
        <planeGeometry args={[WORLD_WIDTH, WORLD_WIDTH * BACKGROUND_RATIO]} />
        <meshStandardMaterial map={texture} side={DoubleSide} opacity={0.5} transparent />
      </mesh>
      
      {seatSphere(micseats[0], 0.453218698501587)}
      {seatSphere(micseats[1], 0.362574964761734)}
      {seatSphere(micseats[2], 0.362574964761734)}
      {seatSphere(micseats[3], 0.362574964761734)}
      {seatSphere(micseats[4], 0.362574964761734)}
      {seatSphere(micseats[5], 0.362574964761734)}
      {seatSphere(micseats[6], 0.362574964761734)}
      {seatSphere(micseats[7], 0.362574964761734)}
      {seatSphere(micseats[8], 0.362574964761734)}
    </>
  );
}
