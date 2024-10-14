import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

// Router 
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"

// DB ORM
import connectMongoDB from './db/connectMongoDB.js';

const app = express(); // 一次创建，终生使用
app.use(express.json()); // 解析请求体内的JSON数据
app.use(express.urlencoded()); // 解析请求体内urlencoded格式
app.use(cookieParser())

dotenv.config() // 默认读取项目根目录下的.env 环境变量文件


app.get('/', (request, response) => {
    return response.json({
        data: "初始化backend"
    })
})

app.use("/api/auth" ,authRouter)
app.use("/api/user", userRouter)

const port = process.env.PORT || 9000

app.listen(port, () => {
    console.log(`服务已启动，监听： ${port}`);
    connectMongoDB()
})


