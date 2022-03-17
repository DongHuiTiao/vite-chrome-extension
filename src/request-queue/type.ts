
export interface PromiseConfig {
    promiseFn(): Promise<unknown>;
    params: Array<unknown>;
    done(data?: unknown): void;
}

interface promiseFn<T> {
    (...params: Array<any>): Promise<T>;
}

export interface IRequestQueue {
    queue: PromiseConfig[];
    add(promiseConfig: PromiseConfig): void;
    reaquest<T>(promiseFn: promiseFn<T>, params: Array<unknown>): Promise<T>;
    requestLoop(): Promise<void>;
}