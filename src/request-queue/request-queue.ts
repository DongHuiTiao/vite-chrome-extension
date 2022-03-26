import { IRequestQueue, PromiseConfig } from "./type";
import { sleep } from './../utils/common';
const Delay = 1000

export class RequestQueue implements IRequestQueue {
    queue: PromiseConfig[] = [];
	isRequesting: boolean = false;
    add(promiseConfig: PromiseConfig) {
        this.queue.push(promiseConfig);
        if (!this.isRequesting) {
			this.requestLoop();
		}
    }

	async reaquest<T>(promiseFn): Promise<T> {
		let done = null;

		const lisnter: Promise<T> = new Promise(resolve => {
			done = resolve;
		});

		this.add({
			promiseFn,
			done,
		});

		return lisnter;
	}

    async requestLoop() {
		try {
			if (this.queue.length !== 0) {
				this.isRequesting = true;
				const promiseConfig = this.queue.shift();;
				const { promiseFn, done } = promiseConfig;
				const data = await promiseFn();
				done(data);
				await sleep(Delay);
				this.requestLoop();
			} else {
				this.isRequesting = false;
			}
		} catch (error) {
			console.log(error);
		}
    }
}