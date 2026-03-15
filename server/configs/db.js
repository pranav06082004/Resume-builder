import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB")
        })

        let mongodbURI = process.env.MONGODB_URI;
        const projectName = 'resume_builder'; // FIXED

        if(!mongodbURI){
            throw new Error("MONGODB_URI environment is not set")
        }

        if(mongodbURI.endsWith("/")){
            mongodbURI = mongodbURI.slice(0, -1)
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`)
    }
    catch (error){
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;