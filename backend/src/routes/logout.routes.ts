import { Router } from "express"
import * as refreshController from "../controllers/refresh.controller"

const router = Router()

router.post('/', refreshController.logout);

export default router;