import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import * as riderController from '../controllers/rider.controller';
import {requireAuth} from "@clerk/express";

const router = Router();

router.post('/login', userController.loginOne);
router.delete('/logout',requireAuth(), userController.logOut);
router.post('/register', userController.registerOne);
router.post('/login/refresh_token', userController.refreshToken)
router.get('/find_rides/', requireAuth(), riderController.findRides)
router.get('/driver_rides/', requireAuth(), riderController.getRides)


export default router;