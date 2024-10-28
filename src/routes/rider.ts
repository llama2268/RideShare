import { Router } from 'express';
import * as riderController from '../controllers/rider.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/create_ride',auth, riderController.createRide)
router.post('/join/:rideId',auth,riderController.join_ride);
router.put('/ride/:rideId/ride_complete',auth,riderController.ride_is_complete)
router.put('/ride/:rideId/update',auth,riderController.updateRide)
router.delete('/ride/:rideId/delete',auth, riderController.deleteRide)
router.delete('/ride/:rideId/passenger/leave', auth,riderController.removePassengerFromRide)


export default router