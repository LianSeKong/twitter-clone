import express from 'express'
import { signup, login, logout } from '../controllers/auth.controller.js';
import { getMe } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';
const router = express.Router();


router.post('/signup', (request, response) => {
    signup(request, response)
})

router.post('/login', (request, response) => {
    login(request, response)
})

router.post('/logout', (request, response) => {
    logout(request, response)
})

router.get('/me', protectRoute, getMe)
export default router;