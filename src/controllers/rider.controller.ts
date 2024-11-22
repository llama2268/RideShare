import {Request, Response} from 'express';
import {getErrorMessage} from '../utils/errors.util';
import {PrismaClient, Ride, Role} from '@prisma/client';
import {getAuth} from "@clerk/express";

const prisma = new PrismaClient()


export const createRide = async (req: Request, res: Response) => {
	const {locationStart, locationEnd, driverNotes, date, time, carType, seats, rate }: {
		locationStart: string,
		locationEnd: string,
		driverNotes: string,
		date: string,
		time: string,
		carType: string,
		seats: number,
		rate: number
	} = req.body

	const clerkId = getAuth(req).userId as string;

	const dbUser = await prisma.user.findFirst({
		where: { clerkUserId: clerkId }
	});

	if(!dbUser) {
		res.status(404).json({message: "User not found"})
		return
	}

	try {
		const newRide = await prisma.ride.create({
				data: {
					driverId: dbUser.id,
					locationStart,
					locationEnd,
					driverNotes,
					date,
					time,
					carType,
					rate: parseInt(rate.toString()),
					seats: parseInt(seats.toString()),
					isComplete: false,
				},
			}
		);
		const user = await prisma.user.findUnique({
			where: {id: dbUser.id},
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
					where: {id: dbUser.id},
					data: {role: newRole as Role},
				});
			}
		}
		res.status(201).json(newRide);

	} catch (error) {
		res.status(500).json({message: getErrorMessage(error)})
	}
}

export const ride_is_complete = async (req: Request, res: Response) => {
	const {rideId} = req.params

	const foundRide = await prisma.ride.findUnique({
		where: {id: parseInt(rideId)},
	})
	try {
		if (!foundRide) {
			res.status(404).json({message: "Ride not found"})
			return
		} else if (foundRide.isComplete) {
			const time_taken = new Date(foundRide.time).getTime() - new Date(foundRide.date).getTime()
			const hours = Math.floor(time_taken / (1000 * 60 * 60));
			const minutes = Math.floor((time_taken % (1000 * 60 * 60)) / (1000 * 60));

			res.status(200).json({
				message: "Ride is complete",
				timeTaken: `${hours} hours and ${minutes} minutes`
			})
		} else {
			const updatedRide = await prisma.ride.update({
				where: {id: parseInt(rideId)},
				data: {isComplete: true},
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
	} catch (error) {
		res.status(500).json({message: getErrorMessage(error)})
	}
}

export const join_ride = async (req: Request, res: Response) => {
	const { rideId } = req.params;
	const { userId } = req.body;

	const foundRide = await prisma.ride.findUnique({
		where: { id: parseInt(rideId) }
	});

	if (!foundRide) {
		res.status(404).json({ message: "Ride not found" });
		return;
	}

	const user = await prisma.user.findFirst({
		where: { id: userId }
	});

	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	try {
		await prisma.passenger.create({
			data: {
				userId: user.id,
				rideId: parseInt(rideId),
			}
		});

		res.status(201).json({ message: "Joined the ride successfully" });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
};

export const updateRide = async (req: Request, res: Response) => {
	const {rideId} = req.params;
	const {locationStart, locationEnd, driverNotes, date, time} = req.body;
	let updateData: any = {};

	if (locationStart) updateData.locationStart = locationStart;
	if (locationEnd) updateData.locationEnd = locationEnd;
	if (driverNotes) updateData.driverNotes = driverNotes;
	if (date) updateData.date = date;
	if (time) updateData.time = time;

	try {
		const updated_ride = await prisma.ride.update({
			where: {id: parseInt(rideId)},
			data: updateData,
		});

		res.status(200).json(updated_ride);
	} catch (error) {
		res.status(500).json({message: getErrorMessage});
	}
};

export const deleteRide = async (req: Request, res: Response) => {
	const {rideId} = req.params

	try {
		let passengers = await prisma.passenger.deleteMany({
			where: {rideId: parseInt(rideId)},
		});

		const deletedRide = await prisma.ride.delete({
				where: {id: parseInt(rideId)}
			}
		)
		res.status(202).json({message: "Successfully removed ride", deletedRide, passengers})
	} catch (error) {
		res.status(500).json({message: getErrorMessage(error)})
	}
}

export const removePassengerFromRide = async (req: Request, res: Response) => {
	const {rideId} = req.params
	const {userId} = req.body

	if (!rideId || !userId) {
		res.status(400).json({message: "rideId and userId not found"})
	}

	try {
		const passenger = await prisma.passenger.findFirst({
			where: {
				rideId: parseInt(rideId),
				userId: userId
			}
		})
		if (!passenger) {
			res.status(404).json({message: "Passenger was not found"})
		} else {

			await prisma.passenger.delete({
				where: {
					id: passenger.id
				}
			})
			res.status(200).json({message: "Passenger was removed successfully"})
		}
	} catch (error) {
		throw new Error("Passenger was not removed successfully")
	}
}

export const getRides = async (req: Request, res: Response) => {
	// Get all rides that this user is the driver of
	const clerkId = getAuth(req).userId as string;
	const dbUser = await prisma.user.findFirst({
		where: { clerkUserId: clerkId }
	});
	if(!dbUser) {
		res.status(404).json({message: "User not found"})
		return
	}

	const rides= await prisma.ride.findMany({
		where: {
			driverId: dbUser.id
		}, include: {
			passengers: true
		}
	})

	const ridesPopulated = rides.map(async ride => {
		// Populate the driver and passenger fields
		const driver = await prisma.user.findFirst({where: {id: ride.driverId}});
		let passengers = ride.passengers.map(passenger => {
			return {
				...passenger,
				user: prisma.user.findUnique({
					where: {id: passenger.userId}
				})
			}
		});

		if(passengers.length == 0) {
			passengers = [];
		}

		return {
			...ride,
			driver,
			passengers
		};
	});

	const output = await Promise.all(ridesPopulated);

	res.status(200).json(output)
}

export const findRides = async (req: Request, res: Response) => {
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
		if (destination) {
			filters.locationEnd = destination
		}
		const rides = await prisma.ride.findMany({
			where: filters,
			include: {
				driver: true,
				passengers: true
			}
		})

		const ridesPopulated = rides.map(ride => {
			// Populate the driver and passenger fields
			const driver = ride.driver;
			const passengers = ride.passengers.map(passenger => {
				return {
					...passenger,
					user: prisma.user.findUnique({
						where: {id: passenger.userId}
					})
				}
			});

			return {
				...ride,
				driver,
				passengers
			};
		});
		if(rides.length == 0) console.log("meow")
		res.status(200).json(ridesPopulated)
		return
	} catch (error) {
		console.error("Error finding rides:", error);
		res.status(500).send(getErrorMessage(error))
	}
}

export const getRide = async (req: Request, res: Response) => {
	let {rideId} = req.params;
	const ride = await prisma.ride.findUnique({
		where: {
			id: parseInt(rideId) ? parseInt(rideId) : 1
		},
		include: {
			driver: true,
			passengers: true
		}
	});

	if (!ride) {
		res.status(404).json({message: "Ride not found"});
		return;
	}

	const driver = ride.driver;
	const passengers = ride.passengers.map(passenger => {
		return {
			...passenger,
			user: prisma.user.findUnique({
				where: {id: passenger.userId}
			})
		}
	});

	res.status(200).json({
		...ride,
		driver,
		passengers
	});
}