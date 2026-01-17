export interface LogoSpecs {
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'none';
  style: 'dark' | 'light' | 'color';
  images?: {
    light?: string; // White/Light version for dark backgrounds
    dark?: string;  // Black/Dark version for light backgrounds
  };
  maxHeight?: number; // Max logo height in pixels (default: 60)
}

export interface MasterSlideStyle {
  background: string; // CSS background property (hex, gradient, etc.)
  backgroundImage?: string; // Base64 image data for custom background graphic
  backgroundVideo?: string; // Base64 video data or URL for animated background
  textColor: string;
  accentColor: string;
  ornament?: string; // Description of decorative element
}

export interface PresentationSettings {
  showPageNumbers?: boolean; // Show page numbers on slides (default: true)
  dateFormat?: 'en-GB' | 'en-US' | 'de-DE'; // Date format locale (default: 'en-GB')
  endSlide?: {
    title?: string; // Custom end slide title (default: "Thank You!")
    subtitle?: string; // Custom end slide subtitle (default: "")
  };
  language?: 'en' | 'de'; // Interface language (default: 'en')
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
    section: MasterSlideStyle;
    default: MasterSlideStyle;
  };
  vibe: string;
  settings?: PresentationSettings; // Optional presentation settings
}

export interface Slide {
  id: string;
  type: 'title' | 'section' | 'content' | 'splitLeft' | 'splitRight' | 'quote' | 'bigNumber';
  title: string;
  subtitle?: string;
  content?: string[];
  imageKeyword?: string;
  highlight?: string;
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

// UI Text Configuration (for internationalization)
export interface UIText {
  errors: {
    generationFailed: string;
    analysisFailed: string;
    noSlides: string;
  };
  buttons: {
    generate: string;
    generating: string;
    exportPDF: string;
    close: string;
  };
  labels: {
    configure: string;
    result: string;
    presentationTopic: string;
    darkLogo: string;
    lightLogo: string;
    uploadVideo: string;
  };
}

export const UI_TEXT_EN: UIText = {
  errors: {
    generationFailed: "Generation failed. Please try again.",
    analysisFailed: "Design analysis failed.",
    noSlides: "No slides generated."
  },
  buttons: {
    generate: "Generate Presentation",
    generating: "Generating Slides...",
    exportPDF: "Export PDF",
    close: "Close"
  },
  labels: {
    configure: "Configure",
    result: "Result",
    presentationTopic: "Presentation Topic",
    darkLogo: "Dark Logo (For Light BG)",
    lightLogo: "Light Logo (For Dark BG)",
    uploadVideo: "Upload Background Video (MP4/WebM)"
  }
};

export const UI_TEXT_DE: UIText = {
  errors: {
    generationFailed: "Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    analysisFailed: "Design-Analyse fehlgeschlagen.",
    noSlides: "Keine Slides generiert."
  },
  buttons: {
    generate: "Präsentation generieren",
    generating: "Slides werden generiert...",
    exportPDF: "PDF exportieren",
    close: "Schließen"
  },
  labels: {
    configure: "Konfigurieren",
    result: "Ergebnis",
    presentationTopic: "Präsentationsthema",
    darkLogo: "Dunkles Logo (Für hellen Hintergrund)",
    lightLogo: "Helles Logo (Für dunklen Hintergrund)",
    uploadVideo: "Hintergrundvideo hochladen (MP4/WebM)"
  }
};