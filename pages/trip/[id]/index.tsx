import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

//*********************************//
//*********** COMPONENT ***********//
//*********************************//
const TripDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);
  const initialState = {};
  const [notes, setNotes] = useState('');
  const [dailyPlans, setDailyPlans] = useState([]);
  const [trip, setTrip] = useState({});
  const [date, setDate] = useState('');
  const [requireReload, setRequireReload] = useState(false);
  useEffect(() => {
    const getDailyPlans = async () => {
      try {
        const res = await fetch(`/api/trip/${id}/dailyplan`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 401) {
          router.push('/');
        }
        const data = await res.json();
        console.log(data);
        setDate(data.dateStr);
        setTrip(data.trip);
        setDailyPlans(data.dailyPlans);
        for (let plan of data.dailyPlans) {
          const { id, notes } = plan;
          initialState[id] = notes || '';
        }
        console.log(initialState);
        setNotes(initialState);
        setRequireReload(false);
      } catch (err) {
        console.error(err);
      }
    };
    getDailyPlans();
  }, [requireReload]);
  // set initial state

  // handle typing
  const handleNotesChange = (evt, id) => {
    console.log('NOTES', notes);
    setNotes({ ...notes, [id]: evt.target.value });
  };

  // to save notes
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
    // first save all notes
    try {
      await handleSave();
    } catch (err) {
      console.error(err);
    }

    // then add a new day
    const body = { predecessorId: dailyPlanId };
    try {
      const res = await fetch(`/api/trip/${trip.id}/dailyplan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error(err);
    }
    setRequireReload(true);
  };

  // runs when user is done with entire page
  const handlePageSubmit = async (evt) => {
    evt.preventDefault();
    try {
      await handleSave();
    } catch (err) {
      console.error(err);
    }
    router.push(`/trip/${trip.id}/summary`);
  };

  return (
    <div>
      <h1 className='text-3xl'>Add details to {trip?.title || 'your trip'}</h1>
      <h2>{date || null}</h2>
      {dailyPlans &&
        dailyPlans.map((plan, idx) => {
          return (
            <div className='bg-slate-200 p-6' key={plan.id}>
              <h4>Day {idx + 1}</h4>
              <form>
                <input
                  type='textarea'
                  value={notes[plan.id] || ''}
                  onChange={(e) => {
                    handleNotesChange(e, plan.id);
                  }}
                />
                <button onClick={(evt) => handleAddDay(evt, plan.id)}>
                  Add day
                </button>
              </form>
            </div>
          );
        })}
      <div>
        <button className='bg-orange-400' onClick={(e) => handlePageSubmit(e)}>
          SAVE ITINERARY
        </button>
      </div>
    </div>
  );
};

export default withPageAuthRequired(TripDetails);
