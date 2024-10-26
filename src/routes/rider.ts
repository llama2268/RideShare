import { Router } from 'express';
import * as riderController from '../controllers/rider.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/create_ride',auth, riderController.createRide)
router.post('/join/:rideId',auth,riderController.join_ride);
router.post('/ride/:rideId/complete_check',auth,riderController.check_ride_is_complete)
router.post('/ride/:rideId/update',auth,riderController.updateRide)
router.post('/ride/:rideId/delete',auth, riderController.deleteRide)
router.post('/ride/passenger/leave', auth,riderController.removePassengerFromRide)


export default router