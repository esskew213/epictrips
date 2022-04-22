import Head from 'next/head';
import React from 'react';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
export const getServerSideProps: GetServerSideProps = async () => {
  const trips = await prisma.trip.findMany({
    where: { public: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  // need to do JSON parse / stringify as next cannot serialize datetime objects
  return { props: { trips: JSON.parse(JSON.stringify(trips)) } };
};

type Props = {
  trips: TripCardProps[];
};

const Home: React.FC<Props> = (props) => {
  return (
    <div className=''>
      <Head>
        <title>Epic Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1 className='text-3xl px-2 py-4 bg-slate-400'>Epic Trips</h1>
        {props.trips.map((trip) => (
          <div key={trip.id}>
            {trip.title} in {trip.destination} by {trip.author.name}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;
