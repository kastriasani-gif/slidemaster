import React, { useMemo } from 'react';
import { DesignSystem, Slide, MasterSlideStyle } from '../types';

interface SlideRendererProps {
  slide: Slide;
  system: DesignSystem;
  index: number;
  total: number;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, system, index, total }) => {
  const { colors, fonts, logo, masters } = system;

  const isTitleSlide = slide.type === 'title';
  const isEndSlide = index === total - 1 && total > 1;
  const isSectionSlide = slide.type === 'section';

  const masterStyle = useMemo(() => {
    if (isTitleSlide || isEndSlide) return masters.title;
    if (isSectionSlide) return masters.section || masters.title;
    return masters.default;
  }, [isTitleSlide, isEndSlide, isSectionSlide, masters]);

  // If a background image exists, we assume we need white text + shadow for contrast.
  // Otherwise, we strictly use the configured text color from the master slide style.
  const hasBackgroundImage = !!masterStyle.backgroundImage || !!masterStyle.backgroundVideo;
  
  const contentColor = hasBackgroundImage ? '#FFFFFF' : (masterStyle.textColor || '#000000');
  const textShadow = hasBackgroundImage ? '0 2px 4px rgba(0,0,0,0.6)' : 'none';

  const dateStr = useMemo(() => new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }), []);

  const getImageUrl = (keyword?: string) => `https://picsum.photos/seed/${slide.id}/1600/900`;

  const Logo = () => {
    if (logo.placement === 'none') return null;
    
    // Determine which logo to use based on the effective background brightness.
    // This is a simplified check: if text is white, we assume bg is dark -> use light logo.
    const useLightLogo = contentColor.toUpperCase() === '#FFFFFF';
    
    // Try to find the specific logo asset for the context
    const specificLogo = useLightLogo ? logo.images?.light : logo.images?.dark;
    const fallbackLogo = useLightLogo ? logo.images?.dark : logo.images?.light;
    const logoSrc = specificLogo || fallbackLogo;
      
    if (!logoSrc) return null;

    const positionClasses = {
      'top-left': 'top-8 left-12',
      'top-right': 'top-8 right-12',
      'bottom-left': 'bottom-8 left-12',
      'bottom-right': 'bottom-8 right-12',
      'top-center': 'top-8 left-1/2 -translate-x-1/2',
    };

    let positionClass = positionClasses[logo.placement];
    
    // Override positions for specific slide types
    if (isTitleSlide) positionClass = "top-[6%] left-[6.5%]";
    if (isEndSlide) positionClass = "bottom-12 left-12";

    // New Rule: Content slides (White/Light Background) -> Bottom Left
    const isContentSlide = !isTitleSlide && !isSectionSlide && !isEndSlide;
    const isLightBackground = !useLightLogo;

    if (isContentSlide && isLightBackground) {
      positionClass = "bottom-8 left-12";
    }

    const finalClassName = `absolute ${positionClass} z-20`;

    // Determine filter
    // If we are on a dark background (useLightLogo is true):
    // - If we have a specific 'light' logo, we assume it's colored correctly (e.g. White Text + Red Accent), so NO FILTER.
    // - If we are falling back to the 'dark' logo, we must INVERT it to make it visible.
    // If we are on a light background (useLightLogo is false):
    // - We typically want original colors (Red/Black), so NO FILTER.
    let filter = 'none';
    if (useLightLogo) {
      if (!specificLogo && fallbackLogo) {
         // Fallback scenario: Dark logo on dark background -> make it white
         // We use brightness(0) invert(1) to make it pure white.
         filter = 'brightness(0) invert(1)';
      }
      // If specificLogo exists, we trust it has correct colors (White+Red), so filter remains 'none'.
    } else {
      // Light background: Show logo as is (Red/Black)
      filter = 'none';
    }

    return (
      <div className={`${finalClassName} max-w-[200px] max-h-[80px] flex items-center`}>
        <img 
          src={logoSrc} 
          alt="Logo" 
          className="w-auto h-auto max-h-[60px] object-contain"
          style={{ filter }}
        />
      </div>
    );
  };

  const renderContent = () => {
    const textStyle = { color: contentColor, textShadow };
    const headingStyle = { ...textStyle, fontFamily: fonts.heading };

    // Custom layout for End Slide
    if (isEndSlide) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center z-10 relative">
          <h1 className="text-8xl font-bold mb-6 tracking-tight" style={headingStyle}>Vielen Dank!</h1>
          <p className="text-3xl opacity-50 font-medium tracking-wide" style={textStyle}>Ihr hurra.com™ Team</p>
        </div>
      );
    }

    switch (slide.type) {
      case 'title':
        return (
          <div className="h-full w-full relative z-10 flex flex-col justify-end pb-[15%] px-[6.5%]">
            <div className="max-w-[60%]">
              <h1 className="text-6xl font-bold leading-tight mb-4" style={headingStyle}>{slide.title}</h1>
              {slide.subtitle && <p className="text-2xl opacity-80 mb-8" style={textStyle}>{slide.subtitle}</p>}
              <div className="text-sm font-mono tracking-widest uppercase opacity-50" style={textStyle}>{dateStr}</div>
            </div>
          </div>
        );

      case 'section':
        return (
          <div className="h-full w-full relative z-10 flex flex-col justify-center px-[6.5%]">
            <div className="w-16 h-2 mb-8" style={{ backgroundColor: masterStyle.accentColor, boxShadow: textShadow }} />
            <h2 className="text-5xl font-bold mb-4" style={{ ...headingStyle, maxWidth: '50%' }}>{slide.title}</h2>
            {slide.subtitle && <p className="text-3xl opacity-80" style={textStyle}>{slide.subtitle}</p>}
          </div>
        );

      case 'quote':
        return (
          <div className="h-full flex flex-col justify-center items-center px-32 text-center relative z-10">
            <span className="text-9xl opacity-10 absolute top-24 left-24" style={{ color: masterStyle.accentColor }}>“</span>
            <blockquote className="relative">
              <p className="text-5xl font-bold leading-tight mb-8" style={headingStyle}>{slide.highlight || slide.title}</p>
              {slide.subtitle && <cite className="text-xl not-italic opacity-60" style={textStyle}>— {slide.subtitle}</cite>}
            </blockquote>
          </div>
        );

      case 'bigNumber':
        return (
          <div className="h-full flex items-center justify-between px-24 z-10 relative">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-6" style={headingStyle}>{slide.title}</h2>
              <div className="space-y-4 opacity-70" style={textStyle}>{slide.content?.map((c, i) => <p key={i}>{c}</p>)}</div>
            </div>
            <div className="text-[12rem] font-bold" style={{ color: masterStyle.accentColor, textShadow }}>{slide.highlight || "100%"}</div>
          </div>
        );

      case 'content':
      default:
        return (
          <div className="h-full flex flex-col px-16 py-12 z-10 relative">
            <header className="mb-12 border-b pb-6" style={{ borderColor: `${contentColor}20` }}>
              <h2 className="text-4xl font-bold" style={headingStyle}>{slide.title}</h2>
            </header>
            <div className="flex-1 grid grid-cols-12 gap-12">
              <div className="col-span-7 space-y-6">
                {slide.content?.map((p, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: masterStyle.accentColor, boxShadow: textShadow }} />
                    <p className="text-xl leading-relaxed opacity-80" style={textStyle}>{p}</p>
                  </div>
                ))}
              </div>
              {slide.imageKeyword && (
                <div className="col-span-5 h-full relative rounded-2xl overflow-hidden shadow-2xl">
                  <img src={getImageUrl(slide.imageKeyword)} className="absolute inset-0 w-full h-full object-cover" alt="visual" />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden transition-colors duration-500" 
      style={{ 
        background: masterStyle.backgroundImage ? `url(${masterStyle.backgroundImage}) center/cover no-repeat` : masterStyle.background, 
        fontFamily: fonts.body 
      }}
    >
      {/* Background Video - Force for Start/End slides to match request */}
      {/* Set z-index to 1 to ensure it sits above the container background but below content (z-10) */}
      {masterStyle.backgroundVideo && (
        <video 
          key={masterStyle.backgroundVideo}
          src={masterStyle.backgroundVideo} 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-[1]" 
        />
      )}
      
      {/* Overlay for contrast on static images only - Do NOT overlay video */}
      {/* Ensure overlay has z-index lower than content but above background. z-1 is same as video, but DOM order matters if both present (shouldn't be). */}
      {masterStyle.backgroundImage && !masterStyle.backgroundVideo && (
        <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none" />
      )}

      <Logo />
      {renderContent()}

      {!isTitleSlide && !isSectionSlide && !isEndSlide && (
        <div className="absolute bottom-8 right-12 text-xs opacity-40" style={{ color: contentColor }}>{index + 1} / {total}</div>
      )}
    </div>
  );
};