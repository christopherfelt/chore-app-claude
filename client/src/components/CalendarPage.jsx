import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api } from '../api.js';

function EventContent({ eventInfo }) {
  const { completed, assignee_name } = eventInfo.event.extendedProps;
  return (
    <div className={`px-1 py-0.5 w-full overflow-hidden ${completed ? 'opacity-60' : ''}`}>
      <span className={`text-xs font-semibold ${completed ? 'line-through text-green-800' : 'text-white'}`}>
        {eventInfo.event.title}
      </span>
      <span className={`text-xs ml-1 ${completed ? 'text-green-700 line-through' : 'text-blue-100'}`}>
        {assignee_name}
      </span>
    </div>
  );
}

function ChoreDetailModal({ event, onClose, onToggle, isToggling }) {
  const { chore_id, date, assignee_name, description, completed, completed_at } = event.extendedProps;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Date:</span> {date}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Assigned to:</span> {assignee_name}
          </div>
          {description && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {description}
            </div>
          )}
          {completed && completed_at && (
            <div className="text-sm text-green-700">
              Completed at {new Date(completed_at).toLocaleString()}
            </div>
          )}
          <div className="pt-2">
            <button
              onClick={() => onToggle(chore_id, date, completed)}
              disabled={isToggling}
              className={`w-full py-2 rounded font-medium text-sm transition-colors disabled:opacity-50 ${
                completed
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {completed ? 'Mark incomplete' : 'Mark complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const qc = useQueryClient();
  const calendarRef = useRef(null);
  const [window, setWindow] = useState({ start: '', end: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar', window.start, window.end],
    queryFn: () => api.getCalendar(window.start, window.end),
    enabled: !!(window.start && window.end),
  });

  const toggleCompletion = useMutation({
    mutationFn: ({ chore_id, date, completed }) =>
      completed ? api.markIncomplete(chore_id, date) : api.markComplete(chore_id, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar'] });
      setSelectedEvent(null);
    },
    onError: (err) => alert(err.message),
  });

  const handleDatesSet = useCallback(({ startStr, endStr }) => {
    // FullCalendar gives ISO datetime strings; slice to date only
    setWindow({ start: startStr.slice(0, 10), end: endStr.slice(0, 10) });
  }, []);

  const handleEventClick = useCallback(({ event }) => {
    setSelectedEvent(event);
  }, []);

  const styledEvents = events.map((ev) => ({
    ...ev,
    backgroundColor: ev.extendedProps.completed ? '#16a34a' : '#2563eb',
    borderColor: ev.extendedProps.completed ? '#15803d' : '#1d4ed8',
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {isLoading && (
        <p className="text-xs text-gray-400 mb-2">Loading chores...</p>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={styledEvents}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => <EventContent eventInfo={eventInfo} />}
        height="auto"
      />

      {selectedEvent && (
        <ChoreDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToggle={(chore_id, date, completed) =>
            toggleCompletion.mutate({ chore_id, date, completed })
          }
          isToggling={toggleCompletion.isPending}
        />
      )}
    </div>
  );
}
