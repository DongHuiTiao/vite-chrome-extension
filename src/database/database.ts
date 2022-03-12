import localforage from 'localforage';

export class Database {
    localStore: LocalStore<LocalForage> = {
        followsStore: null,
        guguStore: null,
        videosListStore: null,
    }

    constructor() {

    }

    async connect() {
        for(let key in this.localStore) {
            this.localStore[key] = localforage.createInstance({
                name: 'dhtDB',
                storeName: key,
            })
        }

        await localforage.ready();
    }
}