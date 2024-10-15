import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';
import Notification from "../models/notification.model.js";
/**
 * @description 根据用户名称去获取数据
 * 
 * @param {*} request 请求
 * @param {*} response 响应
 * 
 * 
 */
export const getUserProfile = async (request, response) => {

    const { username } = request.params;
    const targetUser = await User.findOne({
        username
    }).select('-password')
    if (!targetUser) {
        return response.status(404).json({
            error: "此用户不存在"
        })
    }
    return response.status(200).json(targetUser)
}



/**
 * @description 成为或取消为指定用户的粉丝
 * 
 * @param {*} request 请求
 * @param {*} response 响应
 * 
 * 
 */
export const followUnfollowUser = async (request, response) => {
    try {
        const { id } = request.params;
        const targetUser = await User.findById(id);
        const currentUser = await User.findById(request.user._id);

        if (id === request.user._id.toString()) {
            return response.status(400).json({
                error: "You can't follow/unfollow yourself"
            })
        }

        if (targetUser === null || currentUser === null) {
            return response.status(400).json({
                error: "User not found"
            })
        }
        const isFollowing = currentUser.following.includes(id)

        if (isFollowing) {
            await User.findByIdAndUpdate(id, {
                $pull: {
                    followers: request.user._id
                }
            })
            await User.findByIdAndUpdate(request.user._id, {
                $pull: {
                    following: id
                }
            })
            response.status(200).json({
                message: "User unfollowed successfully"
            })
        } else {
            await User.findByIdAndUpdate(id, {
                $push: {
                    followers: request.user._id
                }
            })
            await User.findByIdAndUpdate(request.user._id, {
                $push: {
                    following: id
                }
            })
            const notification = new Notification({
                type: 'follow',
                from: request.user._id,
                to: targetUser._id
            })
            await notification.save()
            response.status(200).json({
                message: "User followed successfully"
            })

        }

    } catch (error) {
        console.log("Error is followUnfollowUser controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}


export const getSuggestedUsers = async (request, response) => {
    try {
        const userId = request.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: userId
                    }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])
        const filteredUsers = users.filter(
            user => !usersFollowedByMe.following.includes(user._id)
        )
        const suggestedUsers = filteredUsers.slice(0, 4)

        suggestedUsers.forEach(
            user => user.password = null
        )

        response.status(200).json({
            data: suggestedUsers
        })


    } catch (error) {
        console.log("Error is followUnfollowUser controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }

}

export const updateUser = async (request, response) => {
    const { fullname, email, username, currentPassword, newPassword, bio, link} = request.body;
    let { profileImg, coverImg } = request.body;

    const userId = request.user._id;

    try {
        const user = await User.findById(userId)
        if (user === null) {
            return response.status(404).json({
                message: "User not found"
            })
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return response.status(400).json({
                error: "Please provide both current password and new password"
            })

        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) return response.status(400).json({
                error: "Current password is incorrect"
            })
            if (newPassword.length < 6) {
                return  response.status(400).json({
                    error: "Password must be at least 6 characters long"
                })
            }
            const salt = await bcrypt.getSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

        }

        if (profileImg) {

            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }

        user.fullname = fullname || user.fullname
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()

        user.password = null
        return response.status(200).json(user)

    }
    catch (error) {
        console.log("Error is updateUser controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}
