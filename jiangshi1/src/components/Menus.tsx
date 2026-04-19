/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useStore } from '../hooks/useStore';
import { Play } from 'lucide-react';

export function StartMenu() {
  const { resetGame } = useStore();

  return (
    <div className="fixed inset-0 bg-[#050510] flex items-center justify-center z-[100] p-10 select-none overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-red-600/10 to-transparent opacity-50" />
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
        {/* Left column: Dramatic Hero (Recipe 2) */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div className="text-red-600 font-bold uppercase tracking-[0.6em] mb-6 text-xs flex items-center gap-4">
                <div className="w-12 h-px bg-red-600" />
                <span>区域: 404 // 协议: 欧米伽</span>
            </div>
            <h1 className="text-[12rem] font-black text-white mb-2 uppercase tracking-tighter leading-[0.75] italic skew-x-[-12deg]">
              末日<br/><span className="text-red-600 underline decoration-8 underline-offset-8">之刃</span>
            </h1>
            <div className="text-3xl font-light tracking-[0.4em] uppercase text-white/20 mt-4 italic mb-12">在黑暗中求生</div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-6">
          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="w-fit bg-red-600 text-white px-20 py-8 font-black text-xl flex items-center justify-center gap-6 uppercase tracking-tighter italic shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:bg-white hover:text-red-600 transition-colors"
          >
            部署任务
            <Play fill="currentColor" size={32} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, x: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '../index.html'}
            className="w-fit bg-transparent border border-white/20 text-white/70 px-20 py-8 font-black text-xl flex items-center justify-center gap-6 uppercase tracking-tighter italic hover:bg-white/10 hover:text-white transition-colors"
          >
            返回主页
          </motion.button>
          </div>
        </div>

        {/* Right column: Technical Intel (Recipe 1) */}
        <div className="flex flex-col justify-center">
           <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="bg-white/5 border border-white/10 p-16 rounded-3xl backdrop-blur-2xl relative"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-red-600" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-white/20" />

            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 mb-10 pb-6 border-b border-white/5 italic">
               战术简报 // 输入控制
            </div>
            
            <div className="grid grid-cols-1 gap-12">
               <ControlItem keys="WASD" label="移动控制" />
               <ControlItem keys="Mouse01" label="火力压制" />
               <ControlItem keys="Spacebar" label="战术跳跃" />
               <ControlItem keys="Key [R]" label="紧急装弹" />
               <ControlItem keys="[1 - 5]" label="战备切换" />
            </div>

            <div className="mt-16 flex items-center gap-4 text-[11px] font-black italic">
               <span className="text-red-600 animate-pulse uppercase">警告：侦测到大规模感染源</span>
               <div className="h-px flex-1 bg-white/10" />
               <span className="opacity-20 uppercase">数据链路已连接</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ControlItem({ keys, label }: { keys: string, label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4">
      <span className="text-white/30 font-black uppercase text-[20px] tracking-widest italic">{label}</span>
      <span className="text-white font-black tracking-tighter uppercase text-xl italic">{keys}</span>
    </div>
  );
}

export function GameOverMenu() {
  const { wave, zombieKills, resetGame, setStatus } = useStore();

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[200] p-4 lg:p-12 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay animate-pulse" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-red-600/20 to-transparent" />
      
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full flex flex-col items-center relative z-10"
      >
        <div className="text-red-700 font-black uppercase tracking-[1em] mb-4 text-[10px] md:text-xs">检测到生物信号中断 // 状态: 致命</div>
        
        <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black text-white mb-8 uppercase tracking-tighter leading-none italic skew-x-[-12deg] drop-shadow-[0_20px_50px_rgba(255,0,0,0.5)] text-center">
            任务<br/><span className="text-red-600 line-through decoration-white/20">失败</span>
        </h1>
        
        <div className="grid grid-cols-2 gap-4 w-full mb-12">
          <div className="p-6 bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-1">生存阶段</div>
            <div className="text-4xl md:text-6xl font-black text-white italic">Wave {wave}</div>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-1">击杀统计</div>
            <div className="text-4xl md:text-6xl font-black text-red-600 italic">{zombieKills}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xl">
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetGame}
            className="group relative w-full bg-white text-black py-8 font-black text-4xl uppercase tracking-tighter transition-all italic shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-white">再来一次 // 快速部署</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetGame();
              setStatus('menu');
            }}
            className="w-full bg-transparent border border-white/20 text-white/50 py-4 font-black text-xl uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all italic backdrop-blur-sm"
          >
            退出至主菜单
          </motion.button>
        </div>

        <div className="mt-12 text-[9px] font-mono text-white/20 uppercase tracking-[0.5em] animate-pulse">
            ERR_BIO_SIGNAL_LOST_404
        </div>
      </motion.div>
    </div>
  );
}
