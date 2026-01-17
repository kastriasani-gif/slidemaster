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

  // Hard Layout Constants
  const LEFT_START = '6.5%';
  const MAX_WIDTH = '45%';
  const FONT_ARIAL = 'Arial, sans-serif'; // Enforced font stack

  // Base Slide Style
  const slideStyle: React.CSSProperties = {
    background: masterStyle.backgroundImage
      ? `url(${masterStyle.backgroundImage}) center/cover no-repeat`
      : masterStyle.background,
    color: '#FFFFFF', // Enforced white text for contrast per rules
    fontFamily: FONT_ARIAL,
  };

  // Strict Content Container Style
  const contentContainerStyle: React.CSSProperties = {
    position: 'absolute',
    left: LEFT_START,
    width: MAX_WIDTH,
    maxWidth: MAX_WIDTH,
    zIndex: 10,
    textAlign: 'left',
    color: '#FFFFFF',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    display: 'flex',
    flexDirection: 'column',
  };

  const accentStyle: React.CSSProperties = {
    color: masterStyle.accentColor,
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
    if (logo.placement === 'none') return null;

    // Use specific images if available, otherwise fallback
    const logoSrc = logo.images?.light || logo.images?.dark;

    // Fixed placement logic as per visual requirements (Top Left usually to balance content)
    // Logo never moves, never overlaps text (text container is constrained to 45% width, top 52% or centered)
    // Assuming standard logo placement is Top Left for this design system based on previous iterations
    
    if (logoSrc) {
      return (
        <div style={{
            position: 'absolute',
            top: '8%',
            left: '6.5%', // Aligned with content container
            zIndex: 20,
            maxWidth: '250px',
            maxHeight: '100px',
            display: 'flex',
            alignItems: 'center'
        }}>
           <img 
            src={logoSrc} 
            alt="Brand Logo" 
            className="w-auto h-auto max-h-[80px] max-w-full object-contain select-none"
            style={{ 
               // Ensure logo is visible on dark backgrounds (enforce white/light mode if needed)
               filter: 'brightness(0) invert(1)' // Assuming dark background + white logo requirement
            }}
          />
        </div>
      );
    }
    return null;
  };

  // Footer Component
  const Footer = () => {
    if (useTitleMaster || useSectionMaster) return null;
    return (
      <div className="absolute bottom-8 right-12 flex justify-end items-end opacity-50 z-20 pointer-events-none">
        <div className="text-xs font-mono text-white">
          {index + 1} / {total}
        </div>
      </div>
    );
  };

  // Video Background
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
       <div className="absolute inset-0 bg-black/40" /> {/* Enforced contrast overlay */}
    </div>
  );

  const renderContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="h-full w-full relative z-10">
             <div style={{
                 ...contentContainerStyle,
                 top: '52%', // Vertically positioned slightly below canvas center
             }}>
                <h1 style={{
                    fontFamily: FONT_ARIAL,
                    fontWeight: 'bold',
                    fontSize: '52px',
                    lineHeight: '1.1',
                    marginBottom: '1rem',
                    color: '#FFFFFF'
                }}>
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p style={{
                      fontFamily: FONT_ARIAL,
                      fontWeight: 'normal',
                      fontSize: '24px', // Secondary text size
                      lineHeight: '1.2',
                      marginBottom: '1rem',
                      opacity: 0.9,
                      color: '#FFFFFF'
                  }}>
                    {slide.subtitle}
                  </p>
                )}
                
                <div style={{
                    marginTop: '2rem',
                    fontFamily: FONT_ARIAL,
                    fontSize: '18px',
                    color: '#FFFFFF',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {dateStr}
                </div>
             </div>
          </div>
        );

      case 'section':
        return (
          <div className="h-full w-full relative z-10">
             {/* Dark gradient overlay enforced for contrast */}
             {masterStyle.backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-[-1]" />
             )}

             <div style={{
                 ...contentContainerStyle,
                 top: '50%',
                 transform: 'translateY(-50%)',
             }}>
                 <div className="w-16 h-2 mb-8" style={{ backgroundColor: masterStyle.accentColor }} />
                 
                 {/* First Title */}
                 <h2 style={{
                    fontFamily: FONT_ARIAL,
                    fontWeight: 'bold',
                    fontSize: '40px',
                    lineHeight: '1.2',
                    margin: 0,
                    marginBottom: '16px',
                    color: '#FFFFFF' 
                 }}>
                   {slide.title}
                 </h2>

                 {/* Second Title */}
                 {slide.subtitle && (
                   <div style={{
                      fontFamily: FONT_ARIAL,
                      fontWeight: 'normal',
                      fontSize: '40px',
                      lineHeight: '1.2',
                      marginBottom: '16px',
                      color: '#FFFFFF'
                   }}>
                     {slide.subtitle}
                   </div>
                 )}

                 {/* Third Title (Content) */}
                 {slide.content && slide.content.length > 0 && (
                    <div style={{ 
                        fontFamily: FONT_ARIAL,
                        fontWeight: 'normal',
                        fontSize: '40px',
                        lineHeight: '1.2',
                        marginBottom: '16px',
                        color: '#FFFFFF'
                    }}>
                       {slide.content[0]}
                    </div>
                 )}

                 {/* Date Line */}
                 <div style={{
                     marginTop: '48px', // Increased spacing
                     fontFamily: FONT_ARIAL,
                     fontWeight: 'normal',
                     fontSize: '21px',
                     color: '#FFFFFF'
                 }}>
                    {dateStr}
                 </div>
             </div>
          </div>
        );

      // Handle all other types by forcing them into the left container rules
      // to avoid silent layout degradation and enforce consistency.
      case 'content':
      case 'splitLeft':
      case 'splitRight':
      case 'quote':
      case 'bigNumber':
      default:
        // Treat End slide like Title slide
        if (isEndSlide) {
            return (
                <div className="h-full w-full relative z-10">
                   <div style={{
                       ...contentContainerStyle,
                       top: '52%',
                   }}>
                     <h2 style={{
                          fontFamily: FONT_ARIAL,
                          fontWeight: 'bold',
                          fontSize: '52px',
                          lineHeight: '1.1',
                          marginBottom: '1rem',
                          color: '#FFFFFF'
                        }}
                     >
                       {slide.title}
                     </h2>
                     {slide.content && slide.content.map((point, i) => (
                        <p key={i} style={{
                            fontFamily: FONT_ARIAL,
                            fontSize: '24px',
                            lineHeight: '1.2',
                            marginBottom: '0.5rem',
                            color: '#FFFFFF',
                            opacity: 0.9
                        }}>{point}</p>
                     ))}
                   </div>
                </div>
            );
        }

        // Standard Layout enforcing Left Container
        return (
          <div className="h-full w-full relative z-10">
             {/* Always ensure contrast */}
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[-1]" />

             <div style={{
                 ...contentContainerStyle,
                 top: '15%',
                 height: '80%',
                 justifyContent: 'flex-start'
             }}>
                <header style={{ marginBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '24px' }}>
                  <h2 style={{
                      fontFamily: FONT_ARIAL,
                      fontWeight: 'bold',
                      fontSize: '40px',
                      lineHeight: '1.1',
                      color: '#FFFFFF'
                  }}>
                    {slide.title}
                  </h2>
                </header>
                
                <div className="space-y-6">
                   {slide.content?.map((point, i) => (
                     <div key={i} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: masterStyle.accentColor }} />
                        <p style={{
                            fontFamily: FONT_ARIAL,
                            fontSize: '24px',
                            lineHeight: '1.4',
                            opacity: 0.9,
                            color: '#FFFFFF'
                        }}>{point}</p>
                     </div>
                   ))}
                   
                   {/* Handle Big Number / Quote content if mapped here */}
                   {slide.highlight && (
                       <div style={{ fontSize: '96px', fontWeight: 'bold', color: masterStyle.accentColor, lineHeight: 1 }}>
                           {slide.highlight}
                       </div>
                   )}
                </div>
             </div>

             {/* Images are decorative and go to the right, never overlapping left container */}
             {slide.imageKeyword && (
                  <div style={{
                      position: 'absolute',
                      right: '0',
                      top: '0',
                      bottom: '0',
                      width: '45%', // Keep clear of the 49% boundary
                      overflow: 'hidden',
                      zIndex: 0
                  }}>
                     <img 
                       src={getImageUrl(slide.imageKeyword)} 
                       className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" 
                       alt="decorative"
                     />
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
                  </div>
             )}
          </div>
        );
    }
  };

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