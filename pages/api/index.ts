import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../lib/prisma';

// API to create new trip
export default withApiAuthRequired(async function searchTrips(req, res) {
  const { user } = getSession(req, res);

  if (req.method === 'POST') {
    const { body } = req;
    console.log('searching for', body);
    try {
      const titleMatches = await prisma.trip.findMany({
        where: {
          public: true,
          title: {
            search: body,
          },
        },
        include: {
          author: {
            select: { name: true },
          },
          tags: true,
        },
      });
      const notesMatches = await prisma.trip.findMany({
        where: {
          public: true,
          dailyPlan: {
            some: {
              notes: {
                search: body,
              },
            },
          },
        },
        include: {
          author: {
            select: { name: true },
          },
          tags: true,
        },
      });
      console.log(titleMatches);
      console.log(notesMatches);
      const matchingTrips = Array.from(
        new Set([...titleMatches, ...notesMatches])
      );
      res.json(matchingTrips);
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  }
});
