import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function createTrip(req, res) {
  const { title, startDate } = req.body;
  const { user } = getSession(req, res);
  try {
    const newTrip = await prisma.trip.create({
      data: {
        title: title,
        startDate: startDate,
        authorId: user.sub,
      },
    });

    const newFirstDay = await prisma.dailyPlan.create({
      data: {
        tripId: newTrip.id,
        notes: '',
      },
    });
    console.log('TRIP CREATED', newTrip);
    console.log('PLAN CREATED', newFirstDay);
    res.json(newTrip);
  } catch (err) {
    console.error(err);
  }
});
