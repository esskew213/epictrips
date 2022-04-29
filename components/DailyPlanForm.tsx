import React from 'react';

const DailyPlanForm = ({
  idx,
  calcDate,
  trip,
  notes,
  plan,
  disableButtons,
  handleAddDay,
  handleNotesChange,
  handleDeleteDay,
  isOnlyDay,
}) => {
  return (
    <div className='bg-slate-100 flex-wrap p-6 w-full mx-auto flex flex-col items-start'>
      <div className='w-full block sm:flex justify-between'>
        <h4 className='inline-block mb-4 font-bold tracking-wide mr-4'>
          Day {idx + 1}: {calcDate(trip, idx)}
        </h4>
        <div className='flex'>
          <button
            disabled={disableButtons}
            onClick={(evt) => handleAddDay(evt, plan.id)}
            className='mb-4 font-semibold text-xs disabled:opacity-50 w-1/2 sm:w-24 h-fit bg-cyan-500  border border-cyan-500  block px-2 py-1 rounded-l-md transition ease-in-out duration-250 hover:shadow-md hover:text-white hover:bg-cyan-700 hover:border-cyan-700'
          >
            Add day
          </button>
          <button
            disabled={isOnlyDay || disableButtons}
            onClick={(evt) => handleDeleteDay(evt, plan.id)}
            className='mb-4 font-semibold text-xs disabled:opacity-50 w-1/2 sm:w-24 h-fit border border-red-500 text-red-500 hover:bg-red-600 block px-2 py-1 rounded-r-md transition ease-in-out duration-250 hover:shadow-md  hover:text-white'
          >
            Delete day
          </button>
        </div>
      </div>
      <form className='w-full' id={`form-${idx}`}>
        <textarea
          maxLength={2000}
          form={`form-${idx}`}
          className='w-full focus:ring-0 focus:border-yellow-400 rounded-lg border-l-8 border-0 border-slate-500'
          rows={4}
          value={notes[plan.id] || ''}
          onChange={(e) => {
            handleNotesChange(e, plan.id);
          }}
        />
      </form>
    </div>
  );
};

export default DailyPlanForm;
