import mongoose from "mongoose";
import { MONGO_URL} from '../lib/utils/config.js'
import { errorLogger, infoLogger } from "../lib/utils/logger.js";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URL)
        infoLogger(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        errorLogger(`Error connection to mongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB