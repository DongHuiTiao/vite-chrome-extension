
export interface PromiseConfig {
    promiseFn(): Promise<unknown>;
    done(data?: unknown): void;
}

interface promiseFn<T> {
    (): Promise<T>;
}

export interface IRequestQueue {
    queue: PromiseConfig[];
    add(promiseConfig: PromiseConfig): void;
    reaquest<T>(promiseFn: promiseFn<T>): Promise<T>;
    requestLoop(): Promise<void>;
}