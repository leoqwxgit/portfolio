/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeaponInfo {
  id: string;
  name: string;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  damage: number;
  fireRate: number;
  reloadTime: number;
  icon: string;
  recoil: number;
  shakeIntensity: number;
  spread: number;
}

interface WorldZombie {
  id: string;
  pos: [number, number, number];
}

export interface GameState {
  health: number;
  maxHealth: number;
  score: number;
  wave: number;
  zombieCount: number;
  totalZombiesInWave: number;
  status: 'menu' | 'playing' | 'gameover';
  currentWeaponId: string;
  weapons: WeaponInfo[];
  worldData: {
    playerPos: [number, number, number];
    playerRotation: number;
    zombies: WorldZombie[];
    shake: number;
  };
}

export const WEAPONS: WeaponInfo[] = [
  {
    id: 'ak47',
    name: 'AK-47 步枪',
    ammo: 30,
    maxAmmo: 30,
    reserveAmmo: 120,
    damage: 25,
    fireRate: 0.1,
    reloadTime: 2000,
    icon: '🔫',
    recoil: 0.05,
    shakeIntensity: 0.2,
    spread: 0.02,
  },
  {
    id: 'gatling',
    name: '加特林',
    ammo: 100,
    maxAmmo: 100,
    reserveAmmo: 300,
    damage: 15,
    fireRate: 0.05,
    reloadTime: 4000,
    icon: '🔥',
    recoil: 0.02,
    shakeIntensity: 0.3,
    spread: 0.08,
  },
  {
    id: 'launcher',
    name: '火箭筒',
    ammo: 1,
    maxAmmo: 1,
    reserveAmmo: 5,
    damage: 100,
    fireRate: 1.5,
    reloadTime: 3000,
    icon: '🚀',
    recoil: 0.2,
    shakeIntensity: 1.5,
    spread: 0.01,
  },
  {
    id: 'tommy',
    name: '汤姆逊',
    ammo: 50,
    maxAmmo: 50,
    reserveAmmo: 150,
    damage: 18,
    fireRate: 0.08,
    reloadTime: 2500,
    icon: '🕶️',
    recoil: 0.03,
    shakeIntensity: 0.15,
    spread: 0.04,
  },
  {
    id: 'barrett',
    name: '巴雷特',
    ammo: 5,
    maxAmmo: 5,
    reserveAmmo: 20,
    damage: 150,
    fireRate: 1.0,
    reloadTime: 3500,
    icon: '🎯',
    recoil: 0.3,
    shakeIntensity: 0.8,
    spread: 0,
  },
];
