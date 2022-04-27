import Head from 'next/head';
import React, { useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { getSession } from '@auth0/nextjs-auth0';
import Loader from '../components/Loader';
import TripCard from '../components/TripCard';
import { GetServerSideProps } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import prisma from '../lib/prisma';
import { TripCardProps } from '../components/TripCard';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
        author: { name: author.name, bio: author.bio },
      },
    };
  },
});

type Props = {
  trips: TripCardProps[];
  isAuthor: Boolean;
  author: { name: string; bio: string };
};

const Profile: React.FC<Props> = ({ trips, isAuthor, author }) => {
  const router = useRouter();
  const [bio, setBio] = useState(author.bio);
  const [editing, setEditing] = useState(false);
  const { user, error, isLoading } = useUser();
  const { uid } = router.query;
  if (isLoading)
    return (
      <div className='w-max-screen h-max-screen flex items-center justify-center'>
        <Loader />
      </div>
    );
  if (error) return <div>{error.message}</div>;

  const publicTrips = trips.filter((trip) => trip.public === true);
  const privateTrips = trips.filter((trip) => trip.public === false);

  const handleChange = (e) => {
    setBio(e.target.value);
  };
  const toggleEditing = () => {
    setEditing((prevState) => !prevState);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bio),
      });
      toggleEditing();
      router.replace(router.asPath);
      // toggleEditing();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <Head>
        <title>Epic Trip | My Trips</title>
        <meta name='description' content='Inspiration for your next getaway' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='w-screen'>
        <div className='container w-5/6 mx-auto'>
          <h1 className='text-4xl w-max py-4 text-slate-700'>{author?.name}</h1>
          <div>
            {editing ? (
              <div>
                <form onSubmit={handleSubmit}>
                  <input
                    onChange={handleChange}
                    value={bio}
                    type='text'
                  ></input>
                  <button className='text-sm text-cyan-500 xs:block sm:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-150 hover:shadow-md hover:-translate-y-1 hover:text-white hover:bg-teal-700'>
                    Save Bio
                  </button>
                </form>
              </div>
            ) : (
              <div>{author?.bio || 'Bio'}</div>
            )}
            {editing ? null : (
              <button
                onClick={toggleEditing}
                className='text-sm text-cyan-500  xs:block sm:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-150 hover:shadow-md hover:-translate-y-1 hover:text-white hover:bg-cyan-500'
              >
                Edit Bio
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-cyan-500 inline-block ml-2 -translate-y-0.5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z' />
                  <path
                    fillRule='evenodd'
                    d='M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            )}
          </div>
          <h2 className='text-xl uppercase tracking-wider mr-4 border-b border-b-slate-200'>
            Published Trips
          </h2>
          <div className='grid place-content-between xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-x-12 gap-y-0 mb-8'>
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
              <div className='border-b border-b-slate-200'>
                <h2 className='xs:block sm:inline-block text-xl uppercase tracking-wider mr-4 '>
                  My Drafts
                </h2>
                <button className=' xs:block sm:inline-block px-2 py-0 rounded-md bg-cyan-500 transition ease-in-out duration-150 hover:shadow-md hover:-translate-y-1 hover:text-white hover:bg-teal-700'>
                  <Link href='/trip'>
                    <a>Add Trip</a>
                  </Link>
                </button>
              </div>
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
