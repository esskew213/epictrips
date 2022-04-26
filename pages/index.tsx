import Head from 'next/head';
import React from 'react';

import Loader from '../components/Loader';
import TripCard from '../components/TripCard';
import { GetServerSideProps } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
export const getServerSideProps: GetServerSideProps = async () => {
  const trips = await prisma.trip.findMany({
    where: { public: true },
    include: {
      author: {
        select: { name: true },
      },
      tags: true,
    },
  });
  // need to do JSON parse / stringify as next cannot serialize datetime objects
  return { props: { trips: JSON.parse(JSON.stringify(trips)) } };
};

type Props = {
  trips: TripCardProps[];
};

const Home: React.FC<Props> = (props) => {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;
  return (
    <div className=''>
      <Head>
        <title>Epic Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='text-3xl px-2 py-4 bg-slate-400'>Epic Trips</h1>
        <div className='flex'>
          {props.trips.map((trip) => (
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
      </main>
    </div>
  );
};

export default Home;
