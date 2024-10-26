import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import * as riderController from '../controllers/rider.controller';
import { auth } from '../middleware/auth';


const router = Router();

router.post('/user/login', auth, userController.loginOne);
router.post('/user/register', auth, userController.registerOne);
router.post('/user/login/refresh_token', auth, userController.refreshToken)
router.post('/user/find_rides/', auth, riderController.findRides)




export default router;