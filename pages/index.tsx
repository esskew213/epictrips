import Head from 'next/head';
import React from 'react';
import Image from 'next/image';
const Home: React.FC = () => {
  return (
    <div className=''>
      <Head>
        <title>Epic Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1 className='text-3xl px-2 py-4 bg-slate-400'>Epic Trips</h1>
      </main>
    </div>
  );
};

export default Home;
