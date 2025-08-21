//require('dotenv').config({path : './env'})
import dotenv from 'dotenv';

import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    app.on("Error",(err)=>{
        console.log("Error:",err);
        throw err;
    });

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.error("Mongo DB connection Failed!!!", err);
})


























//const app = express();

//Approach 1: here we connect database and route work did index.js   but now this ibndex.js is so polluted...so we will go to approach 2

/* function connectDB(){

} ...use efi*/

/* (async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.error("ERROR:",error);
        throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Application is listening on ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR:",error);
        throw error;
    }
})() */