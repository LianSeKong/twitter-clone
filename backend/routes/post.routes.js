import express from "express";
import protectRoute from '../middleware/protectRoute.js';
import { createPost,getFollowingPosts, getLikedPosts, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getUserPosts } from "../controllers/post.controller.js";
const router = express.Router()

router.get("/all", protectRoute, getAllPosts)
router.post("/create", protectRoute, createPost)
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.get("/like/:id", protectRoute, getLikedPosts)
router.get("/following", protectRoute, getFollowingPosts)
router.get("/user/:username", protectRoute, getUserPosts)
export default router