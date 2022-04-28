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
      likes: {
        where: { liked: true },
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
      <main className='w-screen '>
        <div className='flex flex-col py-6 w-full h-60 mx-auto justify-center items-center	bg-cover bg-center bg-no-repeat bg-search-photo'>
          <p className='font-serif font-black text-white text-2xl lg:text-4xl mb-6 drop-shadow-lg'>
            It's going to be <span className='text-yellow-400'>epic</span>.
          </p>
          <form
            onSubmit={handleSubmit}
            className='w-full flex justify-center mx-auto'
          >
            <input
              className='rounded-full mx-auto w-5/6 h-12 border-none focus:ring-2 focus:ring-cyan-500 drop-shadow-lg'
              type='text'
              value={searchStr}
              onChange={handleChange}
              placeholder='Search for your dream trip'
              autoFocus
            />
          </form>
        </div>

        <div className='w-full sm:w-5/6 mx-auto'>
          <div className='grid w-full place-content-between grid-cols-1 sm:grid-cols-2 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-0'>
            {results.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                author={trip.author}
                title={trip.title}
                tags={trip.tags}
                budget={trip.budget}
                likes={trip.likes.length}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
