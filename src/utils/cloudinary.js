import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        //upload the file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //file has been uploaded successfully
        console.log("File in uploaded on cloudinary,\n Response:",response);
        console.log("URL:",response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove the locally saved temporarily file as the ulpoad operation got failed
        return null;
    }
}

export { uploadOnCloudinary };