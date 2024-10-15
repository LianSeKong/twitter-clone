import express from 'express'
import cookieParser from 'cookie-parser';

// IMAGE STORAGE CLOUND
import './lib/cloudinary.js'

// Router 
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
import notificationRouter from "./routes/notification.route.js"

// DB ORM
import connectMongoDB from './db/connectMongoDB.js';
import { infoLogger } from './lib/utils/logger.js';


const app = express(); // 一次创建，终生使用
app.use(express.json()); // 解析请求体内的JSON数据
app.use(express.urlencoded({ extended: false })); // 解析请求体内urlencoded格式
app.use(cookieParser())


app.get('/', (request, response) => {
    return response.json({
        data: "初始化backend"
    })
})

app.use("/api/auth" ,authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/notification", notificationRouter)
const port = process.env.PORT || 9000

app.listen(port, () => {
    infoLogger(`server: ${port}`);
    connectMongoDB()
})