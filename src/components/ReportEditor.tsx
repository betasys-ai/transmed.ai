import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Recording } from '../types';

interface ReportEditorProps {
  report: NonNullable<Recording['aiReport']>;
  onSave: (report: NonNullable<Recording['aiReport']>) => void;
  onCancel: () => void;
}

export function ReportEditor({ report, onSave, onCancel }: ReportEditorProps) {
  const [editedReport, setEditedReport] = useState(report);

  const handleSymptomChange = (index: number, value: string) => {
    const newSymptoms = [...editedReport.symptoms];
    newSymptoms[index] = value;
    setEditedReport({ ...editedReport, symptoms: newSymptoms });
  };

  const addSymptom = () => {
    setEditedReport({
      ...editedReport,
      symptoms: [...editedReport.symptoms, '']
    });
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = editedReport.symptoms.filter((_, i) => i !== index);
    setEditedReport({ ...editedReport, symptoms: newSymptoms });
  };

  const handleMedicationChange = (index: number, field: keyof typeof editedReport.medications[0], value: string) => {
    const newMedications = [...editedReport.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setEditedReport({ ...editedReport, medications: newMedications });
  };

  const addMedication = () => {
    setEditedReport({
      ...editedReport,
      medications: [...editedReport.medications, { name: '', dosage: '', frequency: '' }]
    });
  };

  const removeMedication = (index: number) => {
    const newMedications = editedReport.medications.filter((_, i) => i !== index);
    setEditedReport({ ...editedReport, medications: newMedications });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Symptoms</h4>
        {editedReport.symptoms.map((symptom, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={symptom}
              onChange={(e) => handleSymptomChange(index, e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => removeSymptom(index)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addSymptom}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Add Symptom
        </button>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
        <textarea
          value={editedReport.diagnosis}
          onChange={(e) => setEditedReport({ ...editedReport, diagnosis: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Treatment Plan</h4>
        <textarea
          value={editedReport.treatment}
          onChange={(e) => setEditedReport({ ...editedReport, treatment: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Medications</h4>
        {editedReport.medications.map((medication, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={medication.name}
              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
              placeholder="Medication name"
              className="flex-1 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={medication.dosage}
              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
              placeholder="Dosage"
              className="w-32 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={medication.frequency}
              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
              placeholder="Frequency"
              className="w-40 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => removeMedication(index)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addMedication}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Add Medication
        </button>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Follow-up</h4>
        <textarea
          value={editedReport.followUp}
          onChange={(e) => setEditedReport({ ...editedReport, followUp: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={() => onSave(editedReport)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}