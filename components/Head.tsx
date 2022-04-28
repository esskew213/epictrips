import React from 'react';
import Head from 'next/head';
const HeadComponent = ({ title }) => {
  return (
    <Head>
      <title>EpicTrips | {title}</title>
      <meta name='description' content='Inspiration for your next getaway' />
      <link rel='icon' href='/favicon.ico' />
    </Head>
  );
};

export default HeadComponent;
