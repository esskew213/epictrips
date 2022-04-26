import Head from 'next/head';
import React from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { getSession } from '@auth0/nextjs-auth0';
import Loader from '../components/Loader';
import TripCard from '../components/TripCard';
import { GetServerSideProps } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    const { req, res } = context;
    const userId = context.params.uid;
    const { user } = getSession(req, res);
    const isAuthor: Boolean = user.sub === userId;
    console.log('isAuthor?', isAuthor);

    const author = await prisma.user.findUnique({
      where: { id: userId },
    });
    console.log(author);
    // find the trips this author has published
    const trips = await prisma.trip.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: { name: true },
        },
        tags: true,
      },
    });
    // need to do JSON parse / stringify as next cannot serialize datetime objects
    return {
      props: {
        trips: JSON.parse(JSON.stringify(trips)),
        isAuthor: isAuthor,
        authorName: author.name,
      },
    };
  },
});

type Props = {
  trips: TripCardProps[];
  isAuthor: Boolean;
  authorName: string;
};

const Profile: React.FC<Props> = ({ trips, isAuthor, authorName }) => {
  const { user, error, isLoading } = useUser();
  if (isLoading)
    return (
      <div className='w-max-screen h-max-screen flex items-center justify-center'>
        <Loader />
      </div>
    );
  if (error) return <div>{error.message}</div>;

  const publicTrips = trips.filter((trip) => trip.public === true);
  const privateTrips = trips.filter((trip) => trip.public === false);
  return (
    <div className=''>
      <Head>
        <title>Epic Trip | My Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='text-3xl px-2 py-4 bg-slate-400'>{authorName}</h1>
        <h2>Published Trips</h2>
        <div className='flex'>
          {publicTrips.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              author={trip.author}
              title={trip.title}
              tags={trip.tags}
            />
          ))}
        </div>

        {isAuthor && (
          <>
            <h2>My Drafts</h2>
            <div className='flex'>
              {privateTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  author={trip.author}
                  title={trip.title}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
