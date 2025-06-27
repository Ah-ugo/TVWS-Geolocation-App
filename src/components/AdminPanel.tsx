import React, { useState } from 'react';
import { Upload, FileText, Calendar, MapPin, Plus, Save } from 'lucide-react';
import { api } from '../utils/api';
import { UploadMeasurementRequest } from '../types';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'bulk'>('upload');
  const [loading, setLoading] = useState(false);
  
  // Single measurement form
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [measurements, setMeasurements] = useState([
    { channel: 21, frequency: 470, signalStrength: -85 }
  ]);

  // Bulk upload
  const [csvData, setCsvData] = useState('');

  const addMeasurement = () => {
    const lastChannel = measurements[measurements.length - 1]?.channel || 21;
    setMeasurements([
      ...measurements,
      {
        channel: lastChannel + 1,
        frequency: 470 + (lastChannel - 20) * 8,
        signalStrength: -85
      }
    ]);
  };

  const removeMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const updateMeasurement = (index: number, field: string, value: number) => {
    const updated = [...measurements];
    updated[index] = { ...updated[index], [field]: value };
    setMeasurements(updated);
  };

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !location || !timestamp) return;

    setLoading(true);
    try {
      const request: UploadMeasurementRequest = {
        state,
        location,
        timestamp,
        readings: measurements.map(m => ({
          channel: m.channel,
          frequency_mhz: m.frequency,
          signal_strength_dbm: m.signalStrength
        }))
      };

      await api.uploadMeasurements(request);
      alert('Measurements uploaded successfully!');
      
      // Reset form
      setState('');
      setLocation('');
      setTimestamp('');
      setMeasurements([{ channel: 21, frequency: 470, signalStrength: -85 }]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvData.trim()) return;

    setLoading(true);
    try {
      // Parse CSV data (simplified for demo)
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      
      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header.trim()] = row[index]?.trim();
        });

        // Create upload request from row data
        const request: UploadMeasurementRequest = {
          state: rowData.state,
          location: rowData.location,
          timestamp: rowData.timestamp,
          readings: [{
            channel: parseInt(rowData.channel),
            frequency_mhz: parseFloat(rowData.frequency),
            signal_strength_dbm: parseFloat(rowData.signal_strength)
          }]
        };

        await api.uploadMeasurements(request);
      }

      alert(`Successfully uploaded ${lines.length - 1} measurements!`);
      setCsvData('');
    } catch (error) {
      console.error('Bulk upload failed:', error);
      alert('Bulk upload failed. Please check your CSV format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
            <p className="text-slate-600">Upload and manage TV White Space measurements</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Upload
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'bulk'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        /* Single Upload Form */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSingleUpload} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Edo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Benin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timestamp</label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Measurements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">Channel Measurements</h3>
                <button
                  type="button"
                  onClick={addMeasurement}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Channel</span>
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {measurements.map((measurement, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Channel</label>
                      <input
                        type="number"
                        value={measurement.channel}
                        onChange={(e) => updateMeasurement(index, 'channel', parseInt(e.target.value))}
                        min="21"
                        max="69"
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Frequency (MHz)</label>
                      <input
                        type="number"
                        value={measurement.frequency}
                        onChange={(e) => updateMeasurement(index, 'frequency', parseFloat(e.target.value))}
                        step="0.01"
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Signal Strength (dBm)</label>
                      <input
                        type="number"
                        value={measurement.signalStrength}
                        onChange={(e) => updateMeasurement(index, 'signalStrength', parseFloat(e.target.value))}
                        step="0.1"
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeMeasurement(index)}
                        disabled={measurements.length === 1}
                        className="w-full px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Upload Measurements</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Bulk Upload Form */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleBulkUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">CSV Data</label>
              <p className="text-sm text-slate-600 mb-3">
                Format: state,location,timestamp,channel,frequency,signal_strength
              </p>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                required
                rows={10}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                placeholder="state,location,timestamp,channel,frequency,signal_strength
Edo,Benin,2025-01-20T14:30:00Z,21,470.0,-85.5
Edo,Benin,2025-01-20T14:30:00Z,22,478.0,-92.1"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Upload Bulk Data</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Upload Guidelines</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Signal strength threshold: &lt; -97 dBm = Free channel, ≥ -97 dBm = Occupied</p>
          <p>• UHF TV frequency range: 470-870 MHz (Channels 21-69)</p>
          <p>• Timestamp format: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)</p>
          <p>• CSV format: Include headers in first row</p>
          <p>• Ensure accurate location coordinates for proper mapping</p>
        </div>
      </div>
    </div>
  );
};