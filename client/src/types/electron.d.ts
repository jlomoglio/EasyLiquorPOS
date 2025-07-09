// src/types/electron.d.ts
export interface ElectronAPI {
    printReceipt: (receiptURL: string) => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

export {};