import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../lib/prisma';
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = parseInt(context.params.id);
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
  console.log(trip);

  // retrieve daily plans associated with that trip
  const dailyPlans = await prisma.dailyPlan.findMany({
    where: { tripId: id },
    include: {
      trip: true, // Return all fields
    },
  });
  console.log('dailyplans', dailyPlans);
  return {
    props: {
      trip: JSON.parse(JSON.stringify(trip)),
      dateStr,
      dailyPlans: JSON.parse(JSON.stringify(dailyPlans)),
    },
  };
};

const TripDetails = ({ trip, dateStr, dailyPlans }) => {
  const handleAddDay = async (dailyPlanId) => {
    const body = { predecessorId: dailyPlanId };
    const res = await fetch(`/api/trip/${trip.id}/dailyplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };
  return (
    <div>
      <h1 className='text-3xl'>Add details to {trip.title}</h1>
      <h2>{dateStr}</h2>
      {dailyPlans.map((plan) => {
        return (
          <form key={plan.id} className='bg-slate-200 p-6'>
            <input type='textarea' defaultValue={plan.notes} />
            <button onClick={() => handleAddDay(plan.id)}>Add day</button>
          </form>
        );
      })}
    </div>
  );
};

export default TripDetails;
