import {
  State,
  Location,
  QueryRequest,
  QueryResponse,
  UploadMeasurementRequest,
  ChannelReading,
} from "../types";

const API_BASE_URL = "https://tvws-geolocation-api.onrender.com";

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("tvws_auth_token");
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Network error" }));
      throw new Error(error.detail || "Request failed");
    }
    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse(response);
    this.token = data.access_token;
    localStorage.setItem("tvws_auth_token", this.token!);
    return data.user;
  }

  async getCurrentUser() {
    if (!this.token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem("tvws_auth_token");
  }

  async getStates(): Promise<State[]> {
    const response = await fetch(`${API_BASE_URL}/states`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getLocationsByState(state: string): Promise<Location[]> {
    const response = await fetch(
      `${API_BASE_URL}/locations/${encodeURIComponent(state)}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async queryTVWS(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/query-tvws`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...request,
          time: new Date(request.time).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Query failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error; // Re-throw for component handling
    }
  }

  async uploadMeasurements(request: UploadMeasurementRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/upload-measurements`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...request,
        timestamp: new Date(request.timestamp).toISOString(),
      }),
    });
    await this.handleResponse(response);
  }

  async addState(name: string): Promise<State> {
    const response = await fetch(`${API_BASE_URL}/states`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });
    return this.handleResponse(response);
  }

  async addLocation(
    state: string,
    name: string,
    lat: number,
    lon: number
  ): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        state,
        name,
        coordinates: { lat, lon },
      }),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
