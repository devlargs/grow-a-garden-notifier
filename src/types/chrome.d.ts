// Chrome Extension API types
declare global {
  const chrome: {
    storage: {
      local: {
        get: (keys: string[], callback: (result: any) => void) => void;
        set: (items: any, callback?: () => void) => void;
      };
    };
    runtime: {
      lastError?: any;
      onMessage?: any;
      sendMessage?: any;
    };
    notifications: {
      create: (options: {
        type: string;
        iconUrl: string;
        title: string;
        message: string;
        priority: number;
      }) => Promise<string>;
    };
  };

  interface Window {
    chrome?: typeof chrome;
  }
}

export {};
