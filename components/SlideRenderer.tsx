import React from 'react';
import { DesignSystem, Slide } from '../types';

interface SlideRendererProps {
  slide: Slide;
  system: DesignSystem;
  index: number;
  total: number;
}

// Simple helper to check if a hex color implies dark text (so light background) or light text (dark background)
// Returns true if the color is "light" (high brightness)
const isColorLight = (hex: string) => {
  const c = hex.substring(1);      // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma > 128;
};

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, system, index, total }) => {
  const { colors, fonts, logo, masters } = system;

  // Determine which master template to use
  const isTitleSlide = slide.type === 'title';
  const isEndSlide = index === total - 1 && total > 1; 
  const isSectionSlide = slide.type === 'section';

  const useTitleMaster = isTitleSlide || isEndSlide;
  const useSectionMaster = isSectionSlide;
  
  // Select appropriate master style
  const masterStyle = useTitleMaster ? masters.title 
                    : useSectionMaster ? (masters.section || masters.title) // Fallback if section undefined in old data
                    : masters.default;

  // CSS variables for the slide context
  const slideStyle: React.CSSProperties = {
    background: masterStyle.backgroundImage
      ? `url(${masterStyle.backgroundImage}) center/cover no-repeat`
      : masterStyle.background,
    color: masterStyle.textColor,
    fontFamily: fonts.body,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    color: masterStyle.textColor, // Headings usually follow text color or primary
  };

  const accentStyle: React.CSSProperties = {
    color: masterStyle.accentColor,
  };

  const secondaryStyle: React.CSSProperties = {
    color: useTitleMaster || useSectionMaster ? masterStyle.textColor : colors.secondary,
    opacity: 0.8,
    fontFamily: fonts.body,
  };

  // Helper to get image URL
  const getImageUrl = (keyword?: string) => {
    return `https://picsum.photos/seed/${slide.id}/1600/900`; 
  };

  // Common Date String
  const dateStr = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
  });

  // Logo Component
  const Logo = () => {
    // Note: Re-enabling logo on title slide based on layout requirement "balance ... top logo area"
    if (logo.placement === 'none') return null;

    const positionClasses = {
      'top-left': 'top-8 left-12',
      'top-right': 'top-8 right-12',
      'bottom-left': 'bottom-8 left-12',
      'bottom-right': 'bottom-8 right-12',
      'top-center': 'top-8 left-1/2 -translate-x-1/2',
    };

    // Decide which logo to use based on text color of the master slide.
    const isTextLight = isColorLight(masterStyle.textColor);
    
    // Prefer the specific image if available
    const logoSrc = isTextLight 
      ? (logo.images?.light || logo.images?.dark) 
      : (logo.images?.dark || logo.images?.light);

    // Override placement for Title/End slides to align with content left margin (6.5%)
    const style: React.CSSProperties = useTitleMaster ? {
        top: '8%',
        left: '6.5%',
        right: 'auto',
        bottom: 'auto',
        transform: 'none'
    } : {};
    
    const className = useTitleMaster 
        ? 'absolute z-20 max-w-[250px] max-h-[100px] flex items-center' // No position classes, handled by style
        : `absolute z-20 ${positionClasses[logo.placement]} max-w-[250px] max-h-[100px] flex items-center`;

    // If we have an image, render it
    if (logoSrc) {
      return (
        <div className={className} style={style}>
           <img 
            src={logoSrc} 
            alt="Brand Logo" 
            className="w-auto h-auto max-h-[80px] max-w-full object-contain select-none"
            style={{ 
               filter: (!logo.images?.light && isTextLight) ? 'brightness(0) invert(1)' : 
                       (!logo.images?.dark && !isTextLight) ? 'brightness(0)' : 'none'
            }}
          />
        </div>
      );
    }

    return null;
  };

  // Footer Component (only for non-title slides usually)
  const Footer = () => {
    // Hide footer on title, end, or section slides
    if (useTitleMaster || useSectionMaster) return null;
    return (
      <div className="absolute bottom-8 left-12 right-12 flex justify-end items-end opacity-50 z-20 pointer-events-none">
        <div className="text-xs font-mono" style={{ color: colors.secondary }}>
          {index + 1} / {total}
        </div>
      </div>
    );
  };

  // Render MP4 Background if available
  const VideoBackground = ({ src }: { src: string }) => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
       <video 
         src={src}
         autoPlay 
         muted 
         loop 
         playsInline
         className="w-full h-full object-cover"
       />
       {/* Use a very subtle gradient at the bottom instead of full overlay to keep video clear */}
       <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );

  const renderContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="h-full w-full relative overflow-hidden z-10">
             <div 
               style={{
                 position: 'absolute',
                 left: '6.5%',
                 top: '52%',
                 width: '48%',
                 textAlign: 'left',
                 fontFamily: 'Arial, sans-serif',
                 color: '#FFFFFF'
               }}
             >
                <h1 
                  style={{
                    fontWeight: 'bold',
                    fontSize: '52px',
                    lineHeight: '1.1',
                    margin: 0,
                    marginBottom: '1rem',
                  }}
                >
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p 
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 'normal',
                      fontSize: '24px',
                      opacity: 0.9,
                      lineHeight: '1.2'
                    }}
                  >
                    {slide.subtitle}
                  </p>
                )}
                
                <div className="mt-12 text-sm font-mono tracking-widest uppercase opacity-60" style={{ color: '#FFFFFF' }}>
                    {dateStr}
                </div>
             </div>
          </div>
        );

      case 'section':
        // Topic slide - Full Screen Layout
        // Background is handled by parent slideStyle (image) or logic below

        return (
          <div className="h-full w-full relative z-10 flex flex-col justify-center px-[6.5%]">
             {/* Dark gradient overlay to ensure text pop on full background images */}
             {masterStyle.backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[-1]" />
             )}

             {/* Constraint width to 50% to safely avoid crossing the vertical line in the background graphic (previously 60%) */}
             <div className="relative" style={{ maxWidth: '50%' }}>
                 <div className="w-16 h-2 mb-8" style={{ backgroundColor: masterStyle.accentColor }} />
                 
                 <h2 style={{
                    fontWeight: 'bold',
                    fontSize: '48px',
                    lineHeight: '1.1',
                    margin: 0,
                    marginBottom: '12px',
                    color: '#FFFFFF' 
                 }}>
                   {slide.title}
                 </h2>

                 {slide.subtitle && (
                   <div style={{
                      fontWeight: 'normal',
                      fontSize: '32px',
                      lineHeight: '1.2',
                      marginBottom: '16px',
                      opacity: 0.9,
                      color: '#FFFFFF'
                   }}>
                     {slide.subtitle}
                   </div>
                 )}

                 {/* Extra content for section if available */}
                 {slide.content && slide.content.length > 0 && (
                    <div style={{ fontSize: '24px', opacity: 0.8, marginTop: '24px', color: '#FFFFFF' }}>
                       {slide.content[0]}
                    </div>
                 )}

                 <div className="mt-12 text-sm font-mono tracking-widest uppercase opacity-60" style={{ color: '#FFFFFF' }}>
                    {dateStr}
                 </div>
             </div>
          </div>
        );

      case 'splitLeft':
        return (
          <div className="h-full flex z-10 relative">
            <div className="w-1/2 h-full relative overflow-hidden">
               <img 
                 src={getImageUrl(slide.imageKeyword)} 
                 alt="Slide visual" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/10" /> 
            </div>
            <div className="w-1/2 h-full flex flex-col justify-center px-16 py-12">
               <h2 className="text-4xl font-bold mb-8" style={headingStyle}>
                 {slide.title}
               </h2>
               <div className="space-y-4">
                 {slide.content?.map((point, i) => (
                   <div key={i} className="flex gap-4">
                      <span className="text-xl font-bold mt-1" style={accentStyle}>•</span>
                      <p className="text-lg leading-relaxed opacity-90">{point}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );
        
      case 'splitRight':
        return (
          <div className="h-full flex flex-row-reverse z-10 relative">
            <div className="w-1/2 h-full relative overflow-hidden">
               <img 
                 src={getImageUrl(slide.imageKeyword)} 
                 alt="Slide visual" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
            </div>
            <div className="w-1/2 h-full flex flex-col justify-center px-16 py-12">
               <div className="w-16 h-1 mb-8" style={{ backgroundColor: masterStyle.accentColor }} />
               <h2 className="text-4xl font-bold mb-8" style={headingStyle}>
                 {slide.title}
               </h2>
               <div className="space-y-6">
                 {slide.content?.map((point, i) => (
                   <p key={i} className="text-lg leading-relaxed opacity-90 border-l-2 pl-6" style={{ borderColor: `${colors.secondary}40` }}>
                     {point}
                   </p>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="h-full flex flex-col justify-center items-center px-32 text-center relative z-10">
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(circle at center, ${colors.primary} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
            />
            <div className="text-9xl opacity-20 font-serif absolute top-24 left-24" style={accentStyle}>“</div>
            
            <blockquote className="relative z-10">
              <p className="text-5xl font-bold leading-tight mb-12" style={headingStyle}>
                {slide.highlight || slide.title}
              </p>
              {slide.subtitle && (
                <cite className="text-xl not-italic font-medium tracking-wide uppercase" style={secondaryStyle}>
                  — {slide.subtitle}
                </cite>
              )}
            </blockquote>
          </div>
        );

      case 'bigNumber':
        return (
          <div className="h-full flex items-center justify-between px-24 z-10 relative">
            <div className="max-w-xl">
               <h2 className="text-4xl font-bold mb-6" style={headingStyle}>
                 {slide.title}
               </h2>
               <div className="space-y-4 text-lg opacity-80">
                 {slide.content?.map((c, i) => <p key={i}>{c}</p>)}
               </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
               <div className="relative">
                  <div className="text-[12rem] font-bold leading-none tracking-tighter" style={accentStyle}>
                    {slide.highlight || "100%"}
                  </div>
                  {slide.subtitle && (
                    <div className="text-xl font-bold text-center mt-2 uppercase tracking-widest" style={secondaryStyle}>
                       {slide.subtitle}
                    </div>
                  )}
               </div>
            </div>
          </div>
        );

      case 'content':
      default:
        // Use generic layout for content, but if it's the end slide, match Title slide alignment exactly
        if (isEndSlide) {
            return (
                <div className="h-full w-full relative overflow-hidden z-10">
                   <div 
                     style={{
                       position: 'absolute',
                       left: '6.5%',
                       top: '52%',
                       // No transform translateY to match title slide text start position
                       width: '50%',
                       textAlign: 'left',
                       color: '#FFFFFF'
                     }}
                   >
                     <h2 
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: 'bold',
                          fontSize: '52px',
                          lineHeight: '1.1',
                          margin: 0,
                          marginBottom: '1rem',
                          color: '#FFFFFF'
                        }}
                     >
                       {slide.title}
                     </h2>
                     <div className="text-xl opacity-90 leading-relaxed" style={{ color: masterStyle.textColor }}>
                        {slide.content?.map((point, i) => <p key={i} className="mb-2">{point}</p>)}
                     </div>
                   </div>
                </div>
            );
        }

        return (
          <div className="h-full flex flex-col px-16 py-12 z-10 relative">
            <header className="mb-12 border-b pb-6" style={{ borderColor: `${colors.secondary}40` }}>
              <h2 className="text-4xl font-bold" style={headingStyle}>
                {slide.title}
              </h2>
            </header>
            <div className="flex-1 grid grid-cols-12 gap-12">
               <div className="col-span-7 space-y-6">
                 {slide.content?.map((point, i) => (
                   <div key={i} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: masterStyle.accentColor }} />
                      <p className="text-xl leading-relaxed opacity-90">{point}</p>
                   </div>
                 ))}
               </div>
               {slide.imageKeyword && (
                  <div className="col-span-5 h-full relative rounded-2xl overflow-hidden shadow-2xl">
                     <img 
                       src={getImageUrl(slide.imageKeyword)} 
                       className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                       alt="decorative"
                     />
                  </div>
               )}
            </div>
          </div>
        );
    }
  };

  // Only render background animation if using title master (Title/End slides)
  // Ensure we render the video background if it exists in the master style
  const showVideoBackground = useTitleMaster && masterStyle.backgroundVideo;

  return (
    <div className="w-full h-full relative overflow-hidden transition-colors duration-500" style={slideStyle}>
      <Logo />
      {showVideoBackground && <VideoBackground src={masterStyle.backgroundVideo!} />}
      {renderContent()}
      <Footer />
    </div>
  );
};