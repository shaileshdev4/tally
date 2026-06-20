interface Pendo {
  trackAgent: (eventType: string, metadata: object) => void;
  [key: string]: any;
}

declare var pendo: Pendo | undefined;
