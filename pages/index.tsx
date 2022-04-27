import Head from 'next/head';
import React, { useState } from 'react';

import Loader from '../components/Loader';
import TripCard from '../components/TripCard';
import { GetServerSideProps } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [results, setResults] = useState(props.trips);
  const [searchStr, setSearchStr] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStr(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchStr),
      });
      console.log(searchStr);
      router.replace(router.asPath);
      const data = await res.json();
      setResults(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;
  return (
    <div className=''>
      <Head>
        <title>Epic Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='w-screen'>
        <div className='flex py-6 w-full mx-auto justify-center bg-slate-400'>
          <form onSubmit={handleSubmit} className='w-full flex justify-center'>
            <input
              className='rounded-full mx-auto w-4/6 border-none focus:drop-shadow-md'
              type='text'
              value={searchStr}
              onChange={handleChange}
              placeholder='Search for your dream trip'
              autoFocus
            />
          </form>
        </div>

        <div className='container w-max mx-auto'>
          <div className='grid place-content-between xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-x-12 gap-y-0'>
            {results.map((trip) => (
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
        </div>
      </main>
    </div>
  );
};

export default Home;
