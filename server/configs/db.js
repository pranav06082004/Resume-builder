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

        // Determine whether the provided URI already contains a database name.
        // If it does, use it as-is; otherwise append the project default DB name.
        const stripped = mongodbURI.replace(/^mongodb(\+srv)?:\/\//, '');
        const hasDbName = /\/[^\/\?]+/.test(stripped);

        let finalURI = mongodbURI;
        if (!hasDbName) {
            // ensure no trailing slash then append project name
            finalURI = mongodbURI.replace(/\/+$/, '') + '/' + projectName;
        }

        // Mask credentials for logging
        const masked = finalURI.replace(/:\/\/([^@]+)@/, '://[REDACTED]@');
        console.log('Attempting MongoDB connection to:', masked);

        await mongoose.connect(finalURI);
        console.log('✅ MongoDB connected')
    }
    catch (error){
        console.error("Error connecting to MongoDB:", error);
        // Exit process — the app depends on DB. Prevent request buffering/timeouts.
        process.exit(1);
    }
}

export default connectDB;