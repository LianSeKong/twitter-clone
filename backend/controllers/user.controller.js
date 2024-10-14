import User from "../models/user.model.js";

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

export const getSuggestedUsers = async (request, response) => {
    response.status(200).json({
        data: "待完成"
    })
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
    const { id : _id} = request.params;
 
    
    const targetUser = await User.findById(_id);
    if (!targetUser) {
        return response.status(402).json({
            error: "用户不存在！"
        })
    }
    
    // if (_id.toString() === request.user._id.toString()) {
    //     return response.status(402).json({
    //         error: "不能跟随自己"
    //     })
    // }

    if (request.user.followers.includes(_id)) {
        request.user.followers = request.user.followers.filter(follower => follower.toString() !==  _id.toString())
        targetUser.following = targetUser.following.filter(follower => follower.toString() !== request.user._id.toString())
        await request.user.save();
        await targetUser.save();
        return response.status(200).json({
            data: "取消成功"
        })
    } else {
        request.user.save();
        targetUser.save();
        request.user.followers.push(_id)
        targetUser.following.push(request.user._id)
        await request.user.save();
        await targetUser.save();
        return response.status(200).json({
            data: "跟随成功"
        })
    }





}