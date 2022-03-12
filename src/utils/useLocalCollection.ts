import { Db } from 'zangodb';
interface Payload {
    action: 'insert' | 'remove' | 'update';
    data: unknown;
}
export const useLocalCollection = (name: string) => {
    const db = new Db('dhtDB', 1, {
        up: [
            'id', 
            'uname', 
            'face', 
            'currentGuguLength', 
            'averageGuguLength',
            'maxGuguLength',
            'videosList'
        ]
    });
    let collection = db.collection(name);

    const callbackList = {
        insert: collection.insert,
        remove: collection.remove,
        update: collection.update
    }

    const setCollection = (payload: Payload): Promise<void> => {
        const {action, data} = payload
        return callbackList[action].apply(null, data);
    }

    return {
        collection,
        setCollection
    }
}
