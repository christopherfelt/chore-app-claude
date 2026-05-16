async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getMembers: () => request('GET', '/api/members'),
  createMember: (name) => request('POST', '/api/members', { name }),
  deleteMember: (id) => request('DELETE', `/api/members/${id}`),

  getChores: () => request('GET', '/api/chores'),
  createChore: (chore) => request('POST', '/api/chores', chore),
  updateChore: (id, chore) => request('PUT', `/api/chores/${id}`, chore),
  deleteChore: (id) => request('DELETE', `/api/chores/${id}`),

  getCalendar: (start, end) => request('GET', `/api/calendar?start=${start}&end=${end}`),

  markComplete: (chore_id, date) => request('POST', '/api/completions', { chore_id, date }),
  markIncomplete: (chore_id, date) => request('DELETE', '/api/completions', { chore_id, date }),
};
