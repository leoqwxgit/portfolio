/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface WeaponProps {
  weaponId: string;
}

export function Weapon({ weaponId }: WeaponProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Group>(null);
  const [isFiring, setIsFiring] = useState(false);
  const kickRef = useRef(0);

  useEffect(() => {
    const onFire = (e: any) => {
      if (e.detail.weaponId === weaponId) {
        setIsFiring(true);
        kickRef.current = 0.15; // Punchy kick
        setTimeout(() => setIsFiring(false), 50);
      }
    };
    window.addEventListener('weapon-fire', onFire);
    return () => window.removeEventListener('weapon-fire', onFire);
  }, [weaponId]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Kickback recovery
    kickRef.current = THREE.MathUtils.lerp(kickRef.current, 0, 0.2);
    groupRef.current.position.z = -0.6 + kickRef.current;
    groupRef.current.rotation.x = -kickRef.current * 0.5;

    if (flashRef.current) {
        flashRef.current.visible = isFiring;
        flashRef.current.rotation.z += 1;
        flashRef.current.scale.setScalar(0.5 + Math.random() * 0.5);
    }
  });

  const renderModel = () => {
    const metalMat = <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />;
    const woodMat = <meshStandardMaterial color="#4e342e" roughness={0.9} />;

    switch (weaponId) {
      case 'ak47':
        return (
          <group rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.1, 0.05]} />
              {metalMat}
            </mesh>
            <mesh position={[0.4, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6]} />
              {metalMat}
            </mesh>
            <mesh position={[-0.3, -0.05, 0]}>
              <boxGeometry args={[0.2, 0.15, 0.06]} />
              {woodMat}
            </mesh>
          </group>
        );
      case 'gatling':
        return (
          <group rotation={[0, -Math.PI / 2, 0]} position={[0, -0.05, 0]}>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
              <meshStandardMaterial color="#111" metalness={1} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <mesh key={i} position={[0.2, Math.cos(i * Math.PI / 3) * 0.08, Math.sin(i * Math.PI / 3) * 0.08]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.0]} />
                {metalMat}
              </mesh>
            ))}
          </group>
        );
      case 'launcher':
        return (
          <group rotation={[0, -Math.PI / 2, 0]} position={[0.1, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.22, 0.22, 1.4, 8]} />
              <meshStandardMaterial color="#2d6a4f" metalness={0.5} />
            </mesh>
            <mesh position={[-0.3, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        );
      case 'tommy':
        return (
          <group rotation={[0, -Math.PI / 2, 0]} position={[0, -0.05, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.08, 0.06]} />
              {metalMat}
            </mesh>
            <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
              <meshStandardMaterial color="#0a0a0a" metalness={1} />
            </mesh>
            <mesh position={[-0.4, -0.05, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.2, 0.2, 0.08]} />
              {woodMat}
            </mesh>
          </group>
        );
      case 'barrett':
        return (
          <group rotation={[0, -Math.PI / 2, 0]} position={[0.3, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.2, 0.12, 0.1]} />
              <meshStandardMaterial color="#050505" metalness={1} />
            </mesh>
            <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 1.0]} />
              {metalMat}
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.4, 0.08, 0.08]} />
              <meshStandardMaterial color="#000" />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  const getMuzzlePos = () => {
      switch(weaponId) {
          case 'barrett': return [1.5, 0, 0.4];
          case 'launcher': return [1.0, 0, 0.3];
          default: return [0.8, 0, 0.4];
      }
  }

  return (
    <group ref={groupRef} position={[0.45, -0.35, -0.6]}>
      {renderModel()}
      
      {/* Muzzle Flash */}
      <group ref={flashRef} position={getMuzzlePos() as any}>
          <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
          </mesh>
          <pointLight color="#ffff00" intensity={5} distance={2} />
      </group>
    </group>
  );
}
