import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function createTrip(req, res) {
  const { title, startDate, tags, budget } = req.body;
  console.log('SAVING TAGS TO DB', tags);
  console.log('TAGS', tags, Object.entries(tags));
  const { user } = getSession(req, res);
  try {
    // CREATE NEW TRIP
    const newTrip = await prisma.trip.create({
      data: {
        title: title,
        startDate: startDate,
        authorId: user.sub,
        budget: budget,
      },
    });

    // CREATE TAGS
    const tagsToUpdate = [];
    for (let [key, value] of Object.entries(tags)) {
      if (value) {
        tagsToUpdate.push({
          tripId: newTrip.id,
          tag: key,
        });
      }
    }
    console.log('TAGS', tagsToUpdate);
    await prisma.tripTag.createMany({
      data: tagsToUpdate,
    });

    // CREATE FIRST DAILY PLAN
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
    res.status(500).end('Something went wrong');
  }
});
