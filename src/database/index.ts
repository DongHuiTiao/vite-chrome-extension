import { Database } from "./database";
import { IDatabase } from "./type";

let database: IDatabase | null = null;
const databaseFactory = () => {
    if (!database) {
        database = new Database();
    }

    return database;
}

export default databaseFactory;