/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_STABILITY_API_KEY: string
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_PERPLEXITY_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ga?: any;
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}