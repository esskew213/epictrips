import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  const { method } = req;
  const { user } = getSession(req, res);
  if (Boolean(!parseInt(id))) {
    return res.status(404).end();
  }
  if (method === 'GET') {
    try {
      const trip = await prisma.trip.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          author: {
            select: { name: true },
          },
          tags: {
            select: { tag: true },
          },
        },
      });

      // check if authorised
      if (trip.authorId !== user.sub) {
        res.status(401).end('Not authorised');
        return;
      }
      console.log(trip);
      res.json(trip);
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else if (method === 'DELETE') {
    try {
      const trip = await prisma.trip.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (trip.authorId !== user.sub) {
        res.status(401).end('Not authorised');
        return;
      } else {
        await prisma.trip.delete({
          where: {
            id: parseInt(id),
          },
        });
        res.json(`trip ${id} deleted`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else if (method === 'PUT') {
    const { title, startDate, budget, tags } = req.body;
    try {
      const trip = await prisma.trip.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (trip.authorId !== user.sub) {
        res.status(401).end('Not authorised');
        return;
      }

      const tagsToUpdate = [];
      for (let [key, value] of Object.entries(tags)) {
        if (value) {
          tagsToUpdate.push({
            tag: key,
          });
        }
      }

      const deleteTags = await prisma.tripTag.deleteMany({
        where: {
          tripId: parseInt(id),
        },
      });
      const updatedTrip = await prisma.trip.update({
        where: {
          id: parseInt(id),
        },
        data: {
          title: title,
          startDate: startDate,
          budget: budget,
          tags: {
            createMany: {
              data: tagsToUpdate,
            },
          },
        },
      });

      res.json('UPDATED');
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else {
    res.status(405).end('Method not allowed.');
    return;
  }
});
