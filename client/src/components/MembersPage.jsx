import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api.js';

export default function MembersPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });

  const addMember = useMutation({
    mutationFn: (name) => api.createMember(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      setName('');
      setError('');
    },
    onError: (err) => setError(err.message),
  });

  const removeMember = useMutation({
    mutationFn: (id) => api.deleteMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMember.mutate(name.trim());
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Members</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Member name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
        />
        <button
          type="submit"
          disabled={addMember.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-400 text-sm">No team members yet.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-4 py-3 shadow-sm">
              <span className="text-gray-800 font-medium">{m.name}</span>
              <button
                onClick={() => removeMember.mutate(m.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
