import { v2 as cloudinary } from 'cloudinary';
import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import { errorLogger } from '../lib/utils/logger.js';

export const createPost = async (request, response) => {
    try {
        const { text } = request.body;
        let { img } = request.body;
        const userId = request.user._id;

        const user = await User.findById(userId)

        if (user === null) {
            return response.status(404).json({
                message: "User not found"
            })
        }
        if (!text && !img) {
            return response.status(404).json({
                message: "Post must be have text or image"
            })
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url;
        }

        const post = new Post({
            user: userId,
            text
        })
        await post.save();
        response.status(201).json(post)
        
    } catch (error) {
        errorLogger("Error is createPost controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const deletePost = async (request, response) => {
    try {
        const postID = request.params.id;
        const post = await Post.findById(postID)
        
        if (post === null) {
            return response.status(404).json({
                message: "Post not found"
            })
        }
 
        if (!post.user.equals(request.user._id)) {
            return response.status(401).json({
                error: "You are not authorized to delete this post"
            })
        }
        // 删除cloudinary云上图片，避免免费存储不够
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId);
        }
        // 等待删除
        await Post.findByIdAndDelete(postID)
        return response.status(200).json({
            message: "Post deleted successfully"
        })
    } catch (e) {
        errorLogger("Error is deletePost controller", e.message)
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const commentOnPost = async (request, response) => {
    try {
        const { text } = request.body;
        const postId = request.params.id;
        const userId = request.user._id;

        if (!text) {
            return response.status(400).json({
                error: "Text field is required"
            }) 
        }

        const post = await Post.findById(postId)

        if (post === null) {
            return response.status(404).json({
                error: "Post not found"
            }) 
        }

        const comment = {
            user: userId,
            text
        }

        post.comments.push(comment)
        await post.save()
        response.status(200).json(post)
    } catch (error) {
        console.log("Error is commentOnPost controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }



}

export const likeUnlikePost = async (request, response) => {
    try {
        const userId = request.user._id;
        const { id: postId } = request.params;
        const post = await Post.findById(postId)

        if (!post) {
            return response.status(404).json({
                message: "Post not found"
            })
        }

        const userLikePost = post.likes.includes(userId);
        if (userLikePost) {
            await Post.updateOne({
                _id: postId
            }, {
                $pull: {
                    likes: userId
                }
            })
            await User.updateOne({
                _id: userId
            }, {
                $pull: {
                    likedPosts: postId
                }
            })

            response.status(200).json({
                message: "Post unliked successfully"
            })
        } else {
            post.likes.push(userId)
            await User.updateOne({
                _id: userId
            }, {
                $push: {
                    likedPosts: postId
                }
            })

            await post.save()
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save()

            response.status(200).json({
                message: "Post liked successfully"
            })
        }



    } catch (error) {
        console.log("Error is likeUnlikePost controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }

}

export const getAllPosts = async (request, response) => {
    try {
        const posts = await Post.find().sort({
            createdAt: 'desc'
        }).populate({
            path: "user",
            select: {
                password: 0
            }
        }).populate({
            path: "comments.user",
            select: {
                password: 0
            }
        })
        response.status(200).json(posts)
    } catch (error) {
        errorLogger("Error is getAllPosts controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getLikedPosts = async (request, response) => {
    const userId = request.user._id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            return response.status(404).json({
                error: "User not found"
            })
        }

        const likedPosts = await Post.find({
            _id: {
                $in: user.likedPosts
            }
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        response.status(200).json(likedPosts)
    } catch (error) {
        errorLogger("Error is getLikedPosts controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getFollowingPosts = async (request, response) => {
    try {
        const userId = request.user._id;
        const user = User.findById(userId)

        if (!user) {
            return response.status(404).json({
                error: "User not found"
            })
        }

        const following = user.following
        const feedPosts = await Post.find({
            user: {
                $in: following
            }
        }).sort({
                crearedAt: 'desc'
            }
        ).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        response.status(200).json(feedPosts)

    } catch (error) {
        errorLogger("Error is getFollowingPosts controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getUserPosts = async (request, response) => {
    try {
        const { username } = request.params
        const user = await User.findOne({
            username
        })

        if (!user) {
            return response.status(404).json({
                error: "User not found"
            })
        }

        const posts = await Post.find({
            user: user._id
        }).sort({
            createdAt: 'desc'
        }).populate({
            path: "user",
            select: {
                password: 0
            }
        }).populate({
            path: "comments.user",
            select: {
                password: 0
            }
        })
        return response.status(200).json(posts)
    } catch (error) {
        errorLogger("Error is getUserPosts controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}