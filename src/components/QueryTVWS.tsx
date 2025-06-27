import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Download, MapPin, Radio, Clock, Signal } from 'lucide-react';
import { api } from '../utils/api';
import { State, Location, QueryResponse, ChannelReading } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet default markers
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const QueryTVWS: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [queryTime, setQueryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);

  useEffect(() => {
    loadStates();
    
    // Set default time to current time
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16);
    setQueryTime(isoString);
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadLocations();
    } else {
      setLocations([]);
      setSelectedLocation('');
    }
  }, [selectedState]);

  const loadStates = async () => {
    try {
      const data = await api.getStates();
      setStates(data);
    } catch (error) {
      console.error('Failed to load states:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await api.getLocationsByState(selectedState);
      setLocations(data);
      setSelectedLocation('');
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !selectedLocation || !queryTime) return;

    setLoading(true);
    try {
      const response = await api.queryTVWS({
        state: selectedState,
        location: selectedLocation,
        time: queryTime
      });
      setResult(response);
    } catch (error) {
      console.error('Query failed:', error);
      alert('Query failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    if (!result) return;

    const csvContent = [
      'Channel,Frequency (MHz),Signal Strength (dBm),Status',
      ...result.channels.map(ch => 
        `${ch.channel},${ch.frequency_mhz},${ch.signal_strength_dbm},${ch.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tvws-${selectedState}-${selectedLocation}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    if (!result) return [];
    
    return result.channels.map(ch => ({
      channel: ch.channel,
      signalStrength: Math.abs(ch.signal_strength_dbm),
      status: ch.status,
      frequency: ch.frequency_mhz
    }));
  };

  const freeChannels = result?.channels.filter(ch => ch.status === 'free') || [];
  const occupiedChannels = result?.channels.filter(ch => ch.status === 'occupied') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Radio className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Query TV White Space</h2>
            <p className="text-slate-600">Check UHF channel availability for White Space Devices</p>
          </div>
        </div>

        {/* Query Form */}
        <form onSubmit={handleQuery} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state._id} value={state.name}>{state.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              required
              disabled={!selectedState}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">Select Location</option>
              {locations.map(location => (
                <option key={location._id} value={location.name}>{location.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Query Time</label>
            <input
              type="datetime-local"
              value={queryTime}
              onChange={(e) => setQueryTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !selectedState || !selectedLocation}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Query</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Free Channels</p>
                  <p className="text-3xl font-bold text-green-600">{freeChannels.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Signal className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Occupied Channels</p>
                  <p className="text-3xl font-bold text-red-600">{occupiedChannels.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Radio className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available Bandwidth</p>
                  <p className="text-3xl font-bold text-blue-600">{result.totalAvailableBandwidth} MHz</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Query Time</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(result.queryTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Clock className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Channel Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Channel Availability</h3>
                  <button
                    onClick={exportToCsv}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Signal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {result.channels.map((channel) => (
                      <tr key={channel.channel} className={channel.status === 'free' ? 'bg-green-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {channel.channel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {channel.frequency_mhz} MHz
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {channel.signal_strength_dbm} dBm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            channel.status === 'free' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {channel.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Location Map</h3>
                <p className="text-sm text-slate-600">{result.location.name}, {result.location.state}</p>
              </div>
              
              <div className="h-96">
                <MapContainer
                  center={[result.location.coordinates.lat, result.location.coordinates.lon]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[result.location.coordinates.lat, result.location.coordinates.lon]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">{result.location.name}</p>
                        <p className="text-sm text-slate-600">{result.location.state} State</p>
                        <p className="text-xs mt-1">
                          {freeChannels.length} free channels available
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Signal Strength Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Signal Strength Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis label={{ value: 'Signal Strength (dBm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${-Math.abs(Number(value))} dBm`,
                      'Signal Strength'
                    ]}
                    labelFormatter={(label) => `Channel ${label}`}
                  />
                  <Bar 
                    dataKey="signalStrength" 
                    fill={(entry: any) => entry.status === 'free' ? '#10B981' : '#EF4444'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};