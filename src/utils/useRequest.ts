import { sleep } from "./common";

// interface UseQequest {
//     addRequstHandle: (requstHandle: () => Promise<any>) => void
// }
// 初始化跟请求相关的操作
const initRequest = () => {
    // 队列
    const queue: Array<() => Promise<any>> =[];
    // 是否正在处理队列中的请求
    const isHandling = false;
    // 把请求推进队列的方法
    const addRequstHandle = (requstHandle: () => Promise<any>) => {
        queue.push(requstHandle);
        // 如果现在没有正在处理，则
        if (!isHandling) minusRequestHandle();
    }
    // 处理队列中的请求的方法
    const minusRequestHandle = async () => {
        const firstRequest = queue.shift();
        firstRequest();
        // 如果里面还有请求，则等个 3 秒后，继续处理
        if (queue.length) {
            await sleep(3000);
            minusRequestHandle();
        }
    }
    return {
        addRequstHandle
    }
}

let instance = null;

interface UseRequest {
    (): ReturnType<typeof initRequest>
}

const useRequest: UseRequest = () => {
    if (instance) return instance;
    instance = initRequest();
    return instance;
}

export { useRequest } ;