import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './MongoDB/connectDB.js'
import authRoutes from './routes/authRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'


dotenv.config()


const app = express();
const __dirname= path.resolve();

app.use(express.json());
app.use(cookieParser()) 
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/workout', workoutRoutes);
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')))

    app.get('/*splat', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'))
    })
}

const PORT = process.env.PORT || 5000


app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})