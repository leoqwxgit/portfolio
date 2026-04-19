/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../hooks/useStore';
import { ThreeElements } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export function HUD() {
  const { health, maxHealth, score, wave, currentWeaponId, weapons, zombieKillsInWave, totalZombiesInWave, worldData } = useStore();
  const currentWeapon = weapons.find(w => w.id === currentWeaponId);
  const [isFiring, setIsFiring] = useState(false);
  const [showWaveClear, setShowWaveClear] = useState(false);
  const fireTimeout = useRef<any>(null);

  const lastKillsInWave = useRef(zombieKillsInWave);

  useEffect(() => {
    // Trigger notification only at the moment the threshold is hit
    if (zombieKillsInWave >= totalZombiesInWave && totalZombiesInWave > 0 && lastKillsInWave.current < totalZombiesInWave) {
      setShowWaveClear(true);
      setTimeout(() => setShowWaveClear(false), 3000);
    }
    lastKillsInWave.current = zombieKillsInWave;
  }, [zombieKillsInWave, totalZombiesInWave]);

  useEffect(() => {
    const onFire = () => {
        setIsFiring(true);
        if (fireTimeout.current) clearTimeout(fireTimeout.current);
        fireTimeout.current = setTimeout(() => setIsFiring(false), 100);
    };
    window.addEventListener('weapon-fire', onFire);
    return () => window.removeEventListener('weapon-fire', onFire);
  }, []);

  const mapRange = 100;
  const { playerPos = [0, 0, 0], playerRotation = 0, zombies: worldZombies = [] } = worldData || {};

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-50 font-sans text-white">
      {/* Damage Overlay */}
      <AnimatePresence>
        {health < 40 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-900/30 mix-blend-multiply z-0"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

      {/* Top Left: Tactical Info */}
      <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-red-500" />
            <div className="text-sm font-mono tracking-widest text-red-500 uppercase">任务：清除威胁</div>
        </div>
        <div className="mt-1 text-4xl font-black uppercase tracking-tighter mix-blend-difference">
            第 {wave.toString().padStart(2, '0')} 波
        </div>
        <div className="text-[10px] font-mono opacity-50 uppercase tracking-[0.2em]">
            确认击杀: {zombieKillsInWave} / {totalZombiesInWave}
        </div>
      </div>

      {/* Top Right: Radar Widget (Recipe 3) */}
      <div className="absolute top-8 right-8">
        <div className="relative w-40 h-40 bg-[#151619] rounded-full border border-white/10 overflow-hidden shadow-2xl shadow-black">
            {/* Radar Grid */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
                <div className="absolute inset-4 border border-white rounded-full" />
                <div className="absolute inset-10 border border-white rounded-full" />
            </div>

            {/* Sweep effect */}
            <motion.div 
               className="absolute inset-0 origin-center bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent"
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Content Rotation - removed minus sign for correct orientation */}
            <div 
                className="absolute inset-0"
                style={{ transform: `rotate(${playerRotation}rad)`, transformOrigin: 'center' }}
            >
                {worldZombies.map(z => {
                    const rx = (z.pos[0] - playerPos[0]) / (mapRange / 2);
                    const rz = (z.pos[2] - playerPos[2]) / (mapRange / 2);
                    if (Math.sqrt(rx*rx + rz*rz) > 1) return null;
                    return (
                        <div 
                            key={z.id}
                            className="absolute w-1.5 h-1.5 bg-red-500 rounded-full blur-[1px] shadow-[0_0_5px_#ff0000]"
                            style={{ left: `${(rx + 1) * 50}%`, top: `${(rz + 1) * 50}%` }}
                        />
                    );
                })}
            </div>

            {/* Center: Player View Cone */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-400 drop-shadow-[0_0_4px_cyan]" />
            </div>
        </div>
        <div className="mt-2 text-right">
            <span className="text-[9px] font-mono tracking-tighter opacity-40 uppercase">卫星链路：已连接</span>
        </div>
      </div>

      {/* Center: Dynamic Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {showWaveClear && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute top-1/3 flex flex-col items-center gap-2"
            >
              <div className="text-red-500 font-black text-6xl italic skew-x-[-12deg] tracking-tighter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">区域已清空</div>
              <div className="text-white font-mono text-xs tracking-[0.5em] opacity-50">下一波次正在部署...</div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
            animate={{ 
                scale: isFiring ? 1.5 : 1,
                rotate: isFiring ? 45 : 0 
            }}
            className="relative"
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-cyan-400" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-cyan-400" />
            <div className="w-1 h-1 bg-red-500 rounded-full" />
        </motion.div>
      </div>

      {/* Bottom Interface: Health & Ammo (Recipe 4) */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
        {/* Vital Health Status */}
        <div className="flex flex-col gap-2 w-72">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50 italic">生命体征</span>
                <span className="text-sm font-black italic">{Math.round((health / maxHealth) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(health / maxHealth) * 100}%` }}
                    className={`h-full transition-colors duration-500 ${health < 30 ? 'bg-red-600' : 'bg-cyan-500'}`}
                />
            </div>
            {health < 30 && (
                <div className="text-[10px] text-red-500 font-bold uppercase animate-pulse tracking-tighter italic">警告：侦测到生存威胁</div>
            )}
        </div>

        {/* Tactical Ammo Readout */}
        <div className="flex flex-col items-end">
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-40 mb-2">{currentWeapon?.name} // 标准口径</div>
            <div className="flex items-baseline gap-2">
                <motion.span 
                    key={currentWeapon?.ammo}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-8xl font-black italic leading-none tracking-tighter"
                >
                    {currentWeapon?.ammo}
                </motion.span>
                <span className="text-2xl font-bold opacity-30 tracking-widest italic">/ {currentWeapon?.reserveAmmo}</span>
            </div>
        </div>
      </div>

      {/* Interaction Prompts */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          {currentWeapon && currentWeapon.ammo <= 0 && currentWeapon.reserveAmmo > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity }}
                className="bg-red-600 px-6 py-2 skew-x-[-12deg] text-xs font-black uppercase tracking-widest"
              >
                  按 [R] 键装填弹药
              </motion.div>
          )}
      </div>

      {/* Global Vignette and Scanlines */}
      <div className="absolute inset-0 box-shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
    </div>
  );
}
