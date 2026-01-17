import React, { useState, useEffect } from 'react';
import { Slide, DesignSystem } from '../types';
import { SlideRenderer } from './SlideRenderer';
import { ChevronLeft, ChevronRight, X, Download, Maximize2 } from 'lucide-react';

interface DeckViewerProps {
  slides: Slide[];
  system: DesignSystem;
  onClose: () => void;
}

export const DeckViewer: React.FC<DeckViewerProps> = ({ slides, system, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className={`
        flex items-center justify-between p-4 bg-zinc-900/50 backdrop-blur text-white absolute top-0 left-0 right-0 z-50 transition-transform duration-300
        ${isFullscreen ? '-translate-y-full hover:translate-y-0' : 'translate-y-0'}
      `}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          <span className="font-mono text-sm opacity-50">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
        
        <h1 className="text-sm font-medium tracking-wide uppercase opacity-75 hidden md:block">
          {system.name}
        </h1>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 lg:p-16 overflow-hidden">
        <div 
          className="aspect-video w-full max-w-[1600px] shadow-2xl relative bg-white"
          style={{ 
            boxShadow: `0 0 100px -20px ${system.colors.accent}40`
          }}
        >
          <SlideRenderer 
            slide={slides[currentIndex]} 
            system={system}
            index={currentIndex}
            total={slides.length}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center p-4">
        <button 
          onClick={() => setCurrentIndex(p => Math.max(p - 1, 0))}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur disabled:opacity-0 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center p-4">
        <button 
          onClick={() => setCurrentIndex(p => Math.min(p + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur disabled:opacity-0 transition-all hover:scale-110"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Filmstrip Thumbnails */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-2 transition-transform duration-300
        ${isFullscreen ? 'translate-y-full hover:translate-y-0' : 'translate-y-0'}
      `}>
        <div className="flex gap-2 p-2 bg-black/60 backdrop-blur rounded-2xl overflow-x-auto max-w-full">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-16 h-10 rounded border-2 transition-all flex-shrink-0
                ${currentIndex === idx ? 'border-indigo-500 scale-110 z-10' : 'border-transparent opacity-50 hover:opacity-100'}
              `}
              style={{ backgroundColor: system.colors.background }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
