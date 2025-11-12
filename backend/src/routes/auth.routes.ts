import { Router } from "express"
import * as authController from "../controllers/auth.controller"
import * as refreshController from "../controllers/refresh.controller"


const router = Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post('/refresh', refreshController.refresh);
router.post('/logout', refreshController.logout);

export default router