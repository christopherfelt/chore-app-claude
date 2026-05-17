import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const es = new EventSource('/api/events');

    es.onmessage = ({ data }) => {
      if (data === 'chores') {
        qc.invalidateQueries({ queryKey: ['chores'] });
        qc.invalidateQueries({ queryKey: ['calendar'] });
      } else if (data === 'completions') {
        qc.invalidateQueries({ queryKey: ['calendar'] });
      }
    };

    return () => es.close();
  }, [qc]);
}
