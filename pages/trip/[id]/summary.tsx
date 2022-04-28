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
export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    const id = parseInt(context.params.id);
    const { req, res } = context;
    const { user } = getSession(req, res);
    // retrieve the trip
    const trip = await prisma.trip.findUnique({
      where: { id: id },
      include: {
        likes: {
          where: {
            userId: user.sub,
          },
        },
      },
    });
    console.log(trip.likes);
    // if trip is not found, redirect user to home
    if (!trip) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
    }
    // if (user.sub !== trip.authorId) {
    //   return {
    //     redirect: {
    //       permanent: false,
    //       destination: '/',
    //     },
    //   };
    // }

    const author = await prisma.user.findUnique({
      where: { id: trip.authorId },
    });
    const isAuthor = Boolean(user.sub === trip.authorId);

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
    // const liked = await prisma.tripLike.findUnique({
    //   where: {
    //    userId: user.sub,
    //     tripId: tr
    //   }
    // })
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

    return {
      props: {
        trip: JSON.parse(JSON.stringify(trip)),
        dateStr,
        dailyPlans: JSON.parse(JSON.stringify(sortedPlans)),
        isAuthor,
        authorName: author.name,
        authorId: author.id,
      },
    };
  },
});

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
}) => {
  const [liked, setLiked] = useState(trip?.likes[0]?.liked || false);
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const { public: published } = trip;
  if (!isAuthor && !published) {
    router.push('/');
  }
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
    router.push(`/${user.sub}`);
  };
  const toggleLike = async () => {
    const likedId = trip.likes[0]?.id || 0;
    const body = { tripId: trip.id, likedId: likedId, liked: !liked };
    console.log(body);
    try {
      const res = await fetch(`/api/trip/${trip.id}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setLiked((prevState) => !prevState);
      router.replace(router.asPath);
    } catch (err) {
      console.error(err);
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
      <div>
        <h1 className='text-3xl'>Trip Summary: {trip.title || 'Your Trip'}</h1>
        <button onClick={toggleLike}>
          {liked ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
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
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
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
      <h2>
        by{' '}
        <Link href={`/${authorId}`}>
          <a>{authorName}</a>
        </Link>
      </h2>

      <h4>{dateStr || null}</h4>
      {dailyPlans &&
        dailyPlans.map((plan, idx) => {
          return (
            <div className='bg-slate-200 p-6' key={plan.id}>
              <h4>
                Day {idx + 1}: {calcDate(trip, idx + 1)}
              </h4>
              <p className='whitespace-pre-line'>{plan.notes}</p>
            </div>
          );
        })}
      {isAuthor && (
        <div>
          <button
            className='bg-blue-400'
            onClick={(e) => router.push(`/trip/${trip.id}`)}
          >
            Edit trip
          </button>
          <button className='bg-blue-400' onClick={(e) => handleSave()}>
            Save to drafts
          </button>
          <button className='bg-orange-400' onClick={(e) => togglePublish(e)}>
            {published ? 'Make private' : 'Publish'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Summary;
