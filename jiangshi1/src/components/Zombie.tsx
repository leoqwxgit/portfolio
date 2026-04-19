/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../hooks/useStore';

interface ZombieProps {
  position: [number, number, number];
  id: string;
}

export const zombiePositions: Record<string, [number, number, number]> = {};

export function Zombie({ position, id }: ZombieProps) {
  const setHealth = useStore(state => state.setHealth);
  const incrementZombieKills = useStore(state => state.incrementZombieKills);
  const [hp, setHp] = useState(50);
  const [isDead, setIsDead] = useState(false);
  const [isHit, setIsHit] = useState(false);
  
  const lastAttack = useRef(0);
  const hitTimeout = useRef<any>(null);
  const scaleRef = useRef(1);

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position,
    args: [0.6],
    angularFactor: [0, 0, 0], // Perfectly lock rotation on all axes
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => {
    pos.current = p;
    zombiePositions[id] = p as [number, number, number];
  }), [api.position, id]);

  useEffect(() => {
    return () => { delete zombiePositions[id]; };
  }, [id]);

  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const healthBarRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (isDead || !ref.current) return;

    // 1. Billboard health bar
    if (healthBarRef.current && state.camera) {
      healthBarRef.current.quaternion.copy(state.camera.quaternion);
    }

    // 2. AI Movement
    const playerPos = state.camera.position;
    const currentZombiePos = new THREE.Vector3(...pos.current);
    const direction = new THREE.Vector3().subVectors(playerPos, currentZombiePos);
    direction.y = 0;
    const distance = direction.length();
    direction.normalize();

    const t = state.clock.getElapsedTime();
    const isMoving = distance > 1.2;
    const speed = distance > 25 ? 8 : (distance > 15 ? 6 : 4);
    
    if (isMoving) {
      api.velocity.set(direction.x * speed, velocity.current[1], direction.z * speed);
      
      // Clumsy Zombie Walk (Lurching)
      const walkSpeed = 6;
      const lurch = Math.sin(t * walkSpeed);
      if (leftLegRef.current) leftLegRef.current.rotation.x = lurch * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -lurch * 0.5;
      
      // Arms reaching forward but swaying slightly
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * 2) * 0.1;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI / 2 + Math.cos(t * 2) * 0.1;
        rightArmRef.current.rotation.z = -0.1;
      }

      // Head tilting slightly
      if (modelRef.current) {
        modelRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
      }
    } else {
      // Attack lunge
      const now = performance.now();
      if (now - lastAttack.current > 1000) {
        lastAttack.current = now;
        const currentHealth = useStore.getState().health;
        setHealth(currentHealth - 12);
      }
      api.velocity.set(0, velocity.current[1], 0);
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * 20) * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * 20) * 0.4;
    }

    // 3. Smooth Facing
    if (modelRef.current) {
        // Direct face player for aggressive feel
        modelRef.current.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // 4. Hit Feedback (Scale Pulsing)
    if (modelRef.current) {
        scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.15);
        modelRef.current.scale.setScalar(scaleRef.current);
    }
  });

  useEffect(() => {
    const handleHit = (e: any) => {
      if (e.detail.zombieId === id && !isDead) {
        const newHp = hp - e.detail.damage;
        
        setIsHit(true);
        scaleRef.current = 1.25; // Squash and stretch pop
        
        if (hitTimeout.current) clearTimeout(hitTimeout.current);
        hitTimeout.current = setTimeout(() => setIsHit(false), 100);

        if (newHp <= 0) {
          setIsDead(true);
          incrementZombieKills();
          api.position.set(0, -100, 0); // Cleanup physics
        } else {
          setHp(newHp);
        }
      }
    };
    window.addEventListener('zombie-hit', handleHit);
    return () => {
      window.removeEventListener('zombie-hit', handleHit);
      if (hitTimeout.current) clearTimeout(hitTimeout.current);
    };
  }, [hp, id, isDead, incrementZombieKills, api.position]);

  const matColor = isHit ? '#ffffff' : '#3d4d1d';
  const headColor = isHit ? '#ffffff' : '#689f38';

  return (
    <group ref={ref as any} name="zombie" userData={{ id }}>
      <group ref={modelRef}>
          {/* Torso - hunched */}
          <mesh position={[0, -0.05, 0]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.35]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          {/* Head - tilted forward and sideways */}
          <mesh position={[0.05, 0.6, 0.2]} rotation={[0.4, 0.1, -0.15]}>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshStandardMaterial color={headColor} roughness={0.6} />
            {/* Eyes */}
            <mesh position={[0.12, 0.1, 0.2]}>
              <boxGeometry args={[0.1, 0.1, 0.05]} />
              <meshStandardMaterial color="red" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            <mesh position={[-0.12, 0.1, 0.2]}>
              <boxGeometry args={[0.1, 0.1, 0.05]} />
              <meshStandardMaterial color="red" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            {/* Mouth - slack jawed */}
            <mesh position={[0, -0.15, 0.2]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.25, 0.12, 0.05]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          </mesh>
          {/* Arms - reaching but asymmetrical */}
          <mesh ref={leftArmRef as any} position={[-0.45, 0.3, 0.2]}>
            <boxGeometry args={[0.2, 0.65, 0.2]} />
            <meshStandardMaterial color={headColor} />
          </mesh>
          <mesh ref={rightArmRef as any} position={[0.45, 0.2, 0.3]}>
            <boxGeometry args={[0.2, 0.65, 0.2]} />
            <meshStandardMaterial color={headColor} />
          </mesh>
          {/* Legs - staggered stagger */}
          <mesh ref={leftLegRef as any} position={[-0.2, -0.7, 0]}>
            <boxGeometry args={[0.25, 0.7, 0.25]} />
            <meshStandardMaterial color="#1b4332" />
          </mesh>
          <mesh ref={rightLegRef as any} position={[0.2, -0.75, 0.1]}>
            <boxGeometry args={[0.25, 0.7, 0.25]} />
            <meshStandardMaterial color="#1b4332" />
          </mesh>
      </group>

      {/* Health Bar UI */}
      {!isDead && (
        <group ref={healthBarRef} position={[0, 1.3, 0]}>
            <mesh>
            <planeGeometry args={[0.9, 0.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>
            <mesh position={[((hp / 50) - 1) * 0.45, 0, 0.01]}>
            <planeGeometry args={[(hp / 50) * 0.9, 0.07]} />
            <meshBasicMaterial color={hp < 20 ? "#ff1744" : "#4caf50"} />
            </mesh>
        </group>
      )}
    </group>
  );
}
