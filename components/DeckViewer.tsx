import React, { useState, useEffect, useRef } from 'react';
import { Slide, DesignSystem } from '../types';
import { SlideRenderer } from './SlideRenderer';
import { ChevronLeft, ChevronRight, X, Download, Maximize2, Loader2 } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

interface DeckViewerProps {
  slides: Slide[];
  system: DesignSystem;
  onClose: () => void;
}

export const DeckViewer: React.FC<DeckViewerProps> = ({ slides, system, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExporting) return;
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
  }, [slides.length, onClose, isFullscreen, isExporting]);

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

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    // Allow time for the hidden container to render and images to load
    setTimeout(async () => {
      try {
        if (!exportContainerRef.current) return;

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1920, 1080]
        });

        const slideElements = exportContainerRef.current.children;

        for (let i = 0; i < slideElements.length; i++) {
          const slideEl = slideElements[i] as HTMLElement;
          
          const canvas = await html2canvas(slideEl, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: system.colors.background,
            // Optimization: Clone document to avoid messing with live DOM, but here we use a dedicated offscreen container
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.9);

          if (i > 0) {
            pdf.addPage([1920, 1080], 'landscape');
          }

          pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
        }

        pdf.save(`${system.name.replace(/\s+/g, '_')}_presentation.pdf`);

      } catch (error) {
        console.error("PDF Export failed:", error);
        alert("Could not export PDF. Please check console for errors.");
      } finally {
        setIsExporting(false);
      }
    }, 2500); // Increased timeout slightly to ensure assets load
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      
      {/* Hidden Container for PDF Export */}
      {/* We use fixed positioning off-screen to ensure it renders correctly (display:none or size 0 often fails with html2canvas) */}
      {isExporting && (
        <div 
          className="fixed z-[-1] pointer-events-none" 
          style={{ 
            top: 0, 
            left: '-10000px', 
            width: '1920px', 
            height: '1080px',
            overflow: 'hidden' // Keep it contained
          }}
        >
           <div ref={exportContainerRef}>
             {slides.map((slide, idx) => (
               <div 
                  key={`export-${slide.id}`} 
                  style={{ width: '1920px', height: '1080px', position: 'relative' }}
               >
                 <SlideRenderer 
                   slide={slide} 
                   system={system} 
                   index={idx} 
                   total={slides.length} 
                 />
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Loading Overlay during Export */}
      {isExporting && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <Loader2 className="w-12 h-12 animate-spin text-[#e4022b] mb-4" />
          <h2 className="text-xl font-bold">Generating PDF...</h2>
          <p className="text-zinc-400">Capturing {slides.length} slides. This may take a moment.</p>
        </div>
      )}

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
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 lg:p-16 overflow-hidden">
        <div 
          className="aspect-video w-full max-w-[1600px] shadow-2xl relative bg-white transition-all duration-300"
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
                ${currentIndex === idx ? 'border-[#e4022b] scale-110 z-10' : 'border-transparent opacity-50 hover:opacity-100'}
              `}
              style={{ backgroundColor: system.colors.background }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};