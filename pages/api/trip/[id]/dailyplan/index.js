import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createDailyPlan(req, res) {
  // get trip id
  const { method } = req;
  const { user } = getSession(req, res);

  if (method === 'DELETE') {
    const { id } = req.query;
    if (Boolean(!parseInt(id))) {
      res.status(404).end();
    }
    const { toDeleteId } = req.body;

    try {
      const dayToDelete = await prisma.dailyPlan.findUnique({
        where: {
          id: parseInt(toDeleteId),
        },
      });
      console.log('dayToDelete', dayToDelete);

      const newCurrentDay = await prisma.dailyPlan.findUnique({
        where: {
          predecessorId: parseInt(toDeleteId),
        },
      });

      // check if prev day exists
      let currentPrevDay = null;
      if (dayToDelete.predecessorId) {
        currentPrevDay = await prisma.dailyPlan.findUnique({
          where: {
            id: dayToDelete.predecessorId,
          },
        });
        console.log('currentPrevDay', currentPrevDay);
      }

      const deleteOld = await prisma.dailyPlan.delete({
        where: {
          id: parseInt(toDeleteId),
        },
      });

      if (newCurrentDay && currentPrevDay) {
        const updateNew = await prisma.dailyPlan.update({
          where: {
            id: newCurrentDay.id,
          },
          data: {
            predecessorId: currentPrevDay.id,
          },
        });
        // await prisma.$transaction([updateNew, deleteOld]);
        console.log('deleted with update');
      }
      res.json('deleted');
    } catch (err) {
      console.error(err);
    }
  }

  if (method === 'POST') {
    const { id } = req.query;
    if (Boolean(!parseInt(id))) {
      res.status(404).end();
    }
    const { predecessorId } = req.body;
    try {
      const currentNextDay = await prisma.dailyPlan.findUnique({
        where: {
          predecessorId: parseInt(predecessorId),
        },
      });
      const newNextDay = await prisma.dailyPlan.create({
        data: {
          tripId: parseInt(id),
          notes: '',
        },
      });
      if (currentNextDay) {
        await prisma.dailyPlan.update({
          where: {
            predecessorId: predecessorId,
          },
          data: {
            predecessorId: newNextDay.id,
          },
        });
      }
      await prisma.dailyPlan.update({
        where: { id: newNextDay.id },
        data: {
          predecessorId: parseInt(predecessorId),
        },
      });

      console.log('NEW DAY CREATED', newNextDay);

      res.json(newNextDay);
    } catch (err) {
      console.error(err);
    }
  }

  if (method === 'GET') {
    const { id } = req.query;
    console.log(Boolean(parseInt(id)));
    if (Boolean(!parseInt(id))) {
      res.status(404).end();
    }
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: parseInt(id) },
        include: {
          author: {
            select: { name: true },
          },
          tags: {
            select: { tag: true },
          },
        },
      });
      console.log('TRIP', Boolean(trip));
      if (!trip) {
        console.log('no trip found');
        res.status(404).end();
      }

      if (trip.authorId !== user.sub) {
        res.status(401).end('Not authorised');
      }
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const dateStr = trip.startDate.toLocaleDateString(undefined, options);

      // retrieve daily plans associated with that trip
      const dailyPlans = await prisma.dailyPlan.findMany({
        where: { tripId: parseInt(id) },
      });

      // Get predecessor id to daily plan mapping
      const predecessorIdToPlanMap = dailyPlans.reduce(function (map, plan) {
        map[plan.predecessorId] = plan;
        return map;
      }, {});

      // Find day 1
      let firstPlan = null;
      for (let plan of dailyPlans) {
        if (plan.predecessorId === null) {
          firstPlan = plan;
        }
      }

      // Traverse the daily plans from day 1 to last day
      const sortedPlans = [];
      let currentPlan = firstPlan;
      while (true) {
        sortedPlans.push(currentPlan);
        currentPlan = predecessorIdToPlanMap[currentPlan.id];
        if (!currentPlan) {
          break;
        }
      }

      res.json({
        trip: JSON.parse(JSON.stringify(trip)),
        dateStr,
        dailyPlans: JSON.parse(JSON.stringify(sortedPlans)),
      });
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  }

  res.status(500).end('Something went wrong.');
});
