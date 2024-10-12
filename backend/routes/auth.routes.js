import express from 'express'
import { signup, login, logout } from '../controllers/auth.controller.js';
const router = express.Router();


router.post('/signup', (request, response) => {
    signup(request, response)
})

router.get('/login', (request, response) => {
    login(request, response)
})

router.post('/logout', (request, response) => {
    logout(request, response)
})

export default router;