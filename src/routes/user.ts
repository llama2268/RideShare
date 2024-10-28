import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import * as riderController from '../controllers/rider.controller';
import { auth } from '../middleware/auth';


const router = Router();

router.post('/user/login', userController.loginOne);
router.delete('/user/logout',auth, userController.logOut);
router.post('/user/register', userController.registerOne);
router.post('/user/login/refresh_token', userController.refreshToken)
router.get('/user/find_rides/', auth, riderController.findRides)




export default router;