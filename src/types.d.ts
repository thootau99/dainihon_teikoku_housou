export declare module "*";

export declare function config(tiktokSessionId: string, customBaseUrl?: string): void;

export declare function createAudioFromText(text: string, path: string, speaker?: string): Promise<void>;

export declare function getConfig(): {
    tiktokSessionId?: string;
    customBaseUrl?: string;
};

export declare const validSpeakers: string[];
