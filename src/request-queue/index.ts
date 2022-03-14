import { RequestQueue } from './request-queue'
import { IRequestQueue } from './type';

let requestQueue: IRequestQueue = null;
const requestQueueFactory = (): IRequestQueue => {
    if (!requestQueue) {
        requestQueue = new RequestQueue();
    }
    return requestQueue;
}

export default requestQueueFactory;