import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  const { method, body } = req;
  const { user } = getSession(req, res);
  if (Boolean(!parseInt(id))) {
    res.status(404).end();
  }
  console.log(body);
  if (method === 'PUT') {
    try {
      await prisma.trip.update({
        where: {
          id: parseInt(id),
        },
        data: {
          public: body,
        },
      });
      res.json('published');
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  } else {
    res.status(405).end('Method not allowed.');
  }
});
