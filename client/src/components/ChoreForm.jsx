import { useState, useEffect } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const empty = {
  title: '',
  description: '',
  assignee_id: '',
  start_date: '',
  end_date: '',
  recurrence_type: 'none',
  recurrence_days: [],
  recurrence_day_of_month: 1,
};

export default function ChoreForm({ chore, members, onSave, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (chore) {
      setForm({
        title: chore.title || '',
        description: chore.description || '',
        assignee_id: String(chore.assignee_id || ''),
        start_date: chore.start_date || '',
        end_date: chore.end_date || '',
        recurrence_type: chore.recurrence_type || 'none',
        recurrence_days: chore.recurrence_type === 'weekly' ? (chore.recurrence_days || []) : [],
        recurrence_day_of_month: chore.recurrence_type === 'monthly' ? (chore.recurrence_days || 1) : 1,
      });
    } else {
      setForm(empty);
    }
  }, [chore]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      recurrence_days: f.recurrence_days.includes(day)
        ? f.recurrence_days.filter((d) => d !== day)
        : [...f.recurrence_days, day],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assignee_id: Number(form.assignee_id),
      start_date: form.start_date,
      end_date: form.end_date || null,
      recurrence_type: form.recurrence_type,
      recurrence_days:
        form.recurrence_type === 'weekly' ? form.recurrence_days
        : form.recurrence_type === 'monthly' ? form.recurrence_day_of_month
        : null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to *</label>
        <select
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.assignee_id}
          onChange={(e) => set('assignee_id', e.target.value)}
        >
          <option value="">Select a team member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
          <input
            required
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.recurrence_type}
          onChange={(e) => set('recurrence_type', e.target.value)}
        >
          <option value="none">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {form.recurrence_type === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  form.recurrence_days.includes(i)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.recurrence_type === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day of month</label>
          <input
            type="number"
            min={1}
            max={31}
            className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.recurrence_day_of_month}
            onChange={(e) => set('recurrence_day_of_month', Number(e.target.value))}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
          {chore ? 'Save changes' : 'Add chore'}
        </button>
      </div>
    </form>
  );
}
