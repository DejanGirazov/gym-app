import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './MongoDB/connectDB.js'
import authRoutes from './routes/authRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'


dotenv.config()


const app = express();

app.use(express.json());
app.use(cookieParser()) 
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/workout', workoutRoutes);

const PORT = process.env.PORT || 5000


app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})