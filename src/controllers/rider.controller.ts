import {Request, Response, RequestHandler} from 'express';
import { getErrorMessage } from '../utils/errors.util';
import { PrismaClient } from '@prisma/client';


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
    res.status(201).json(newRide);

}catch(error){
    res.status(500).json({message: getErrorMessage})
    }
}

export const check_ride_is_complete = async(req: Request, res: Response) => {
    const {rideId} = req.params

    const foundRide = await prisma.ride.findUnique({
        where:{id: parseInt(rideId)},
    })

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
        res.status(500).json({message: getErrorMessage})
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
        res.status(500).json({message: getErrorMessage})
    }
}

export const updateRide = async (req: Request, res: Response) => {
    const { rideId } = req.params;
    const { locationStart, locationEnd, driverNotes, date, time } = req.body;
  
    try {
      const updated_ride = await prisma.ride.update({
        where: { id: parseInt(rideId) },
        data: {
          locationStart,
          locationEnd,
          driverNotes,
          date,
          time,
        },
      });
  
      res.status(200).json(updated_ride);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage });
    }
  };

export const deleteRide = async(req: Request, res: Response) => {
    const { rideId } = req.params

    try {
        await prisma.ride.delete({
            where: {id: parseInt(rideId)}
        }
        )
        res.status(202).json({message: "Successfully removed ride"})
    } catch(error){
        res.status(500).json({message: getErrorMessage})
    }
}

export const removePassengerFromRide = async(req: Request, res: Response) => {
    const {rideId} = req.params
    const {userId} = req.body

    if (!rideId || userId){
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
    const {startTime, origin, destination} = req.query
    try {
        const filters: any = {}
        if (startTime) {
            filters.time = new Date(startTime as string)
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
        res.status(500).send(getErrorMessage)
    }
}