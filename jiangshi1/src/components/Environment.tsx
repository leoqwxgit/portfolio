/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { usePlane, useBox } from '@react-three/cannon';
import { Stars, Sky } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

function Obstacle({ position, size, color = "#2c3e50" }: { position: [number, number, number], size: [number, number, number], color?: string }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: size,
  }));

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

export function Environment() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <>
      <Sky 
        sunPosition={[100, 50, 100]} 
        turbidity={0.01} 
        rayleigh={1} 
        mieCoefficient={0.001} 
        mieDirectionalG={0.9} 
      />
      
      {/* Ground with subtle grid and reflection for 'smooth' feel */}
      <mesh ref={ref as any} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Subtle grid helper for speed perception - dark lines on white floor */}
      <gridHelper args={[1000, 100, 0xcccccc, 0xeeeeee]} position={[0, 0.01, 0]} />

      {/* Buildings / High Ground */}
      <Obstacle position={[20, 2, 20]} size={[6, 4, 6]} color="#444" />
      <Obstacle position={[-25, 1.5, 15]} size={[8, 3, 5]} color="#3a3a3a" />
      <Obstacle position={[10, 1, -30]} size={[12, 2, 6]} color="#555" />
      <Obstacle position={[-10, 1, -30]} size={[12, 2, 6]} color="#555" />
      <Obstacle position={[-15, 3, -25]} size={[5, 6, 5]} color="#333" />
      
      {/* Scattered cover crates */}
      <Obstacle position={[5, 0.5, 5]} size={[1, 1, 1]} color="#4e342e" />
      <Obstacle position={[6, 0.5, 4.5]} size={[1, 1, 1]} color="#4e342e" />
      <Obstacle position={[5.5, 1.5, 4.8]} size={[1, 1, 1]} color="#4e342e" />
      
      <Obstacle position={[-8, 0.5, -5]} size={[1.2, 1, 1.2]} color="#37474f" />
      <Obstacle position={[12, 0.5, 0]} size={[1, 1, 1.5]} color="#263238" />
      
      {/* Distant mountains/walls for closure */}
      <Obstacle position={[0, 5, 100]} size={[300, 20, 10]} color="#000" />
      <Obstacle position={[0, 5, -100]} size={[300, 20, 10]} color="#000" />
      <Obstacle position={[100, 5, 0]} size={[10, 20, 300]} color="#000" />
      <Obstacle position={[-100, 5, 0]} size={[10, 20, 300]} color="#000" />
    </>
  );
}
