import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import Router, { useRouter } from 'next/router';
import { getSession } from '@auth0/nextjs-auth0';
import { useUser } from '@auth0/nextjs-auth0';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';
import Link from 'next/link';
import HeadComponent from '../../../components/Head';
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = parseInt(context.params.id);
  const { req, res } = context;
  const session = getSession(req, res);
  let isAuthor = false;
  let likedByUser = false;
  const trip = await prisma.trip.findUnique({
    where: { id: id },
    include: {
      _count: { select: { likes: true } },
      author: {
        select: { name: true },
      },
    },
  });
  console.log(trip);
  if (!trip || (!isAuthor && !trip.public)) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  if (session) {
    const like = await prisma.tripLike.findMany({
      where: { userId: session.user.sub, tripId: trip.id },
    });
    console.log('liked?', like);
    if (like.length > 0) {
      likedByUser = true;
    }
    isAuthor = Boolean(session.user.sub === trip.authorId);
  }

  // const author = await prisma.user.findUnique({
  //   where: { id: trip.authorId },
  // });

  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const dateStr = trip.startDate.toLocaleDateString(undefined, options);

  // retrieve daily plans associated with that trip
  const dailyPlans = await prisma.dailyPlan.findMany({
    where: { tripId: id },
    include: {
      trip: true, // Return all fields
    },
  });

  // Get predecessor id to daily plan mapping
  const predecessorIdToPlanMap = dailyPlans.reduce(function (map, plan) {
    map[plan.predecessorId] = plan;
    return map;
  }, {});
  // Find day 1
  let firstPlan = null;
  for (let plan of dailyPlans) {
    if (plan.predecessorId === null) {
      firstPlan = plan;
    }
  }
  // Traverse the daily plans from day 1 to last day
  const sortedPlans = [];
  let currentPlan = firstPlan;
  while (true) {
    sortedPlans.push(currentPlan);
    currentPlan = predecessorIdToPlanMap[currentPlan.id];
    if (!currentPlan) {
      break;
    }
  }
  console.log('liked by user?', likedByUser);
  return {
    props: {
      trip: JSON.parse(JSON.stringify(trip)),
      dateStr,
      dailyPlans: JSON.parse(JSON.stringify(sortedPlans)),
      isAuthor,
      authorName: trip.author.name,
      authorId: trip.authorId,
      likedByUser,
    },
  };
};

//*********************************//
//*********** COMPONENT ***********//
//*********************************//
const Summary = ({
  trip,
  dateStr,
  dailyPlans,
  isAuthor,
  authorName,
  authorId,
  likedByUser,
}) => {
  const [liked, setLiked] = useState(likedByUser);
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const { public: published } = trip;

  if (isLoading)
    return (
      <div className='w-max-screen h-max-screen flex items-center justify-center'>
        <Loader />
      </div>
    );
  if (error) return <div>{error.message}</div>;
  // runs when user is done with entire page
  const togglePublish = async (evt) => {
    evt.preventDefault();
    try {
      const body = !published;
      const res = await fetch(`/api/trip/${trip.id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.push(`/${authorId}`);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSave = () => {
    router.push(`/${authorId}`);
  };
  const toggleLike = async () => {
    // if liked, unlike by deleting entry in DB
    if (liked) {
      try {
        const res = await fetch(`/api/trip/${trip.id}/like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        setLiked((prevState) => !prevState);
        router.replace(router.asPath);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetch(`/api/trip/${trip.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        setLiked((prevState) => !prevState);
        router.replace(router.asPath);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const calcDate = ({ startDate }, increment) => {
    const parsedDate = new Date(startDate);
    const calculatedDate = new Date(
      parsedDate.setDate(parsedDate.getDate() + increment)
    );
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return calculatedDate.toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <HeadComponent title={'Trip Summary'} />
      <main className='w-screen'>
        <div className='container w-5/6 mx-auto relative'>
          <div className='w-full block sm:flex justify-between items-baseline'>
            <div className='flex justify-start items-baseline'>
              <h1 className='inline-block text-xl sm:text-2xl lg:text-3xl w-max mt-8 mb-4 font-serif mr-4'>
                {trip?.title || 'Your Trip'}
              </h1>
              <button className='inline-block mr-4' onClick={toggleLike}>
                {!user ? null : liked ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 md:h-6 md:w-6 text-red-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 md:h-6 md:w-6 text-red-400'
                    fill='none'
                    viewBox='0 0 22 22'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {isAuthor && (
              <span className='sm:flex'>
                <button
                  className='bg-red-400 mr-4 font-semibold text-sm w-full h-fit xs:w-32 mb-4 block sm:inline-block px-2 rounded-md text-sm py-1 hover:bg-red-700 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                  onClick={(e) => router.push(`/trip/${trip.id}`)}
                >
                  Edit Itinerary
                </button>
                <button
                  className='bg-yellow-400 font-semibold text-sm h-full w-full xs:w-32 mb-4 block sm:inline-block px-2 rounded-md text-sm py-1 hover:bg-yellow-500 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                  onClick={(e) => togglePublish(e)}
                >
                  {published ? 'Make private' : 'Publish'}
                </button>
              </span>
            )}
          </div>
          <h2 className='mb-8'>
            by{' '}
            <Link href={`/${authorId}`}>
              <a className='text-cyan-500 font-semibold hover:underline'>
                {authorName}
              </a>
            </Link>
            <br />
            {dateStr || null}
          </h2>

          <div className='grid grid-cols-1 gap-y-4'>
            {dailyPlans &&
              dailyPlans.map((plan, idx) => {
                return (
                  <div
                    className=' flex-wrap w-full mx-auto flex flex-col items-start mb-8'
                    key={plan.id}
                  >
                    <h4 className='font-bold tracking-wide w-full mb-2 border-b border-b-slate-200'>
                      Day {idx + 1}: {calcDate(trip, idx)}
                    </h4>
                    <p className='whitespace-pre-line'>{plan.notes}</p>
                  </div>
                );
              })}
          </div>
          {/* {isAuthor && (
            <div className='fixed drop-shadow-md bottom-5 right-5 grid grid-cols-1 gap-y-1 w-40'>
              <button
                className='bg-red-400 block w-full rounded-md text-sm font-semibold py-1 h-fit mb-2 px-2 hover:bg-red-700 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                onClick={(e) => togglePublish(e)}
              >
                {published ? 'Make private' : 'Publish'}
              </button>
              <button
                className='bg-yellow-400 block w-full rounded-md text-sm font-semibold py-1 h-fit mb-2 px-2 hover:bg-yellow-500 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                onClick={(e) => handleSave()}
              >
                Back to dashboard
              </button>
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
};

export default Summary;
