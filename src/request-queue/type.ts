
export interface PromiseConfig {
    promise(): Promise<unknown>;
    done(data?: unknown): void;
}

export interface IRequestQueue {
    queue: PromiseConfig[];
    add(promiseConfig: PromiseConfig): void;
    getNextPromise(): Promise<void>;
}