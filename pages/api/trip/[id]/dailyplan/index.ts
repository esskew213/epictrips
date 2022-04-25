import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createDailyPlan(req, res) {
  // get trip id
  const { id } = req.query;
  const { predecessorId } = req.body;
  const { user } = getSession(req, res);
  console.log(id, user);
  try {
    const currentNextDay = await prisma.dailyPlan.findUnique({
      where: {
        predecessorId: predecessorId,
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

    console.log('NEW DAY', newNextDay);

    res.json(newNextDay);
  } catch (err) {
    console.error(err);
  }
});
