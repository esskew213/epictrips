import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../lib/prisma';
import Id from '../api/trip/[id]';
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

// COMPONENT
const TripDetails = ({ trip, dateStr, dailyPlans }) => {
  // INITIAL STATE
  const initialState = {};
  for (let plan of dailyPlans) {
    const { id, notes } = plan;
    initialState[id] = notes || '';
  }
  // console.log('INITIAL STATE', initialState);

  const [notes, setNotes] = useState(initialState);
  const handleNotesChange = (evt, id) => {
    console.log('NOTES', notes);
    setNotes({ ...notes, [id]: evt.target.value });
  };

  const handleSave = async () => {
    const res = await fetch(`/api/trip/${trip.id}/dailyplan/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    });
  };
  // adds a new day when button is clicked
  const handleAddDay = async (evt, dailyPlanId) => {
    evt.preventDefault();
    await handleSave();
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
            <input
              type='textarea'
              value={notes[plan.id]}
              onChange={(e) => {
                handleNotesChange(e, plan.id);
              }}
            />
            <button onClick={(evt) => handleAddDay(evt, plan.id)}>
              Add day
            </button>
          </form>
        );
      })}
    </div>
  );
};

export default TripDetails;
