import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function createTrip(req, res) {
  const { title, startDate, tags } = req.body;
  console.log('SAVING TAGS TO DB', tags);
  const { user } = getSession(req, res);
  try {
    const newTrip = await prisma.trip.create({
      data: {
        title: title,
        startDate: startDate,
        authorId: user.sub,
      },
    });

    for (let [key, value] of Object.entries(tags)) {
      if (value) {
        await prisma.tripTag.create({
          data: {
            tripId: newTrip.id,
            tag: key,
          },
        });
      }
    }

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
