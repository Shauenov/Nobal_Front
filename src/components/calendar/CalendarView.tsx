'use client';

import { useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { EventForm } from './EventForm';
import './CalendarView.css';
// types not needed
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
} from 'date-fns';
import type { CalendarEventOut } from '@/types/api';

// panel styles moved to CSS

export function CalendarView() {
  const [current, setCurrent] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data: events } = useCalendarEvents({ from: gridStart.toISOString(), to: gridEnd.toISOString() });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDay = (() => {
    const map = new Map<string, CalendarEventOut[]>();
    (events || []).forEach((ev) => {
      const key = format(new Date(ev.start_time), 'yyyy-MM-dd');
      const arr = map.get(key) || [];
      arr.push(ev);
      map.set(key, arr);
    });
    return map;
  })();

  return (
    <div className="container">
      <div className="left">
        <div className="header">
          <div className="navGroup">
            <button onClick={() => setCurrent((c) => addMonths(c, -1))}>◀</button>
            <div className="monthTitle">{format(monthStart, 'LLLL yyyy')}</div>
            <button onClick={() => setCurrent((c) => addMonths(c, 1))}>▶</button>
            <button onClick={() => setCurrent(new Date())} className="todayBtn">Today</button>
          </div>
          <div className="smallButtons">
            <button className="btn" onClick={() => setShowCreate((s) => !s)}>{showCreate ? 'Close' : 'New Event'}</button>
          </div>
        </div>

        <div className="weekdayRow">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="weekdayCell">{d}</div>
          ))}
        </div>

        <div className="monthGrid">
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) || [];
            return (
              <div key={key} className={`cell ${isSameMonth(d, monthStart) ? '' : 'cellMuted'}`}>
                <div className="cellHeader">
                  <div className="dayNumber">{format(d, 'd')}</div>
                  <div className="dayName">{format(d, 'EEE')}</div>
                </div>
                <div className="eventsList">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="eventBadge">
                      {format(new Date(ev.start_time), 'HH:mm')} — {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="moreCount">+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && (
        <div className="panel">
          <EventForm onDone={() => setShowCreate(false)} />
        </div>
      )}
    </div>
  );
}
