import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import type { DoctorSettings } from '../types';

export function Settings() {
  const { doctorSettings, setDoctorSettings } = useUserStore();
  const [formData, setFormData] = useState<DoctorSettings>(
    doctorSettings || {
      name: '',
      hospital: '',
      address: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorSettings(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Name
            </label>
            <input
              type="text"
              id="hospital"
              value={formData.hospital}
              onChange={(e) => setFormData((prev) => ({ ...prev, hospital: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL (optional)
            </label>
            <input
              type="url"
              id="logoUrl"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}