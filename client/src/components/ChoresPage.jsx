import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api.js';
import ChoreForm from './ChoreForm.jsx';

const RECURRENCE_LABELS = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function recurrenceDetail(chore) {
  if (chore.recurrence_type === 'weekly' && Array.isArray(chore.recurrence_days)) {
    return chore.recurrence_days.map((d) => DAY_NAMES[d]).join(', ');
  }
  if (chore.recurrence_type === 'monthly' && chore.recurrence_days != null) {
    return `Day ${chore.recurrence_days} of each month`;
  }
  return null;
}

export default function ChoresPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'add' | chore object

  const { data: chores = [], isLoading: choresLoading } = useQuery({
    queryKey: ['chores'],
    queryFn: api.getChores,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });

  const createChore = useMutation({
    mutationFn: (payload) => api.createChore(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      setModal(null);
    },
    onError: (err) => alert(err.message),
  });

  const updateChore = useMutation({
    mutationFn: ({ id, payload }) => api.updateChore(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      setModal(null);
    },
    onError: (err) => alert(err.message),
  });

  const deleteChore = useMutation({
    mutationFn: (id) => api.deleteChore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (err) => alert(err.message),
  });

  const handleSave = (payload) => {
    if (modal && modal.id) {
      updateChore.mutate({ id: modal.id, payload });
    } else {
      createChore.mutate(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chores</h1>
        <button
          onClick={() => setModal('add')}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Add chore
        </button>
      </div>

      {choresLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : chores.length === 0 ? (
        <p className="text-gray-400 text-sm">No chores yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {chores.map((chore) => {
            const detail = recurrenceDetail(chore);
            return (
              <li key={chore.id} className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{chore.title}</p>
                    {chore.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{chore.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                        {chore.assignee_name}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                        {RECURRENCE_LABELS[chore.recurrence_type]}
                        {detail ? ` · ${detail}` : ''}
                      </span>
                      <span className="text-xs text-gray-400">
                        from {chore.start_date}
                        {chore.end_date ? ` to ${chore.end_date}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm shrink-0">
                    <button
                      onClick={() => setModal(chore)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${chore.title}"?`)) deleteChore.mutate(chore.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modal !== null && (
        <Modal title={modal && modal.id ? 'Edit chore' : 'Add chore'} onClose={() => setModal(null)}>
          <ChoreForm
            chore={modal === 'add' ? null : modal}
            members={members}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
