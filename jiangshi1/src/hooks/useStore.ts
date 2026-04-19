/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { GameState, WEAPONS, WeaponInfo } from '../types';

interface StoreState extends GameState {
  setHealth: (health: number) => void;
  setScore: (score: number) => void;
  setWave: (wave: number) => void;
  setStatus: (status: GameState['status']) => void;
  setWeapon: (weaponId: string) => void;
  updateAmmo: (weaponId: string, ammo: number, reserveAmmo: number) => void;
  resetGame: () => void;
  nextWave: () => void;
  incrementZombieKills: () => void;
  zombieKills: number;
  zombieKillsInWave: number;
  worldData: {
    playerPos: [number, number, number];
    playerRotation: number;
    zombies: { id: string, pos: [number, number, number] }[];
    shake: number;
  };
  updatePlayerPos: (pos: [number, number, number], rotation: number) => void;
  updateZombiesPos: (zombies: { id: string, pos: [number, number, number] }[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  health: 100,
  maxHealth: 100,
  score: 0,
  wave: 1,
  zombieCount: 0,
  zombieKills: 0,
  zombieKillsInWave: 0,
  totalZombiesInWave: 4,
  status: 'menu',
  currentWeaponId: 'ak47',
  weapons: WEAPONS,
  worldData: {
    playerPos: [0, 0, 0],
    playerRotation: 0,
    zombies: [],
    shake: 0,
  },

  updatePlayerPos: (playerPos, playerRotation) => set((state) => ({
    worldData: { ...state.worldData, playerPos, playerRotation }
  })),

  updateZombiesPos: (zombies) => set((state) => ({
    worldData: { ...state.worldData, zombies }
  })),

  setHealth: (health) => set((state) => ({ 
    health: Math.max(0, Math.min(state.maxHealth, health)),
    status: health <= 0 ? 'gameover' : state.status
  })),
  
  setScore: (score) => set({ score }),
  
  setWave: (wave) => set({ 
    wave, 
    totalZombiesInWave: 4 + (wave - 1) * 2 
  }),
  
  setStatus: (status) => set({ status }),
  
  setWeapon: (currentWeaponId) => set({ currentWeaponId }),
  
  updateAmmo: (weaponId, ammo, reserveAmmo) => set((state) => ({
    weapons: state.weapons.map(w => w.id === weaponId ? { ...w, ammo, reserveAmmo } : w)
  })),
  
  incrementZombieKills: () => set((state) => {
    const nextKills = state.zombieKillsInWave + 1;
    const isWaveCleared = nextKills >= state.totalZombiesInWave;
    
    if (isWaveCleared) {
      return {
        zombieKills: state.zombieKills + 1,
        zombieKillsInWave: 0,
        score: state.score + 100,
        wave: state.wave + 1,
        totalZombiesInWave: 4 + state.wave * 2
      };
    }

    return { 
      zombieKills: state.zombieKills + 1,
      zombieKillsInWave: nextKills,
      score: state.score + 100,
    };
  }),

  nextWave: () => set((state) => ({
    wave: state.wave + 1,
    totalZombiesInWave: 4 + state.wave * 2,
    zombieKillsInWave: 0
  })),

  resetGame: () => set({
    health: 100,
    score: 0,
    wave: 1,
    zombieCount: 0,
    zombieKills: 0,
    zombieKillsInWave: 0,
    totalZombiesInWave: 4,
    status: 'playing',
    currentWeaponId: 'ak47',
    weapons: WEAPONS.map(w => ({ ...w }))
  }),
}));
