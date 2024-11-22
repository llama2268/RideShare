import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/express';

const prisma = new PrismaClient();

export const registerClerkUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { userId, sessionClaims } = getAuth(req);
	if (!userId) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const existingUser = await prisma.user.findUnique({
		where: { clerkUserId: userId },
	});

	if (!existingUser) {
		const email = (sessionClaims.email as string | undefined) ?? "@clerk.dev";
		const name = `${sessionClaims.first_name} ${sessionClaims.last_name}`;

		await prisma.user.create({
			data: {
				clerkUserId: userId,
				email,
				name,
				password: 'clerk',
				role: 'PASSENGER',
			},
		});
	}

	next();
};