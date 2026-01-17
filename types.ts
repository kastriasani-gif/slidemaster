export interface LogoSpecs {
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'none';
  style: 'dark' | 'light' | 'color';
  images?: {
    light?: string; // White/Light version for dark backgrounds
    dark?: string;  // Black/Dark version for light backgrounds
  };
}

export interface MasterSlideStyle {
  background: string; // CSS background property (hex, gradient, etc.)
  backgroundImage?: string; // Base64 image data for custom background graphic
  backgroundVideo?: string; // Base64 video data or URL for animated background
  textColor: string;
  accentColor: string;
  ornament?: string; // Description of decorative element
}

export interface DesignSystem {
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: LogoSpecs;
  masters: {
    title: MasterSlideStyle;
    section: MasterSlideStyle; // New master for topic dividers
    default: MasterSlideStyle;
  };
  vibe: string;
}

export interface Slide {
  id: string;
  type: 'title' | 'section' | 'content' | 'splitLeft' | 'splitRight' | 'quote' | 'bigNumber';
  title: string;
  subtitle?: string;
  content?: string[]; // Bullet points or paragraphs
  imageKeyword?: string; // For searching unsplash placeholder
  highlight?: string; // For quotes or big numbers
}

export interface PresentationData {
  topic: string;
  slides: Slide[];
}

export type AppState = 
  | 'upload' 
  | 'analyzing' 
  | 'review' 
  | 'generating' 
  | 'presentation';