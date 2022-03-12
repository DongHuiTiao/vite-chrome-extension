import localforage from 'localforage';
import { IDatabase, LocalStore } from './type';

export class Database implements IDatabase {
    localStore: LocalStore<LocalForage> = {
        followsIdList: null,
        guguStore: null,
        videosListStore: null,
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