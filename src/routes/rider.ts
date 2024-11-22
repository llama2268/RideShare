import { Router } from 'express';
import * as riderController from '../controllers/rider.controller';
import {requireAuth} from "@clerk/express";

const router = Router();

router.get('/find_ride/:rideId', requireAuth({ signInUrl: '/sign-in' }), riderController.getRide);
router.post('/create_ride', requireAuth({ signInUrl: '/sign-in' }), riderController.createRide);
router.post('/join/:rideId', requireAuth({ signInUrl: '/sign-in' }), riderController.join_ride);
router.put('/ride/:rideId/ride_complete', requireAuth({ signInUrl: '/sign-in' }), riderController.ride_is_complete);
router.put('/ride/:rideId/update', requireAuth({ signInUrl: '/sign-in' }), riderController.updateRide);
router.delete('/ride/:rideId/delete', requireAuth({ signInUrl: '/sign-in' }), riderController.deleteRide);
router.delete('/ride/:rideId/passenger/leave', requireAuth({ signInUrl: '/sign-in' }), riderController.removePassengerFromRide);

export default router;