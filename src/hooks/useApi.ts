import { useState, useEffect } from 'react';

export function useApi<T>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/${table}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newItem: Partial<T>) => {
    try {
      await fetch(`/api/data/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const update = async (id: string | number, updatedItem: Partial<T>) => {
    try {
      await fetch(`/api/data/${table}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id: string | number) => {
    try {
      await fetch(`/api/data/${table}/${id}`, {
        method: 'DELETE'
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const clearAll = async () => {
    try {
      await fetch(`/api/data/${table}`, {
        method: 'DELETE'
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [table]);

  return { data, loading, fetchAll, create, update, remove, clearAll };
}
