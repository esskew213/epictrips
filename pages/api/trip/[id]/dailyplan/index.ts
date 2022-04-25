import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createDailyPlan(req, res) {
  // get trip id
  const { method } = req;
  const { user } = getSession(req, res);

  if (method === 'POST') {
    const { id } = req.query;
    console.log(typeof id);
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

    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(id) },
    });

    if (trip.authorId !== user.sub) {
      res.status(401).json({ status: 401 });
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
  }
});
