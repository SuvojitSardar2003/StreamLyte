import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
   /*  res.status(200).json({
        message: "OK"
    }) */
   //steps to do
   //get user details from frontend

   const { userName, email, fullName, password } = req.body
   console.log("Email:",email);
   /* if(email){
    res.status(200).json({
        message: "OK"
    })
   } */

   // validation - not empty

   /* if(fullName === ""){
    throw new ApiError(400, "fullname is required");   
   } */

  // required fields check
    if ([fullName, email, userName, password].some((field)=> field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    // email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    /* res.status(200).json({
        message: "Validation passed"
    }); */

    /*
    npm install validator
    import validator from "validator";
    if (!validator.isEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    } */


   // check if user already exists: username, email

   const existedUser = await User.findOne({
    $or: [{ userName }, { email }]
   })

   if(existedUser){
    throw new ApiError(409, "User with email or username already exist")
    
   }

   // check for images, check for avatar

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   //to prevent coverImage error
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && (req.files.coverImage.length > 0)){
    coverImageLocalPath = req.files.coverImage[0].path;
   }

   if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
    
   }

   // upload them to cloudinary , avatar

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

       //check if uploaded properly or not
    if(!avatar) {
    throw new ApiError(400, "Avatar file is required");
    
   }

   // create user object - create entry in db

   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
   })

   // remove password and refresh token field from response

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   );
        //check if user created or not
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring the user");
    }

   // return response

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )
   
})

export { registerUser };