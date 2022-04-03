import { IRequestQueue, PromiseConfig, CancelType } from "./type";
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

	async request<T>(promiseFn, controller): Promise<T> {
		let done = null;
		let stop = null;
		const lisnter: Promise<T> = new Promise((resolve, reject) => {
			done = resolve;
			stop = reject
		});

		this.add({
			promiseFn,
			done,
			stop,
			controller,
		});

		return lisnter;
	}

	cancelRequest(cancelType: CancelType) {
		if (!this.isRequesting) {
			return;
		}

		const currentPromise = this.queue[0];
		const { controller, stop } = currentPromise;

		controller.abort();
		stop(cancelType);

		this.queue.shift();
	}

    async requestLoop() {
		try {
			if (this.queue.length !== 0) {
				this.isRequesting = true;
				const promiseConfig = this.queue[0];
				const { promiseFn, done } = promiseConfig;
				const data = await promiseFn();
				done(data);
				this.queue.shift();
				await sleep(Delay);
				this.requestLoop();
			} else {
				this.isRequesting = false;
			}
		} catch (error) {
			console.log(error, '<<<<<<<<<<<<');
		}
    }
}