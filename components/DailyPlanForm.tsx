import React from 'react';

const DailyPlanForm = ({
  idx,
  calcDate,
  trip,
  notes,
  plan,
  requireReload,
  handleAddDay,
  handleNotesChange,
}) => {
  return (
    <div className='bg-slate-200 flex-wrap p-6 w-full mx-auto drop-shadow-md flex flex-col items-start'>
      <div className='w-full flex justify-between mb-2'>
        <h4 className='inline-block'>
          Day {idx + 1}: {calcDate(trip, idx + 1)}
        </h4>
        <button
          disabled={requireReload}
          onClick={(evt) => handleAddDay(evt, plan.id)}
          className='inline-block text-sm disabled:opacity-50 bg-cyan-500 block px-1 py-1 rounded-md transition ease-in-out duration-200 hover:shadow-md active:text-white active:bg-cyan-700 hover:-translate-y-0.5 active:translate-y-0'
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
