import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createDailyPlan(req, res) {
  // get trip id

  const { id } = req.query;
  const { predecessorId } = req.body;
  const { user } = getSession(req, res);
  try {
    console.log('1111111111111111111111111');
    const currentNextDay = await prisma.dailyPlan.findUnique({
      where: {
        predecessorId: predecessorId,
      },
    });
    console.log(currentNextDay);
    const newNextDay = await prisma.dailyPlan.create({
      data: {
        tripId: parseInt(id),
        notes: '',
      },
    });
    console.log(newNextDay);
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
});
