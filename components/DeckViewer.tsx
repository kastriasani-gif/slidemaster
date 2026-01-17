import React, { useState, useEffect, useRef } from 'react';
import { Slide, DesignSystem } from '../types';
import { SlideRenderer } from './SlideRenderer';
import { ChevronLeft, ChevronRight, X, Download, Maximize2, Loader2, FileType, Presentation } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import PptxGenJS from 'pptxgenjs';

interface DeckViewerProps {
  slides: Slide[];
  system: DesignSystem;
  onClose: () => void;
}

export const DeckViewer: React.FC<DeckViewerProps> = ({ slides, system, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const isExporting = isExportingPDF || isExportingPPTX;

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
    setIsExportingPDF(true);

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
        setIsExportingPDF(false);
      }
    }, 2500); 
  };

  const handleExportPPTX = async () => {
    if (isExporting) return;
    setIsExportingPPTX(true);

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
      pptx.title = system.name;

      // Helper to get hex color without #
      const getHex = (color: string) => color.replace('#', '');

      slides.forEach((slide, index) => {
        const isTitle = slide.type === 'title';
        const isSection = slide.type === 'section';
        const isEnd = index === slides.length - 1 && slides.length > 1;
        
        // Determine Master Style
        let master = system.masters.default;
        if (isTitle || isEnd) master = system.masters.title;
        else if (isSection) master = system.masters.section;

        const slideBg = master.background;
        const textColor = master.textColor || '#000000';
        const accentColor = system.colors.accent || '#FF0000';

        const pptxSlide = pptx.addSlide();
        
        // Background
        if (slideBg.startsWith('#')) {
          pptxSlide.background = { color: getHex(slideBg) };
        } else if (master.backgroundImage) {
           // We'll treat gradients or images as solid black for safety if not simple hex, 
           // unless it's a data URL image.
           if (master.backgroundImage.startsWith('data:')) {
              pptxSlide.background = { data: master.backgroundImage };
           } else {
              pptxSlide.background = { color: '000000' };
           }
        } else {
            pptxSlide.background = { color: 'FFFFFF' };
        }

        // Add Logo (if configured)
        if (system.logo.placement !== 'none') {
             const useLightLogo = textColor.toUpperCase() === '#FFFFFF';
             const logoData = useLightLogo ? system.logo.images?.light : system.logo.images?.dark;
             const fallback = useLightLogo ? system.logo.images?.dark : system.logo.images?.light;
             
             const finalLogo = logoData || fallback;
             
             if (finalLogo) {
                 let x = 9, y = 0.5; // Default top right
                 if (system.logo.placement === 'top-left') { x = 0.5; }
                 if (system.logo.placement === 'bottom-right') { y = 5; }
                 if (system.logo.placement === 'bottom-left') { x = 0.5; y = 5; }
                 
                 pptxSlide.addImage({
                     data: finalLogo,
                     x: x,
                     y: y,
                     w: 1.5,
                     h: 0.5,
                     sizing: { type: 'contain', w: 1.5, h: 0.5 }
                 });
             }
        }

        // Content
        if (isTitle) {
            pptxSlide.addText(slide.title, {
                x: 0.5, y: 2, w: '90%', h: 1.5,
                fontSize: 44, color: getHex(textColor), bold: true, fontFace: 'Arial'
            });
            if (slide.subtitle) {
                pptxSlide.addText(slide.subtitle, {
                    x: 0.5, y: 3.5, w: '90%', h: 1,
                    fontSize: 24, color: getHex(textColor), opacity: 0.8, fontFace: 'Arial'
                });
            }
        } else if (isSection) {
            pptxSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.3, w: 1, h: 0.1, fill: { color: getHex(accentColor) } });
            pptxSlide.addText(slide.title, {
                x: 0.5, y: 2.5, w: '90%', h: 1.5,
                fontSize: 36, color: getHex(textColor), bold: true, fontFace: 'Arial'
            });
        } else if (isEnd) {
             pptxSlide.addText("Vielen Dank!", {
                x: 0, y: 2, w: '100%', h: 1.5,
                align: 'center',
                fontSize: 54, color: getHex(textColor), bold: true, fontFace: 'Arial'
            });
        } else if (slide.type === 'bigNumber') {
            pptxSlide.addText(slide.title, {
                x: 0.5, y: 1, w: 4, h: 1,
                fontSize: 28, color: getHex(textColor), bold: true
            });
             pptxSlide.addText(slide.highlight || "100%", {
                x: 5, y: 1.5, w: 4.5, h: 3,
                fontSize: 90, color: getHex(accentColor), bold: true, align: 'right'
            });
            if (slide.content && slide.content.length > 0) {
                 pptxSlide.addText(slide.content.join('\n'), {
                    x: 0.5, y: 2.5, w: 4, h: 3,
                    fontSize: 18, color: getHex(textColor), opacity: 0.8
                });
            }
        } else if (slide.type === 'quote') {
             pptxSlide.addText(`“`, {
                x: 0.5, y: 0.5, w: 2, h: 2,
                fontSize: 120, color: getHex(accentColor), opacity: 0.2
            });
            pptxSlide.addText(slide.highlight || slide.title, {
                x: 1.5, y: 1.5, w: 7, h: 2,
                fontSize: 32, color: getHex(textColor), bold: true, align: 'center', italic: true
            });
            if (slide.subtitle) {
                 pptxSlide.addText(`— ${slide.subtitle}`, {
                    x: 2, y: 3.5, w: 6, h: 0.5,
                    fontSize: 18, color: getHex(textColor), align: 'center'
                });
            }
        } else {
            // Standard Content
            pptxSlide.addText(slide.title, {
                x: 0.5, y: 0.5, w: '90%', h: 0.8,
                fontSize: 32, color: getHex(textColor), bold: true, fontFace: 'Arial'
            });

            // Content Left
            if (slide.content && slide.content.length > 0) {
                 const bulletItems = slide.content.map(c => ({ text: c, options: { fontSize: 16, color: getHex(textColor), breakLine: true } }));
                 pptxSlide.addText(bulletItems, {
                    x: 0.5, y: 1.5, w: 5, h: 3.5,
                    bullet: { type: 'bullet', color: getHex(accentColor) },
                    fontFace: 'Arial'
                });
            }

            // Image Right
            if (slide.imageKeyword) {
                 // pptxgenjs fetches this
                 const imageUrl = `https://picsum.photos/seed/${slide.id}/800/600`; 
                 pptxSlide.addImage({
                     path: imageUrl,
                     x: 6,
                     y: 1.5,
                     w: 3.5,
                     h: 3.5
                 });
            }
        }

        // Add page number
        if (!isTitle && !isEnd) {
             pptxSlide.addText(`${index + 1} / ${slides.length}`, {
                 x: 9, y: 5.2, w: 1, h: 0.3,
                 fontSize: 10, color: getHex(textColor), opacity: 0.5, align: 'right'
             });
        }

      });

      await pptx.writeFile({ fileName: `${system.name.replace(/\s+/g, '_')}_presentation.pptx` });

    } catch (e) {
      console.error("PPTX Generation Error", e);
      alert("Failed to generate PowerPoint file.");
    } finally {
      setIsExportingPPTX(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f4f4f5] flex flex-col animate-in fade-in duration-300">
      
      {/* Hidden Container for PDF Export */}
      {isExportingPDF && (
        <div 
          className="fixed z-[-1] pointer-events-none" 
          style={{ 
            top: 0, 
            left: '-10000px', 
            width: '1920px', 
            height: '1080px',
            overflow: 'hidden' 
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

      {/* Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-[120] bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <Loader2 className="w-12 h-12 animate-spin text-[#e4022b] mb-4" />
          <h2 className="text-xl font-bold">{isExportingPDF ? "Generating PDF..." : "Building PowerPoint..."}</h2>
          <p className="text-zinc-400">
            {isExportingPDF ? "Capturing pixel-perfect slides." : "Creating editable native slides."}
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className={`
        flex items-center justify-between p-4 bg-zinc-900 text-white absolute top-0 left-0 right-0 z-[110] transition-transform duration-300 shadow-xl
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

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-zinc-700 mx-2" />

          {/* Export Group */}
          <div className="flex items-center gap-2">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-700 flex items-center gap-2 disabled:opacity-50 transition-all border border-zinc-700"
                title="Download as PDF"
              >
                <FileType className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <button 
                onClick={handleExportPPTX}
                disabled={isExporting}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]"
                title="Download as PowerPoint"
              >
                <Presentation className="w-4 h-4" />
                <span>PPTX</span>
              </button>
          </div>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 lg:p-16 overflow-hidden">
        <div 
          className="aspect-video w-full max-w-[1600px] shadow-2xl relative bg-white transition-all duration-300"
          style={{ 
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 100px -20px ${system.colors.accent}15`
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