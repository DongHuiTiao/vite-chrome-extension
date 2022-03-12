import { Database } from "./database";

let database = null;
const databaseFactory = () => {
    if (!database) {
        database = new Database();
    }

    return database;
}

export default databaseFactory;