import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import Router, { useRouter } from 'next/router';
import { getSession } from '@auth0/nextjs-auth0';
import { useUser } from '@auth0/nextjs-auth0';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';
import Link from 'next/link';
export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    const id = parseInt(context.params.id);
    const { req, res } = context;
    const { user } = getSession(req, res);
    // retrieve the trip
    const trip = await prisma.trip.findUnique({
      where: { id: id },
    });
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
  const router = useRouter();
  const { public: published } = trip;
  if (!isAuthor && !published) {
    router.push('/');
  }

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
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };
  const handleSave = () => {
    router.push('/');
  };
  return (
    <div>
      <h1 className='text-3xl'>Trip Summary: {trip.title || 'Your Trip'}</h1>

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
              <h4>Day {idx + 1}</h4>
              <p>{plan.notes}</p>
            </div>
          );
        })}
      {isAuthor && (
        <div>
          <button className='bg-orange-400' onClick={(e) => togglePublish(e)}>
            {published ? 'Make Private' : 'Publish'}
          </button>
          <button className='bg-blue-400' onClick={(e) => handleSave()}>
            Save Draft
          </button>
        </div>
      )}
    </div>
  );
};

export default Summary;
