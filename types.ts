export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  timestamp: number;
  vibeCaption: string;
}

export interface SiteConfig {
  logoUrl?: string;
}