import User from "../models/user.model.js";
import { errorLogger } from '../lib/utils/logger.js';
export const getNotifications = async (request, response) => {
    const userId = request.user._id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            return response.status(404).json({
                error: "User not found"
            })
        }
        const notifications = await Notification.find({
            to: userId
        }).populate({
            path: "from",
            select: "username profileImg"
        })
        await Notification.updateMany({to: userId}, { read: true})
        response.status(200).json(notifications)

    } catch (error) {
        errorLogger("Error is getNotifications controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const deleteNotifications = async (request, response) => {
    try {
        const userId = request.user._id;
        await Notification.deleteMnay({to: userId})
        response.status(200).json({
            message: "Notifications deleted successfully"
        })
    } catch (error) {
        errorLogger("Error is deleteNotifications controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const deleteNotification = async (request, response) => {
    try {
        const id = request.params.id;
        const userId = request.user._id;
        const notification = await Notification.findById(id)

        if (!notification) {
            return response.status(404).json({
                error: "Notification not found"
            })
        }
        if (notification.to.toString() !== userId.toString()) {
            return response.status(403).json({
                error: "You are not allowed to delete this notification"
            })
        }

        await Notification.findByIdAndDelete(id)

        response.status(200).json({
            message: "Notication deleted successfully"
        })
    } catch (error) {
        errorLogger("Error is deleteNotification controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}