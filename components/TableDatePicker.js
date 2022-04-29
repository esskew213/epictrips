import React from 'react';
import DatePicker from 'react-date-picker/dist/entry.nostyle';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

export default function TableDatePicker({ onInputChange, date }) {
  return (
    <DatePicker
      value={date}
      className='drop-shadow-md bg-white'
      // minDate={new Date()}
      format='yyyy-MM-dd'
      onChange={onInputChange}
      required
    />
  );
}
