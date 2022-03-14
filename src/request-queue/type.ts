
export interface PromiseConfig {
    getPromise(): Promise<unknown>;
    done(data?: unknown): void;
}

export interface GetPromise<T> {
    (): Promise<T>
}

export interface IRequestQueue {
    queue: PromiseConfig[];
    add(promiseConfig: PromiseConfig): void;
    reaquest<T>(promise: GetPromise<T>): Promise<T>;
    getNextPromise(): Promise<void>;
}