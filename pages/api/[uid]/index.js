import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createTrip(req, res) {
  const { uid } = req.query;
  const { method, body } = req;
  const { user } = getSession(req, res);

  if (method === 'PUT') {
    try {
      if (uid === user.sub) {
        await prisma.user.update({
          where: {
            id: uid,
          },
          data: {
            bio: body,
          },
        });
        console.log(uid);
        res.json('bio updated');
      }

      res.status(401).end('Not authorised');
    } catch (err) {
      console.error(err);
      res.status(500).end('Something went wrong.');
    }
  }
});
