export interface LocalStore<T> {
    followsIdList: T,
    guguStore: T,
    videosListStore: T,
}

export interface IDatabase {
    localStore: LocalStore<LocalForage>;
    connect(): Promise<void>;
}