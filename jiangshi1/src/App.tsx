import { useStore } from './hooks/useStore';
import { GameScene } from './components/GameScene';
import { HUD } from './components/HUD';
import { StartMenu, GameOverMenu } from './components/Menus';
import { Suspense } from 'react';

export default function App() {
  const { status } = useStore();

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative">
      {/* 3D Scene always in background */}
      <GameScene />

      {/* Menus */}
      {status === 'menu' && <StartMenu />}
      {status === 'gameover' && <GameOverMenu />}
      
      {/* HUD only when playing */}
      {status === 'playing' && <HUD />}
    </div>
  );
}
