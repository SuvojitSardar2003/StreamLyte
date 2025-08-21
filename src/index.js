//require('dotenv').config({path : './env'})
import dotenv from 'dotenv';

import express from "express";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})


connectDB();


























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