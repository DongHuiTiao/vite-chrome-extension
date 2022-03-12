import { RequestQueue } from './request-queue'

let requestQueue = null;
const requestQueueFactory = () => {
    if (!requestQueue) {
        requestQueue = new RequestQueue();
    }
    return requestQueue;
}

export default requestQueueFactory;