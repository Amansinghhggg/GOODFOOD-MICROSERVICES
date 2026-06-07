import { MongoClient } from "mongodb";

let client: MongoClient;

export const connectDB = async (dbname: string) => {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI!);
        await client.connect();
    }

    return client.db(dbname);
};