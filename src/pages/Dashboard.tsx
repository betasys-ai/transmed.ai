import React, { useState } from 'react';
import { AudioRecorder } from '../components/AudioRecorder';
import { useUserStore } from '../store/userStore';
import { format, addDays, isToday, isYesterday, isSameWeek } from 'date-fns';
import { FileText, Download, Edit2, Save, X, Loader2, Brain, ChevronDown, ChevronUp, Calendar, Globe, FileIcon, Trash2, Search } from 'lucide-react';
import type { Recording } from '../types';
import { transcribeAudio, generateMedicalReport } from '../lib/openai';
import { ReportEditor } from '../components/ReportEditor';
import { exportToPDF, exportToWord } from '../utils/exportUtils';

export function Dashboard() {
  const user = useUserStore((state) => state.user);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingName, setEditingName] = useState<{ id: string; name: string } | null>(null);

  const filteredRecordings = recordings.filter(recording => 
    recording.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedRecordings = filteredRecordings.reduce((groups, recording) => {
    const date = new Date(recording.createdAt);
    let key = 'Older';
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) {
      key = format(date, 'EEEE');
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(recording);
    return groups;
  }, {} as Record<string, Recording[]>);

  const handleTranscriptionError = (error: Error) => {
    setError('Failed to transcribe audio. Please try again.');
    setTimeout(() => setError(null), 5000);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newRecording: Recording = {
      id: Math.random().toString(),
      audioUrl: url,
      transcript: null,
      notes: '',
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      doctorName: user?.role === 'doctor' ? user.name : 'Dr. Smith',
      patientName: 'John Doe',
      status: 'transcribing'
    };

    setRecordings(prev => [newRecording, ...prev]);

    try {
      const { text, detectedLanguage } = await transcribeAudio(blob);
      setRecordings(prev => prev.map(rec => 
        rec.id === newRecording.id 
          ? { ...rec, transcript: text, detectedLanguage, status: 'ready' }
          : rec
      ));
    } catch (error) {
      handleTranscriptionError(error as Error);
      setRecordings(prev => prev.map(rec => 
        rec.id === newRecording.id 
          ? { ...rec, transcript: "Error transcribing audio", status: 'ready' }
          : rec
      ));
    }
  };

  const generateAIReport = async (recordingId: string) => {
    setGeneratingReport(recordingId);
    setError(null);
    
    try {
      const recording = recordings.find(rec => rec.id === recordingId);
      if (!recording?.transcript) {
        throw new Error('No transcript available');
      }

      const report = await generateMedicalReport(recording.transcript);
      
      setRecordings(prev => prev.map(rec =>
        rec.id === recordingId
          ? { ...rec, aiReport: report }
          : rec
      ));
    } catch (error) {
      setError('Failed to generate medical report. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setGeneratingReport(null);
    }
  };

  const startEditing = (recording: Recording) => {
    setEditingId(recording.id);
    setEditedTranscript(recording.transcript || '');
  };

  const saveEdits = (recordingId: string) => {
    setRecordings(prev => prev.map(rec =>
      rec.id === recordingId
        ? { ...rec, transcript: editedTranscript }
        : rec
    ));
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedTranscript('');
  };

  const toggleReport = (recordingId: string) => {
    setExpandedReport(expandedReport === recordingId ? null : recordingId);
  };

  const handleSaveReport = (recordingId: string, updatedReport: NonNullable<Recording['aiReport']>) => {
    setRecordings(prev => prev.map(rec =>
      rec.id === recordingId
        ? { ...rec, aiReport: updatedReport }
        : rec
    ));
    setEditingReportId(null);
  };

  const handleExport = async (recording: Recording, format: 'pdf' | 'word') => {
    if (!recording.aiReport) return;
    
    try {
      const reportData = {
        ...recording,
        doctorName: user?.name || 'Dr. Smith',
        patientName: recording.patientName,
        date: format(recording.createdAt, 'PP'),
      };
      
      if (format === 'pdf') {
        await exportToPDF(reportData);
      } else {
        await exportToWord(reportData);
      }
    } catch (error) {
      setError('Failed to export document. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleNameSave = () => {
    if (!editingName) return;
    
    setRecordings(prev => prev.map(rec =>
      rec.id === editingName.id
        ? { ...rec, patientName: editingName.name }
        : rec
    ));
    setEditingName(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Record Conversation</h2>
          <p className="text-gray-600 mb-4">
            <Globe className="inline-block w-4 h-4 mr-2" />
            Speak in any language - the transcript will be provided in English
          </p>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Recordings</h2>
          
          {recordings.length === 0 ? (
            <p className="text-gray-500">No recordings yet</p>
          ) : (
            <div className="space-y-6">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className={`p-4 border rounded-lg space-y-4 transition-colors ${
                    selectedRecording === recording.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        Recording from {format(recording.createdAt, 'PPp')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {format(recording.expiresAt, 'PP')}
                      </p>
                      {recording.detectedLanguage && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Globe className="w-4 h-4 mr-1" />
                          Original language: {recording.detectedLanguage}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {recording.status === 'ready' && (
                        <button
                          onClick={() => startEditing(recording)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Edit Transcript"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {!recording.aiReport && recording.status === 'ready' && (
                        <button
                          onClick={() => generateAIReport(recording.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Generate AI Report"
                          disabled={generatingReport === recording.id}
                        >
                          <Brain className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Download Recording"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <audio controls src={recording.audioUrl} className="w-full" />

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Transcript (English)</h3>
                    
                    {recording.status === 'transcribing' ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating transcript...
                      </div>
                    ) : editingId === recording.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedTranscript}
                          onChange={(e) => setEditedTranscript(e.target.value)}
                          className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdits(recording.id)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 whitespace-pre-wrap">{recording.transcript}</p>
                    )}
                  </div>

                  {generatingReport === recording.id && (
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating AI medical report...
                    </div>
                  )}

                  {recording.aiReport && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleReport(recording.id)}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <Brain className="w-5 h-5" />
                          AI Medical Report
                          {expandedReport === recording.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExport(recording, 'pdf')}
                            className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg"
                            title="Export as PDF"
                          >
                            <FileIcon className="w-5 h-5" />
                            <span className="sr-only">PDF</span>
                          </button>
                          <button
                            onClick={() => handleExport(recording, 'word')}
                            className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg"
                            title="Export as Word"
                          >
                            <FileText className="w-5 h-5" />
                            <span className="sr-only">Word</span>
                          </button>
                          {editingReportId !== recording.id && (
                            <button
                              onClick={() => setEditingReportId(recording.id)}
                              className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg"
                              title="Edit Report"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedReport === recording.id && (
                        <div className="mt-4">
                          {editingReportId === recording.id ? (
                            <ReportEditor
                              report={recording.aiReport}
                              onSave={(updatedReport) => handleSaveReport(recording.id, updatedReport)}
                              onCancel={() => setEditingReportId(null)}
                            />
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Symptoms</h4>
                                <ul className="list-disc list-inside text-gray-600">
                                  {recording.aiReport.symptoms.map((symptom, index) => (
                                    <li key={index}>{symptom}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
                                <p className="text-gray-600">{recording.aiReport.diagnosis}</p>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Treatment Plan</h4>
                                <p className="text-gray-600">{recording.aiReport.treatment}</p>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Medications</h4>
                                <div className="space-y-2">
                                  {recording.aiReport.medications.map((med, index) => (
                                    <div key={index} className="text-gray-600">
                                      <span className="font-medium">{med.name}</span>
                                      <span className="text-gray-500"> - {med.dosage}, {med.frequency}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Follow-up</h4>
                                <p className="text-gray-600">{recording.aiReport.followUp}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 sticky top-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">7 Day History</h2>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-6">
            {Object.entries(groupedRecordings).map(([day, dayRecordings]) => (
              <div key={day}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{day}</h3>
                <div className="space-y-2">
                  {dayRecordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center gap-2"
                    >
                      {editingName?.id === recording.id ? (
                        <div className="flex-1 flex gap-1">
                          <input
                            type="text"
                            value={editingName.name}
                            onChange={(e) => setEditingName({ ...editingName, name: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleNameSave}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingName(null)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedRecording(recording.id)}
                            className={`flex-1 text-left p-2 rounded-lg text-sm transition-colors ${
                              selectedRecording === recording.id
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <p className="font-medium truncate">
                              {recording.patientName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(recording.createdAt, 'h:mm a')}
                            </p>
                          </button>
                          <button
                            onClick={() => setEditingName({ id: recording.id, name: recording.patientName })}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit patient name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newRecordings = recordings.filter(r => r.id !== recording.id);
                              setRecordings(newRecordings);
                              if (selectedRecording === recording.id) {
                                setSelectedRecording(null);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete recording"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {recordings.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No recordings in the last 7 days
            </p>
          )}
        </div>
      </div>
    </div>
  );
}