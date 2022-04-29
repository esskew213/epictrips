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
}) => {
  return (
    <div className='bg-slate-100 flex-wrap p-6 w-full mx-auto flex flex-col items-start'>
      <div className='w-full block xs:flex justify-between'>
        <h4 className='inline-block mb-4 font-bold tracking-wide mr-4'>
          Day {idx + 1}: {calcDate(trip, idx)}
        </h4>
        <button
          disabled={disableButtons}
          onClick={(evt) => handleAddDay(evt, plan.id)}
          className='mb-4 font-semibold text-sm disabled:opacity-50 w-full xs:w-24 h-fit bg-cyan-500 block px-2 py-1 rounded-md transition ease-in-out duration-250 hover:shadow-md hover:text-white hover:bg-cyan-700'
        >
          Add day
        </button>
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
