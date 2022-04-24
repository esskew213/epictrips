import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function createTrip(req, res) {
  const { title, startDate } = req.body;
  const { user } = getSession(req, res);
  console.log(user);
  const result = await prisma.trip.create({
    data: {
      title: title,
      startDate: startDate,
      authorId: user.sub,
    },
  });
  res.json(result);
});
