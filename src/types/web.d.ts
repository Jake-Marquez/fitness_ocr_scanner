// Type declarations for web-specific APIs

interface HTMLVideoElement extends HTMLMediaElement {
  srcObject: MediaStream | null;
  videoWidth: number;
  videoHeight: number;
}

interface MediaDevices {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

interface Navigator {
  mediaDevices: MediaDevices;
}

declare global {
  interface Window {
    navigator: Navigator;
  }
}

export {};
