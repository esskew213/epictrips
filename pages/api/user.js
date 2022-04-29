import prisma from '../../lib/prisma';

const userHandler = async (req, res) => {
  // console.log(req.body);
  const {
    body: { id, name },
    method,
  } = req;

  if (method === 'PUT') {
    await prisma.user.upsert({
      where: {
        id: id,
      },
      update: {
        name: name,
      },
      create: {
        id: id,
        name: name,
      },
    });
    res.send(200);
  } else {
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default userHandler;
