import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import Router, { useRouter } from 'next/router';
import { getSession } from '@auth0/nextjs-auth0';
import { useUser } from '@auth0/nextjs-auth0';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = parseInt(context.params.id);
  const { req, res } = context;
  //   const { user } = getSession(req, res);
  // retrieve the trip
  const trip = await prisma.trip.findUnique({
    where: { id: id },
  });

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
    },
  };
};

//*********************************//
//*********** COMPONENT ***********//
//*********************************//
const Summary = ({ trip, dateStr, dailyPlans }) => {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  if (isLoading)
    return (
      <div className='w-max-screen h-max-screen flex items-center justify-center'>
        <Loader />
      </div>
    );
  if (error) return <div>{error.message}</div>;
  // runs when user is done with entire page
  const handlePublish = async (evt) => {
    evt.preventDefault();
    try {
      const res = await fetch(`/api/trip/${trip.id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      <h2>{`by ${user.name}` || null}</h2>
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
      <div>
        <button className='bg-orange-400' onClick={(e) => handlePublish(e)}>
          Publish
        </button>
        <button className='bg-blue-400' onClick={(e) => handleSave()}>
          Save Draft
        </button>
      </div>
    </div>
  );
};

export default withPageAuthRequired(Summary);
