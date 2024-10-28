import {Request, Response, RequestHandler} from 'express';
import { getErrorMessage } from '../utils/errors.util';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient()


export const createRide = async(req:Request,res:Response) => {
    const {driverId, locationStart, locationEnd, driverNotes, date, time} = req.body

    try{
        const newRide = await prisma.ride.create({
        data: {
            driverId,
            locationStart,
            locationEnd,
            driverNotes,
            date,
            time,
            isComplete: false,
        },
    }
);
        const user = await prisma.user.findUnique({
        where: { id: driverId },
        include: {
        ridesOffered: true,
        passengersForRide: true,
        },
        });
        if (user) {
        let newRole = '';
        const hasRides = user.ridesOffered.length > 0;
        const isPassenger = user.passengersForRide.length > 0;

        if (hasRides && isPassenger) {
        newRole = Role.RIDER_AND_PASSENGER;
        } else if (hasRides) {
        newRole = Role.RIDER;
        } else if (isPassenger) {
        newRole = Role.PASSENGER;
        }

        if (newRole && user.role !== newRole) {
        await prisma.user.update({
        where: { id: driverId },
        data: { role: newRole as Role },
        });
        }
        }
    res.status(201).json(newRide);

}catch(error){
    res.status(500).json({message: getErrorMessage(error)})
    }
}

export const ride_is_complete = async(req: Request, res: Response) => {
    const {rideId} = req.params

    const foundRide = await prisma.ride.findUnique({
        where:{id: parseInt(rideId)},
    })
    try{
    if (!foundRide){
        res.status(404).json({message: "Ride not found"})
        return
    }
    else if (foundRide.isComplete){
        const time_taken = new Date(foundRide.time).getTime() - new Date(foundRide.date).getTime()
        const hours = Math.floor(time_taken / (1000 * 60 * 60));
        const minutes = Math.floor((time_taken % (1000 * 60 * 60)) / (1000 * 60));
        
        res.status(200).json({
            message: "Ride is complete",
            timeTaken: `${hours} hours and ${minutes} minutes`
        })
    } else {
        const updatedRide = await prisma.ride.update({
            where: { id: parseInt(rideId) },
            data: { isComplete: true },
        })
        const startDateTime = new Date(`${foundRide.date.toString().split('T')[0]}T${foundRide.time}`);

        // Calculate time taken as the difference between now and startDateTime
        const now = new Date();
        const time_taken_ms = now.getTime() - startDateTime.getTime();
        const hours = Math.floor(time_taken_ms / (1000 * 60 * 60));
        const minutes = Math.floor((time_taken_ms % (1000 * 60 * 60)) / (1000 * 60));

        res.status(200).json({
            message: "Ride has been marked as complete",
            timeTaken: `${hours} hours and ${minutes} minutes`,
        });
    }   
}catch (error){
    res.status(500).json({message: getErrorMessage(error)})
} 
}

export const join_ride = async(req:Request, res:Response) => {
    const { rideId } = req.params
    const { userId } = req.body

    const foundRide = prisma.ride.findUnique(
        {where: {id: parseInt(rideId)}}
    )

    if (!foundRide){
        res.status(404).json({message: "Ride not found"});
        return
    }
    try{
    await prisma.passenger.create({data:{
            userId,
            rideId: parseInt(rideId)
        }})

        res.status(201).json({message: "Joined the ride successfully"})
    }catch (error){
        res.status(500).json({message: getErrorMessage(error)})
    }
}

export const updateRide = async (req: Request, res: Response) => {
    const { rideId } = req.params;
    const { locationStart, locationEnd, driverNotes, date, time } = req.body;
    let updateData: any = {};

    if (locationStart) updateData.locationStart = locationStart;
    if (locationEnd) updateData.locationEnd = locationEnd;
    if (driverNotes) updateData.driverNotes = driverNotes;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
  
    try {
      const updated_ride = await prisma.ride.update({
        where: { id: parseInt(rideId) },
        data: updateData,
      });
  
      res.status(200).json(updated_ride);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage });
    }
  };

export const deleteRide = async(req: Request, res: Response) => {
    const { rideId } = req.params

    try {
        let passengers = await prisma.passenger.deleteMany({
            where: { rideId: parseInt(rideId) },
          });

        const deletedRide = await prisma.ride.delete({
            where: {id: parseInt(rideId)}
        }
        )
        res.status(202).json({message: "Successfully removed ride", deletedRide, passengers})
    } catch(error){
        res.status(500).json({message: getErrorMessage(error)})
    }
}

export const removePassengerFromRide = async(req: Request, res: Response) => {
    const {rideId} = req.params
    const {userId} = req.body

    if (!rideId || !userId){
        res.status(400).json({message:"rideId and userId not found"})
    }

    try{
        const passenger = await prisma.passenger.findFirst({where:{
            rideId: parseInt(rideId),
            userId: userId
        }
        })
        if (!passenger){
            res.status(404).json({message: "Passenger was not found"})
        } else{

        await prisma.passenger.delete({
            where:{
                id: passenger.id
            }
        })
        res.status(200).json({message:"Passenger was removed successfully"})
    }
    }catch (error){
        throw new Error("Passenger was not removed successfully")
    }
}

export const findRides = async(req: Request, res: Response) => {
    const {date, startTime, origin, destination} = req.body
    try {
        const filters: any = {}
        if (date) {
            filters.date = date
        }
        if (startTime) {
            filters.time = startTime
        }

        if (origin) {
            filters.locationStart = origin
        }
        if (destination){
            filters.locationEnd = destination
        }
        const rides = await prisma.ride.findMany({
            where:filters,
            include: {driver: true,
                passengers: true
            }     
        })
        if (rides.length == 0){
            res.status(404).json({message: "No rides found matching criteria"})
        }
        res.status(200).json(rides)
    }catch (error) {
        console.error("Error finding rides:", error);
        res.status(500).send(getErrorMessage(error))
    }
}