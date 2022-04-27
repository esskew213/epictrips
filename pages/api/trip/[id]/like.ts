import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  console.log(req.body);
  const { method, body } = req;
  const { user } = getSession(req, res);
  console.log(body);
  if (method === 'PUT') {
    try {
      await prisma.tripLike.upsert({
        where: {
          id: body.likedId,
        },
        update: {
          liked: body.liked,
        },
        create: {
          userId: user.sub,
          tripId: parseInt(id),
          liked: body.liked,
        },
      });
      res.json('like upserted');
    } catch (err) {
      console.error(err);
    }
  }
});
