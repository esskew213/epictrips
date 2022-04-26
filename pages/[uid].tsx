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
import Link from 'next/link';

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
      <main className='w-screen'>
        <h1 className='text-3xl px-2 py-4 bg-slate-400'>{authorName}</h1>
        <div className='container w-max mx-auto'>
          <h2 className='text-xl uppercase tracking-wider mr-4'>
            Published Trips
          </h2>
          <div className='grid place-content-between xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-x-12 gap-y-0'>
            {publicTrips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                author={trip.author}
                title={trip.title}
                tags={trip.tags}
                budget={trip.budget}
              />
            ))}
          </div>

          {isAuthor && (
            <>
              <h2 className='xs:block sm:inline-block text-xl uppercase tracking-wider mr-4'>
                My Drafts
              </h2>
              <button className=' xs:block sm:inline-block px-2 py-1 rounded-md bg-cyan-500 transition ease-in-out duration-150 hover:shadow-md hover:-translate-y-1 hover:text-white hover:bg-teal-700'>
                <Link href='/trip'>
                  <a>Add Trip</a>
                </Link>
              </button>

              <div className='grid place-content-between xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-x-12 gap-y-0'>
                {privateTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    author={trip.author}
                    title={trip.title}
                    tags={trip.tags}
                    budget={trip.budget}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
