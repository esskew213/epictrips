import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';
import DailyPlanForm from '../../../components/DailyPlanForm';

//*********************************//
//*********** COMPONENT ***********//
//*********************************//
const TripDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);
  const initialState = {};
  const [notes, setNotes] = useState('');
  const [pageLoad, setPageLoad] = useState(true);
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
          return;
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
        setPageLoad(false);
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

  const handleEditTrip = async () => {
    try {
      await handleSave();
      router.push(`/trip/${trip.id}/edit`);
    } catch (err) {
      console.error(err);
    }
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

  // function to dynamically calculate dates of trip
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
  if (pageLoad) return <Loader />;
  return (
    <div className='font-rubik'>
      <h1 className='text-3xl font-rubik'>
        Add details to {trip?.title || 'your trip'}
      </h1>
      <h2 className=''>{date || null}</h2>
      <div className='grid grid-cols-1 gap-y-4'>
        {dailyPlans &&
          dailyPlans.map((plan, idx) => {
            return (
              <DailyPlanForm
                key={idx}
                idx={idx}
                calcDate={calcDate}
                trip={trip}
                notes={notes}
                plan={plan}
                requireReload={requireReload}
                handleAddDay={handleAddDay}
                handleNotesChange={handleNotesChange}
              />
            );
          })}
      </div>
      <div>
        <button
          className='bg-orange-400 font-rubik'
          onClick={(e) => handlePageSubmit(e)}
        >
          SAVE ITINERARY
        </button>
        <button
          className='bg-orange-400 font-rubik'
          onClick={() => handleEditTrip()}
        >
          EDIT TRIP DETAILS
        </button>
      </div>
    </div>
  );
};

export default withPageAuthRequired(TripDetails);
