import { Router } from 'express';
import * as riderController from '../controllers/rider.controller';

const router = Router();

router.post('/create_ride', riderController.createRide)
router.post('/join/:rideId',riderController.join_ride);
router.post('/ride/:rideId/complete_check',riderController.check_ride_is_complete)
router.post('/ride/:rideId/update',riderController.updateRide)
router.post('/ride/:rideId/delete', riderController.deleteRide)

export default router