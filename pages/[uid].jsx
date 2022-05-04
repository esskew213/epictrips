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
import HeadComponent from '../components/Head';

export const getServerSideProps = async (context) => {
  const { req, res } = context;
  const authorId = context.params.uid;
  let isAuthor = false;
  const session = getSession(req, res);
  if (session) {
    isAuthor = Boolean(session.user.sub === authorId);
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      likedTrips: {
        include: {
          trip: {
            include: {
              author: {
                select: { name: true },
              },
              tags: true,
              _count: { select: { likes: true } },
            },
            // orderBy: {
            //   updatedAt: 'desc',
            // },
          },
        },
      },
    },
  });

  if (!author) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  // find the public trips this author has published
  const trips = await prisma.trip.findMany({
    where: { authorId: authorId },
    include: {
      author: {
        select: { name: true },
      },
      tags: true,
      _count: { select: { likes: true } },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  // need to do JSON parse / stringify as next cannot serialize datetime objects
  return {
    props: {
      trips: JSON.parse(JSON.stringify(trips)),
      isAuthor: isAuthor,
      author: {
        name: author.name,
        bio: author.bio,
        likedTrips: JSON.parse(JSON.stringify(author.likedTrips)),
      },
    },
  };
};

// type Props = {
//   trips: TripCardProps[];
//   isAuthor: Boolean;
//   author: { name: string; bio: string };
// };

const Profile = ({ trips, isAuthor, author }) => {
  console.log('LIKES', author.likedTrips.trip);
  const router = useRouter();
  const [bio, setBio] = useState(author.bio || '');
  const [authorName, setAuthorName] = useState(author.name || '');
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
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

  const handleBioChange = (e) => {
    if (bio.length === 0 && e.target.value === ' ') {
      setBio('');
    } else {
      setBio(e.target.value);
    }
  };
  const toggleBioEditing = () => {
    setEditing((prevState) => !prevState);
  };
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bio.trim()),
      });
      toggleBioEditing();
      router.replace(router.asPath);
      // toggleEditing();
    } catch (err) {
      console.error(err);
    }
  };
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/${uid}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorName),
      });
      toggleNameEditing();
      router.replace(router.asPath);
      // toggleEditing();
    } catch (err) {
      console.error(err);
    }
  };
  const handleNameChange = (e) => {
    if (authorName.length === 0 && e.target.value === ' ') {
      setAuthorName('');
    } else {
      setAuthorName(e.target.value);
    }
  };
  const toggleNameEditing = () => {
    setEditingName((prevState) => !prevState);
  };

  return (
    <div>
      <HeadComponent title={'Dashboard'} />
      <main className='w-screen'>
        <div className='container w-5/6 mx-auto'>
          {isAuthor ? (
            <div className='mb-12'>
              {editingName ? (
                <div className='flex w-full'>
                  <form
                    onSubmit={handleNameSubmit}
                    className='w-full flex-row items-end sm:flex sm:justify-between'
                  >
                    <input
                      autoFocus
                      required
                      type='text'
                      onChange={handleNameChange}
                      value={authorName}
                      className='block h-fit text-3xl sm:text-4xl lg:text-5xl text-cyan-700 mt-8 mb-4 font-serif w-full sm:w-5/6 sm:mb-0 lg:w-11/12 sm:inline-block rounded-xl border border-slate-400'
                    />
                    <button className='text-sm font-semibold text-cyan-500 w-full h-fit sm:w-24 block xs:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-250 hover:shadow-md hover:text-white  group  hover:bg-cyan-500'>
                      Save
                    </button>
                  </form>
                </div>
              ) : (
                <div className='w-full sm:flex items-baseline sm:justify-between'>
                  <h1 className='text-3xl pl-2 lg:pl-4 border-l-4 lg:border-l-8 border-l-cyan-700 text-cyan-700 sm:text-4xl lg:text-5xl w-max mt-8 mb-4 font-serif'>
                    {author?.name || 'Name'}
                  </h1>
                  <button
                    onClick={toggleNameEditing}
                    className='text-sm font-semibold text-cyan-500 w-full h-fit sm:w-24 block xs:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-250 hover:shadow-md hover:text-white  group  hover:bg-cyan-500'
                  >
                    Edit
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 text-cyan-500 inline-block ml-2 -translate-y-0.5 group-hover:text-white transition ease-in-out duration-250'
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
                </div>
              )}
            </div>
          ) : (
            <h1 className='text-3xl pl-2 lg:pl-4 border-l-4 lg:border-l-8 border-l-cyan-700 text-cyan-700 sm:text-4xl lg:text-5xl w-max mt-8 mb-4 font-serif'>
              {author?.name || 'Name'}
            </h1>
          )}

          {isAuthor ? (
            <div className='mb-12'>
              {editing ? (
                <div className='flex w-full'>
                  <form
                    id='bio'
                    onSubmit={handleBioSubmit}
                    className='w-full sm:flex items-end  sm:justify-between'
                  >
                    <textarea
                      maxLength={1000}
                      autoFocus
                      form='bio'
                      onChange={handleBioChange}
                      value={bio}
                      className='block w-full h-36 sm:h-20 sm:w-5/6 mb-4 sm:mb-0 lg:w-11/12 sm:inline-block rounded-xl border border-slate-400'
                    />
                    <button className='text-sm font-semibold text-cyan-500 w-full h-fit sm:w-24 block xs:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-250 hover:shadow-md hover:text-white  group  hover:bg-cyan-500'>
                      Save
                    </button>
                  </form>
                </div>
              ) : (
                <div className='w-full sm:flex sm:justify-between'>
                  <div className='block w-full  mb-4 sm:mb-0 sm:w-5/6 lg:w-11/12 sm:inline-block pr-4'>
                    {author?.bio || 'Tell the world about yourself!'}
                  </div>
                  <button
                    onClick={toggleBioEditing}
                    className='text-sm font-semibold text-cyan-500 w-full self-baseline h-fit sm:w-24 block xs:inline-block px-1 py-1 rounded-md border border-cyan-500 transition ease-in-out duration-250 hover:shadow-md hover:text-white  group  hover:bg-cyan-500'
                  >
                    Edit
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 text-cyan-500 inline-block ml-2 -translate-y-0.5 group-hover:text-white transition ease-in-out duration-250'
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
                </div>
              )}
            </div>
          ) : (
            <div className='block mb-12 w-full  sm:inline-block'>
              {author?.bio || 'Bio'}
            </div>
          )}
          <div className='border-b border-b-slate-200 h-8 mb-4'>
            <h2 className='text-xl uppercase tracking-wider mr-4 font-semibold '>
              Published Trips
            </h2>
          </div>
          <div className='overflow-y-auto flex flex-nowrap w-full mb-8'>
            {publicTrips.length > 0 ? (
              publicTrips.map((trip) => (
                <span className='mr-8' key={trip.id}>
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    author={trip.author}
                    title={trip.title}
                    tags={trip?.tags}
                    budget={trip.budget}
                    likes={trip._count?.likes}
                  />
                </span>
              ))
            ) : (
              <p className='text-sm text-slate-700'>
                No published trips yet. Try publishing one of your drafts!
              </p>
            )}
          </div>

          {isAuthor && (
            <>
              <div className='border-b border-b-slate-200 h-12 flex justify-between items-center mb-4'>
                <h2 className='inline-block text-xl uppercase tracking-wider mr-4 font-semibold'>
                  My Drafts
                </h2>
                <button className='group text-sm font-semibold inline-block w-max px-2 py-1 h-fit rounded-md bg-yellow-400 transition ease-in-out duration-250 hover:shadow-md hover:text-white hover:bg-yellow-600'>
                  <Link href='/trip'>
                    <a className=''>
                      Add Trip
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 ml-2 group-hover:text-white inline-block transition ease-in-out duration-250'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </a>
                  </Link>
                </button>
              </div>
              <div className='overflow-y-auto flex flex-nowrap w-full mb-8'>
                {privateTrips.length > 0 ? (
                  privateTrips.map((trip) => (
                    <span className='mr-8' key={trip.id}>
                      <TripCard
                        key={trip.id}
                        id={trip.id}
                        author={trip.author}
                        title={trip.title}
                        tags={trip?.tags}
                        budget={trip.budget}
                        likes={trip._count?.likes}
                      />
                    </span>
                  ))
                ) : (
                  <p className='text-sm text-slate-700'>
                    No drafts yet. Try adding a new trip!
                  </p>
                )}
              </div>
            </>
          )}

          {isAuthor && (
            <>
              <div className='border-b border-b-slate-200 h-12 flex justify-between items-center mb-4'>
                <h2 className='inline-block text-xl uppercase tracking-wider mr-4 font-semibold'>
                  My Favourites
                </h2>
              </div>
              <div className='overflow-y-auto flex flex-nowrap w-full mb-8'>
                {author?.likedTrips?.length > 0 ? (
                  author.likedTrips.map((trip) => (
                    <span className='mr-8' key={trip.trip.id}>
                      <TripCard
                        id={trip.trip.id}
                        author={trip.trip.author}
                        title={trip.trip.title}
                        tags={trip.trip?.tags}
                        budget={trip.trip.budget}
                        likes={trip.trip?._count?.likes}
                      />
                    </span>
                  ))
                ) : (
                  <p className='text-sm text-slate-700'>No favourites yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
