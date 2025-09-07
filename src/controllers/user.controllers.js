import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser";

const  generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while genereting refresh and access token");
    }
}

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

const loginUser = asyncHandler( async (req,res) => {
    //take user details from frontend-email,username,password (req body---> data)
    const { email, username, password } = req.body;
    if(!username || !password){
        throw new ApiError(400, "Username or Password is required!!!");
    }

    //check if user(username or email) is in DB or not, eg: already registered user
    const user= await User.findOne({
        $or: [{username,email}]
    })

    if(!user){
        throw new ApiError(404, "User doesn't exist");
    }

    //check credentials-password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials!!!")
    }

    //access & refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    //send secured cookies with response
    /*(if DB call is expensive then do updation in earlier "user" as at that time there was refresh token emplty as we just calles function rn here...if DB call is not expensive do DB call another time)*/
    const loggedInUser = await User.findById(user._id).select("-password - refreshToken");

    const options = {
        httpOnly : true,
        secure: true //cookies are by-default modified by anyone in frontend but by doing these 2 options cookies will be modified only by server 
    }

    //return response
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
        200,
        {
            user : loggedInUser, accessToken, refreshToken
        },"User logged In Successfully"))
})

const logoutUser = asyncHandler( async (req,res)=>{
    //
    await User.findByIdAndUpdate(req.user._id,{
        $set: {
            refreshToken: undefined
        }
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"User logged out!!!")
    )
})

export { registerUser, loginUser, logoutUser };