import React from 'react';
import type { ClientDetails } from '../types/invoice';

interface ClientFormProps {
  onSubmit: (details: ClientDetails) => void;
}

export function ClientForm({ onSubmit }: ClientFormProps) {
  const [details, setDetails] = React.useState<ClientDetails>({
    name: '',
    address: '',
    taxId: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Client Name
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={details.name}
            onChange={e => setDetails(prev => ({ ...prev, name: e.target.value }))}
          />
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address
          <textarea
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={details.address}
            onChange={e => setDetails(prev => ({ ...prev, address: e.target.value }))}
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tax ID
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={details.taxId}
            onChange={e => setDetails(prev => ({ ...prev, taxId: e.target.value }))}
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={details.email}
            onChange={e => setDetails(prev => ({ ...prev, email: e.target.value }))}
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Continue
      </button>
    </form>
  );
}