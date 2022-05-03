import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  const { method } = req;
  const { user } = getSession(req, res);
  if (Boolean(!parseInt(id))) {
    res.status(404).end();
    return;
  }
  if (method === 'POST') {
    try {
      await prisma.tripLike.create({
        data: {
          userId: user.sub,
          tripId: parseInt(id),
        },
      });
      res.json('like upserted');
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else if (method === 'DELETE') {
    try {
      await prisma.tripLike.deleteMany({
        where: {
          userId: user.sub,
          tripId: parseInt(id),
        },
      });
      res.json('like deleted');
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else {
    res.status(405).end('Method not allowed.');
  }
});
