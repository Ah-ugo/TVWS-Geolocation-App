export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export interface State {
  _id: string;
  name: string;
}

export interface Location {
  _id: string;
  state: string;
  name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface ChannelReading {
  channel: number;
  frequency_mhz: number;
  signal_strength_dbm: number;
  status: 'free' | 'occupied';
}

export interface Measurement {
  _id: string;
  state: string;
  location: string;
  timestamp: string;
  readings: ChannelReading[];
}

export interface QueryRequest {
  state: string;
  location: string;
  time: string;
}

export interface QueryResponse {
  channels: ChannelReading[];
  totalAvailableBandwidth: number;
  location: Location;
  queryTime: string;
}

export interface UploadMeasurementRequest {
  state: string;
  location: string;
  timestamp: string;
  readings: Omit<ChannelReading, 'status'>[];
}