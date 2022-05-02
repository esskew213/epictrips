import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function createTrip(req, res) {
  const { title, startDate, tags, budget } = req.body;
  const { user } = getSession(req, res);
  const { method } = req;
  // CREATE ARRAY OF TAGS
  if (method === 'POST') {
    const tagsToUpdate = [];
    for (let [key, value] of Object.entries(tags)) {
      if (value) {
        tagsToUpdate.push({
          tag: key,
        });
      }
    }
    console.log('TAGS', tagsToUpdate);
    try {
      // CREATE NEW TRIP
      const newTrip = await prisma.trip.create({
        data: {
          title: title,
          startDate: startDate,
          authorId: user.sub,
          budget: budget,
          dailyPlan: {
            create: { notes: '' },
          },
          tags: {
            createMany: {
              data: tagsToUpdate,
            },
          },
        },
        include: {
          tags: true,
        },
      });

      // CREATE FIRST DAILY PLAN
      console.log('TRIP CREATED', newTrip);

      res.json(newTrip);
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong');
    }
  }
  res.status(500).end('Something went wrong');
});
