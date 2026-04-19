/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Weapon } from './Weapon';
import { useStore } from '../hooks/useStore';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const MOVE_SPEED = 9;
const JUMP_FORCE = 5;
const BOB_SPEED = 10;
const BOB_AMOUNT = 0.05;

export function Player() {
  const { camera, scene } = useThree();
  const currentWeaponId = useStore(state => state.currentWeaponId);
  const status = useStore(state => state.status);
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 5, 0],
    args: [0.6],
    angularFactor: [0, 0, 0],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => {
    pos.current = p;
  }), [api.position]);

  const keys = useRef<{ [key: string]: boolean }>({});
  const lastShot = useRef(0);
  const shakeRef = useRef(0);
  const recoilOffset = useRef(new THREE.Vector3());
  const recoilRotation = useRef(new THREE.Euler());
  const isMouseDown = useRef(false);

  // Sound/VFX triggering logic
  const handleShoot = useCallback(() => {
    const state = useStore.getState();
    const currentWeapon = state.weapons.find(w => w.id === currentWeaponId);
    if (!currentWeapon || currentWeapon.ammo <= 0 || status !== 'playing') return;

    const now = performance.now();
    if (now - lastShot.current < currentWeapon.fireRate * 1000) return;

    lastShot.current = now;
    state.updateAmmo(currentWeaponId, currentWeapon.ammo - 1, currentWeapon.reserveAmmo);

    // Apply Recoil
    recoilOffset.current.z += currentWeapon.recoil * 2;
    recoilRotation.current.x += currentWeapon.recoil;

    // Camera Shake
    state.updatePlayerPos(pos.current as any, camera.rotation.y); // Ensure state has latest
    window.dispatchEvent(new CustomEvent('screen-shake', { 
      detail: { intensity: currentWeapon.shakeIntensity } 
    }));

    // Raycasting for hit detection
    const raycaster = new THREE.Raycaster();
    
    // Add spread
    const movementSpeed = new THREE.Vector3(velocity.current[0], 0, velocity.current[2]).length();
    const dynamicSpread = currentWeapon.spread * (1 + movementSpeed * 0.5);
    const spreadVector = new THREE.Vector2(
      (Math.random() - 0.5) * dynamicSpread,
      (Math.random() - 0.5) * dynamicSpread
    );
    
    raycaster.setFromCamera(spreadVector, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    let targetPoint = new THREE.Vector3()
      .copy(camera.position)
      .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(100));

    if (intersects.length > 0) {
      targetPoint = intersects[0].point;
      
      // Spawn impact visual
      window.dispatchEvent(new CustomEvent('spawn-impact', {
        detail: { position: targetPoint.toArray(), normal: intersects[0].face?.normal.toArray() }
      }));

      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj) {
        if (obj.name === 'zombie' && obj.userData.id) {
           window.dispatchEvent(new CustomEvent('zombie-hit', { 
             detail: { 
               zombieId: obj.userData.id,
               damage: currentWeapon.damage,
               point: targetPoint.toArray()
             } 
           }));
           break;
        }
        obj = obj.parent;
      }
    }

    // Emit tracer and muzzle event
    window.dispatchEvent(new CustomEvent('spawn-tracer', {
      detail: {
        start: camera.position.toArray(),
        end: targetPoint.toArray(),
        weaponId: currentWeaponId
      }
    }));
    
    window.dispatchEvent(new CustomEvent('weapon-fire', {
      detail: { weaponId: currentWeaponId }
    }));

  }, [camera, scene, currentWeaponId, status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    const handleMouseDown = () => (isMouseDown.current = true);
    const handleMouseUp = () => (isMouseDown.current = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    const onShake = (e: any) => { shakeRef.current += e.detail.intensity || 0.1; };
    window.addEventListener('screen-shake', onShake);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('screen-shake', onShake);
    };
  }, []);

  const weaponGroupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Force rotation order for FPS stability and zero out roll to prevent flipping
    camera.rotation.order = 'YXZ';
    camera.rotation.z = 0;

    time.current += delta;

    // 1. Position Camera with Bobbing
    const movementSpeed = new THREE.Vector3(velocity.current[0], 0, velocity.current[2]).length();
    const bobOffset = movementSpeed > 1 ? Math.sin(time.current * BOB_SPEED) * BOB_AMOUNT : 0;
    
    // Smooth camera positioning
    shakeRef.current = THREE.MathUtils.lerp(shakeRef.current, 0, 0.1);
    const shake = shakeRef.current;
    
    camera.position.x = pos.current[0] + (Math.random() - 0.5) * shake;
    camera.position.z = pos.current[2] + (Math.random() - 0.5) * shake;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pos.current[1] + 0.75 + bobOffset, 0.2) + (Math.random() - 0.5) * shake;

    // 2. Weapon Recoil & Bobbing Recovery
    recoilOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    recoilRotation.current.x = THREE.MathUtils.lerp(recoilRotation.current.x, 0, 0.1);

    if (weaponGroupRef.current) {
      // Bobbing for weapon
      const weaponBobX = Math.cos(time.current * BOB_SPEED * 0.5) * BOB_AMOUNT * 0.5;
      const weaponBobY = Math.sin(time.current * BOB_SPEED) * BOB_AMOUNT * 0.2;

      // Weapon Sway based on rotation speed
      // (Simple implementation: offset based on view direction changes)
      
      weaponGroupRef.current.position.copy(camera.position);
      weaponGroupRef.current.quaternion.copy(camera.quaternion);
      
      // Apply offset for bobbing and recoil
      const localOffset = new THREE.Vector3(weaponBobX, weaponBobY - recoilOffset.current.z * 0.2, -recoilOffset.current.z);
      localOffset.applyQuaternion(camera.quaternion);
      weaponGroupRef.current.position.add(localOffset);
      
      // Pitch rotation for recoil
      weaponGroupRef.current.rotateX(recoilRotation.current.x);
    }

    // 3. Movement Physics
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(keys.current['KeyS'] || false) - Number(keys.current['KeyW'] || false));
    const sideVector = new THREE.Vector3(Number(keys.current['KeyA'] || false) - Number(keys.current['KeyD'] || false), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (keys.current['Space'] && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }

    // 4. Auto Fire Logic
    if (isMouseDown.current) {
      handleShoot();
    }

    // 5. Update State for Minimap
    useStore.getState().updatePlayerPos(
      [pos.current[0], pos.current[1], pos.current[2]], 
      camera.rotation.y
    );
  });

  return (
    <>
      {status === 'playing' && <PointerLockControls />}
      <mesh ref={ref as any} visible={false}>
        <sphereGeometry args={[0.6]} />
      </mesh>
      <group ref={weaponGroupRef}>
        <Weapon weaponId={currentWeaponId} />
      </group>
    </>
  );
}
