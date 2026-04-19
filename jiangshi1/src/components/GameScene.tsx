/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Physics } from '@react-three/cannon';
import { Player } from './Player';
import { Zombie, zombiePositions } from './Zombie';
import { Environment } from './Environment';
import { Pickup } from './Pickup';
import { useStore } from '../hooks/useStore';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas, ThreeElements, useThree } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

function MiniMapSync() {
  const updateZombiesPos = useStore(state => state.updateZombiesPos);
  
  useFrame((state) => {
    if (state.clock.elapsedTime % 0.1 < 0.02) {
       const activeZombies = Object.entries(zombiePositions)
         .filter(([_, zpos]) => zpos && Array.isArray(zpos))
         .map(([zid, zpos]) => ({ id: zid, pos: zpos as [number, number, number] }));
       updateZombiesPos(activeZombies);
    }
  });
  return null;
}

function LineTracer({ start, end, weaponId }: { start: THREE.Vector3, end: THREE.Vector3, weaponId?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const style = useMemo(() => {
    switch(weaponId) {
      case 'gatling': return { color: '#00f2ff', opacity: 0.6, size: 0.008 };
      case 'launcher': return { color: '#ffb300', opacity: 1, size: 0.12 };
      case 'barrett': return { color: '#ffffff', opacity: 1, size: 0.04 };
      case 'tommy': return { color: '#ff3c00', opacity: 0.9, size: 0.025 };
      case 'ak47': return { color: '#ffcc00', opacity: 0.9, size: 0.015 };
      default: return { color: '#cccccc', opacity: 0.5, size: 0.01 };
    }
  }, [weaponId]);

  useFrame((state) => {
    if (meshRef.current) {
      const distance = start.distanceTo(end);
      meshRef.current.position.copy(start).lerp(end, 0.5);
      meshRef.current.lookAt(end);
      meshRef.current.rotateX(Math.PI / 2);
      meshRef.current.scale.set(1, distance, 1);
      
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity -= 0.1; // Fade out quickly
    }
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[style.size, style.size, 1, 6]} />
      <meshBasicMaterial color={style.color} transparent opacity={style.opacity} depthWrite={false} />
    </mesh>
  );
}

function GlobalEffects() {
  const [tracers, setTracers] = useState<{ id: string, start: THREE.Vector3, end: THREE.Vector3, weaponId: string, born: number }[]>([]);
  const [impacts, setImpacts] = useState<{ id: string, pos: [number, number, number], time: number, color: string }[]>([]);

  useEffect(() => {
    const onTracer = (e: any) => {
      setTracers(prev => [...prev.slice(-20), {
        id: Math.random().toString(),
        start: new THREE.Vector3(...e.detail.start),
        end: new THREE.Vector3(...e.detail.end),
        weaponId: e.detail.weaponId,
        born: Date.now()
      }]);
    };
    
    const onImpact = (e: any) => {
        setImpacts(prev => [...prev.slice(-20), { 
            id: Math.random().toString(), 
            pos: e.detail.position, 
            time: Date.now(),
            color: e.detail.color || "#ffaa00"
        }]);
    };

    window.addEventListener('spawn-tracer', onTracer);
    window.addEventListener('spawn-impact', onImpact);
    
    return () => {
        window.removeEventListener('spawn-tracer', onTracer);
        window.removeEventListener('spawn-impact', onImpact);
    };
  }, []);

  useFrame(() => {
    const now = Date.now();
    setTracers(prev => prev.filter(t => now - t.born < 100));
    setImpacts(prev => prev.filter(i => now - i.time < 400));
  });

  return (
    <group>
      {tracers.map(t => <LineTracer key={t.id} start={t.start} end={t.end} weaponId={t.weaponId} />)}
      {impacts.map(i => {
           const age = (Date.now() - i.time) / 400;
           return (
            <group key={i.id} position={i.pos}>
                <pointLight color={i.color} intensity={(1-age) * 10} distance={4} decay={2} />
                <mesh scale={[(1-age)*0.3, (1-age)*0.3, (1-age)*0.3]}>
                    <sphereGeometry args={[0.2, 4, 4]} />
                    <meshBasicMaterial color={i.color} transparent opacity={1-age} />
                </mesh>
            </group>
           )
      })}
    </group>
  );
}

export function GameScene() {
  const status = useStore(state => state.status);
  const wave = useStore(state => state.wave);
  const totalZombiesInWave = useStore(state => state.totalZombiesInWave);

  const [zombies, setZombies] = useState<{ id: string, position: [number, number, number] }[]>([]);
  const [pickups, setPickups] = useState<{ id: string, type: 'ammo' | 'weapon', position: [number, number, number], weaponId?: string }[]>([]);

  useEffect(() => {
    if (status === 'playing' || status === 'menu') {
      setZombies([]);
      setPickups([]);
      useStore.setState({ zombieKillsInWave: 0 });
    }
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      const state = useStore.getState();
      if (e.code === 'KeyR') reload();
      if (e.code === 'KeyE' || e.code === 'KeyF') window.dispatchEvent(new CustomEvent('player-pickup'));
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const index = parseInt(e.code.replace('Digit', '')) - 1;
        if (state.weapons[index]) state.setWeapon(state.weapons[index].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const reload = () => {
    const state = useStore.getState();
    const currentWeapon = state.weapons.find(w => w.id === state.currentWeaponId);
    if (!currentWeapon || currentWeapon.ammo === currentWeapon.maxAmmo || currentWeapon.reserveAmmo <= 0) return;
    const canTake = Math.min(currentWeapon.maxAmmo - currentWeapon.ammo, currentWeapon.reserveAmmo);
    state.updateAmmo(state.currentWeaponId, currentWeapon.ammo + canTake, currentWeapon.reserveAmmo - canTake);
  };

  const zombieKillsInWave = useStore(state => state.zombieKillsInWave);

  // Refined simplified wave progression:
  useEffect(() => {
    // When wave changes (incremented by store), clear local visuals
    setZombies([]);
    setPickups(prev => []); // Optional: clear pickups on wave change for freshness
  }, [wave]);

  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setZombies(prev => {
        // Only spawn up to the total limit for this wave
        if (prev.length < totalZombiesInWave) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 40 + Math.random() * 20;
          return [...prev, { 
            id: Math.random().toString(36).substr(2, 9), 
            position: [Math.cos(angle) * radius, 1, Math.sin(angle) * radius] 
          }];
        }
        return prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [status, wave, totalZombiesInWave, zombieKillsInWave]);

  useEffect(() => {
    if (status === 'playing') {
      setPickups(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        type: 'ammo', 
        position: [(Math.random() - 0.5) * 40, 0.25, (Math.random() - 0.5) * 40] 
      }]);
    }
  }, [wave, status]);

  return (
    <div className="absolute inset-0 w-full h-full cursor-crosshair">
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <fog attach="fog" args={['#e0e0e0', 30, 120]} />
        <color attach="background" args={['#e0e0e0']} />
        
        <Physics gravity={[0, -9.81, 0]}>
          <MiniMapSync />
          <GlobalEffects />
          <Player />
          <Environment />
          {zombies.map(z => <Zombie key={z.id} id={z.id} position={z.position} />)}
          {pickups.map(p => <Pickup key={p.id} id={p.id} type={p.type} position={p.position} onPickup={id => setPickups(prev=>prev.filter(x=>x.id!==id))} />)}
        </Physics>

        <ambientLight intensity={1.5} />
        <directionalLight 
           position={[10, 20, 10]} 
           intensity={1.2} 
           castShadow 
           shadow-mapSize={[1024, 1024]}
           shadow-camera-far={100}
           shadow-camera-left={-50}
           shadow-camera-right={50}
           shadow-camera-top={50}
           shadow-camera-bottom={-50}
        />
      </Canvas>
    </div>
  );
}
