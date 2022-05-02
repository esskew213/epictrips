import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function updateDailyPlans(req, res) {
  const { id } = req.query;
  if (Boolean(!parseInt(id))) {
    res.status(404).end();
  }
  const { body, method } = req;
  const { user } = getSession(req, res);
  console.log(id, user);
  if (method === 'PUT') {
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
      res.status(500).end('Something went wrong.');
    }
  }
  res.status(500).end('Something went wrong.');
});
