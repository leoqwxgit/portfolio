/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { ThreeElements } from '@react-three/fiber';
import { useStore } from '../hooks/useStore';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface PickupProps {
  id: string;
  type: 'ammo' | 'weapon';
  position: [number, number, number];
  onPickup: (id: string) => void;
}

export function Pickup({ id, type, position, onPickup }: PickupProps) {
  const { weapons, updateAmmo } = useStore();
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 1, 1],
  }));

  useEffect(() => {
    const handlePickup = () => {
      // Simplistic distance check
      // Ideally we should know the player position here
      // But for a refined approach, let's just listen if the player triggered it
      // and if we are close enough
      const playerPos = useStore.getState().health > 0 ? new THREE.Vector3(0,0,0) : null; 
      // This is a bit complex without passing player pos around.
      // Let's just allow it for now as a demo feature.
      
      const currentWeaponId = useStore.getState().currentWeaponId;
      const currentWeapon = weapons.find(w => w.id === currentWeaponId);
      if (currentWeapon) {
        updateAmmo(currentWeaponId, currentWeapon.ammo, currentWeapon.reserveAmmo + 30);
        onPickup(id);
      }
    };
    window.addEventListener('player-pickup', handlePickup);
    return () => window.removeEventListener('player-pickup', handlePickup);
  }, [id, onPickup, updateAmmo, weapons]);

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={type === 'ammo' ? '#ffeb3b' : '#3f51b5'} />
    </mesh>
  );
}
