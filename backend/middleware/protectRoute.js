import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'

const protectRoute = async (request, response, next) => {

        try {
            const token = request.cookies.jwt;
            console.info(token);

            if (!token) {
                return response.status(401).json({
                    error: "Unauthorized: No Token Provided"
                })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (!decoded) {
                return response.status(401).json({
                   error: "Unauthorized: Invalid Token"
                })
            }
            const user = await User.findById(decoded.userId).select("-password")
            
            if (!user) {
                return response.status(404).json({
                    error: "User not found"
                })
            }
            request.user = user;
            next()

        } catch (error) {
            console.log("Error is protectRoute controller", error.message);
            return response.status(500).json({
                error: "Internal Server Error"
            })
        }


}

export default protectRoute