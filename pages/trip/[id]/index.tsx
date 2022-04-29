import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Loader from '../../../components/Loader';
import DailyPlanForm from '../../../components/DailyPlanForm';
import HeadComponent from '../../../components/Head';
import { useDebounce } from '../../../hook/useDebounce';
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
  const [lastSavedTime, setLastSavedTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
  const [disableButtons, setDisableButtons] = useState(false);
  const [requireReload, setRequireReload] = useState(false);
  const debouncedNotes = useDebounce(notes, 3000);

  useEffect(
    () => {
      if (debouncedNotes) {
        handleSave();
        setLastSavedTime(
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    },
    [debouncedNotes] // Only call effect if debounced search term changes
  );

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
        if (res.status === 404) {
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
    setDisableButtons(true);
    const res = await fetch(`/api/trip/${trip.id}/dailyplan/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    });
    setDisableButtons(false);
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
    <div>
      <HeadComponent title={'Add Details'} />
      <main className='w-screen'>
        <div className='container w-5/6 mx-auto relative'>
          <div className='w-full block sm:flex justify-between items-baseline'>
            <div className='block md:flex items-baseline mt-8 mb-4 '>
              <h1 className='text-xl shrink-0 sm:text-2xl lg:text-3xl font-serif mr-2'>
                {trip?.title || 'your trip'}
              </h1>
              <span className='text-xs shrink-0 text-slate-400 italic mr-4'>
                {disableButtons ? 'Saving...' : `Last saved ${lastSavedTime}`}
              </span>
            </div>
            <span className='block md:flex'>
              <button
                disabled={disableButtons}
                className='bg-red-400 mr-2 font-semibold text-sm w-full h-fit sm:w-32 mb-4 block sm:inline-block px-2 rounded-md text-sm py-1 hover:bg-red-700 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                onClick={() => handleEditTrip()}
              >
                Edit trip details
              </button>
              <button
                disabled={disableButtons}
                className='bg-yellow-400 font-semibold text-sm h-full w-full sm:w-32 mb-4 block sm:inline-block px-2 rounded-md text-sm py-1 hover:bg-yellow-500 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
                onClick={(e) => handlePageSubmit(e)}
              >
                Preview
              </button>
            </span>
          </div>
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
                    disableButtons={disableButtons}
                    handleAddDay={handleAddDay}
                    handleNotesChange={handleNotesChange}
                  />
                );
              })}
          </div>
          {/* <div className='fixed drop-shadow-md bottom-5 right-5 grid grid-cols-1 gap-y-1 w-40'>
            <button
              disabled={disableButtons}
              className='bg-red-400 block w-full rounded-md text-sm font-semibold py-1 h-fit mb-2 px-2 hover:bg-red-700 hover:text-white hover:drop-shadow-md transition ease-in-out duration-250'
              onClick={() => handleSave()}
            >
              Save
            </button>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default withPageAuthRequired(TripDetails);
