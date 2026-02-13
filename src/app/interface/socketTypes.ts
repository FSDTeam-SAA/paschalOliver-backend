import { Socket } from 'socket.io';

// Extended Socket interface with custom properties
export interface CustomSocket extends Socket {
  userId?: string;
  driverId?: string;
  customerId?: string;
  customerLat?: number;
  customerLng?: number;
  trackingDriverId?: string;
}

// Event data types
export interface JoinUserData {
  userId: string;
}

export interface JoinDriverData {
  driverId?: string;
  id?: string;
  _id?: string;
}

export interface JoinChatData {
  rideId: string;
}

export interface LeaveChatData {
  rideId: string;
}

export interface SendMessageData {
  rideId: string;
  message: string;
}

export interface TrackDriverData {
  customerId: string;
  driverId: string;
  customerLat: number;
  customerLng: number;
}

export interface StopTrackingData {
  customerId: string;
  driverId: string;
}

export interface LocationUpdateData {
  latitude: number;
  longitude: number;
}

export interface DriverLocationUpdateData extends LocationUpdateData {
  heading?: number;
  speed?: number;
}

// Response types
export interface JoinedResponse {
  success: boolean;
  room: string;
  message: string;
}

export interface DriverJoinedResponse extends JoinedResponse {
  allRooms: string[];
}

export interface TrackingStartedResponse {
  driverId: string;
  distanceKm: number | null;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  message?: string;
}

export interface DriverLocationUpdateResponse {
  driverId: string;
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  };
  distanceKm: number | null;
  timestamp: string;
}

export interface LocationUpdateSuccessResponse {
  latitude: number;
  longitude: number;
  customersNotified: number;
  timestamp: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
}

export interface MessageData {
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}