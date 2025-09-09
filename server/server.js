import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

//import helmet from "helmet"; 



import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app=express();
const port=process.env.PORT || 4000
connectDB();

//const allowedOrigins = ['https://mern-stack-frontend-3vlb.onrender.com']


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());




//app.use(helmet());  
app.use(cors({
  origin: 'https://mern-stack-frontend-3vlb.onrender.com',
  credentials: true}));

// API Endpoints
app.get('/',(req,res)=>res.send("API Working Fine"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);



/*
// 🧯 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// 🧨 Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});
*/

app.listen(port, ()=>console.log(`Server started on PORT:${port}`));
