export interface LocalStore<T> {
    followsInfoList: T,
    guguStore: T,
    videosListStore: T,
}

export interface IDatabase {
    localStore: LocalStore<LocalForage>;
    connect(): Promise<void>;
}