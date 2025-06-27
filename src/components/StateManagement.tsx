import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { api } from '../utils/api';
import { State, Location } from '../types';

export const StateManagement: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Add state form
  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  
  // Add location form
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lon: ''
  });

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadLocations();
    } else {
      setLocations([]);
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
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;

    setLoading(true);
    try {
      await api.addState(newStateName.trim());
      await loadStates();
      setNewStateName('');
      setShowAddState(false);
    } catch (error) {
      console.error('Failed to add state:', error);
      alert('Failed to add state. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.name.trim() || !newLocation.lat || !newLocation.lon || !selectedState) return;

    setLoading(true);
    try {
      await api.addLocation(
        selectedState,
        newLocation.name.trim(),
        parseFloat(newLocation.lat),
        parseFloat(newLocation.lon)
      );
      await loadLocations();
      setNewLocation({ name: '', lat: '', lon: '' });
      setShowAddLocation(false);
    } catch (error) {
      console.error('Failed to add location:', error);
      alert('Failed to add location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">State & Location Management</h2>
            <p className="text-slate-600">Manage states and locations for TVWS data collection</p>
          </div>
        </div>
      </div>

      {/* States Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">States</h3>
              <button
                onClick={() => setShowAddState(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add State</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Add State Form */}
            {showAddState && (
              <form onSubmit={handleAddState} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    placeholder="State name"
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddState(false);
                      setNewStateName('');
                    }}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* States List */}
            <div className="space-y-2">
              {states.map((state) => (
                <div
                  key={state._id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedState === state.name
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedState(state.name)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{state.name}</span>
                    <div className="flex space-x-1">
                      <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Locations Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Locations {selectedState && `in ${selectedState}`}
              </h3>
              <button
                onClick={() => setShowAddLocation(true)}
                disabled={!selectedState}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Add Location</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {!selectedState ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a state to manage its locations</p>
              </div>
            ) : (
              <>
                {/* Add Location Form */}
                {showAddLocation && (
                  <form onSubmit={handleAddLocation} className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      placeholder="Location name"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="any"
                        value={newLocation.lat}
                        onChange={(e) => setNewLocation({ ...newLocation, lat: e.target.value })}
                        placeholder="Latitude"
                        required
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <input
                        type="number"
                        step="any"
                        value={newLocation.lon}
                        onChange={(e) => setNewLocation({ ...newLocation, lon: e.target.value })}
                        placeholder="Longitude"
                        required
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Save Location
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddLocation(false);
                          setNewLocation({ name: '', lat: '', lon: '' });
                        }}
                        className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Locations List */}
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location._id}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{location.name}</p>
                          <p className="text-sm text-slate-600">
                            {location.coordinates.lat.toFixed(5)}, {location.coordinates.lon.toFixed(5)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total States</p>
              <p className="text-3xl font-bold text-slate-900">{states.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Locations</p>
              <p className="text-3xl font-bold text-slate-900">
                {states.reduce((total, state) => {
                  const stateLocations = locations.filter(loc => loc.state === state.name);
                  return total + stateLocations.length;
                }, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Selected State Locations</p>
              <p className="text-3xl font-bold text-slate-900">{locations.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};