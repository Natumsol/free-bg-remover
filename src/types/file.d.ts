// Electron extends File interface with path property
declare global {
  interface File {
    path?: string;
  }
}

export {};
