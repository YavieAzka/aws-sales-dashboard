// src/types/window.d.ts
export {};

declare global {
  interface Window {
    FinisherHeader: new (config: object) => void;
  }
}
