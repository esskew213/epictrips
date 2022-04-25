import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../../lib/prisma';

// API to fetch existing trip given id
export default withApiAuthRequired(async function createTrip(req, res) {
  const { id } = req.query;
  const { user } = getSession(req, res);
  console.log(id, user);
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    console.log(trip);
    res.json(trip);
  } catch (err) {
    console.error(err);
  }
});
