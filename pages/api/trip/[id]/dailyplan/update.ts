import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function updateDailyPlans(req, res) {
  const { id } = req.query;
  const { body } = req;
  const { user } = getSession(req, res);
  console.log(id, user);
  try {
    for (const [key, value] of Object.entries(body)) {
      const day = await prisma.dailyPlan.update({
        where: {
          id: parseInt(key),
        },
        data: {
          notes: value,
        },
      });
    }
    res.send('completed update');
  } catch (err) {
    console.error(err);
  }
});
