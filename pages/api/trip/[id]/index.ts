import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  const { user } = getSession(req, res);
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    // check if authorised
    if (trip.authorId !== user.sub) {
      res.status(401).json({ status: '401' });
    }
    console.log(trip);
    res.json(trip);
  } catch (err) {
    console.error(err);
  }
});