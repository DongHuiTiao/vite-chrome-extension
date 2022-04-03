export enum CancelType {
	StopBatch = 'stopBatch',
	NextBatch = 'nextBatch',
	StopSingle = 'stopSingle',
}
export interface PromiseConfig {
    promiseFn(): Promise<unknown>;
    done(data?: unknown): void;
    stop(data?: unknown): void;
    controller: AbortController
}

interface promiseFn<T> {
    (): Promise<T>;
}

export interface IRequestQueue {
    queue: PromiseConfig[];
    add(promiseConfig: PromiseConfig): void;
    request<T>(promiseFn: promiseFn<T>, controller: AbortController): Promise<T>;
    requestLoop(): Promise<void>;
    cancelRequest(cancelType: CancelType): void;
}