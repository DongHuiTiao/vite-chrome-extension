import localforage from 'localforage';

interface LocalStore<T> {
    followsStore: T,
    guguStore: T,
    videosListStore: T,
}

const initDB = () => {
    const localStore: LocalStore<LocalForage> = {
        followsStore: null,
        guguStore: null,
        videosListStore: null,
    }
    const initDB = async (): Promise<any> => {

        for(let key in localStore) {
            localStore[key] = localforage.createInstance({
                name: 'dhtDB',
                storeName: key,
            })
        }

        await localforage.ready();

    };
    return {
        initDB,
        localStore
    }
}

export const useDB = () => initDB();