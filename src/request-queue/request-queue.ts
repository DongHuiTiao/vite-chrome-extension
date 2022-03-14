import { GetPromise, IRequestQueue, PromiseConfig } from "./type";
import { sleep } from './../utils/common';
const Delay = 667

export class RequestQueue implements IRequestQueue {
    queue: PromiseConfig[] = [];

    add(promiseConfig: PromiseConfig) {
        this.queue.push(promiseConfig);
        if (this.queue.length === 1) {
			this.getNextPromise();
		}
    }

	async reaquest<T>(getPromise: GetPromise<T>): Promise<T> {
		let done = null;

		const lisnter: Promise<T> = new Promise(resolve => {
			done = resolve;
		});

		this.add({
			getPromise,
			done,
		});

		return lisnter;
	}

    async getNextPromise() {
        const promiseConfig = this.queue[0];
		const { getPromise, done } = promiseConfig;
		try {
			const data = await getPromise();
			done(data);

			this.queue.shift();

			if (this.queue.length === 0) {
				return;
			}

			await sleep(Delay);

			await this.getNextPromise();
		} catch (error) {
			console.log(error);
		}
    }
}