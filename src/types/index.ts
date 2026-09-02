export type Role = 'USER' | 'OPERATOR';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type VehicleType = 'CAR' | 'BIKE' | 'EV';
export type BookingStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  vehicleNumber?: string | null;
  role: Role;
  status: string;
  createdAt: string;
  totalBookings?: number;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  floor: string;
  vehicleType: VehicleType;
  status: SlotStatus;
  pricePerHour: number;
  polygonCoords?: string | null;
  locationId: string;
  location?: ParkingLocation;
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  user?: User;
  slot?: ParkingSlot;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
  vehicleNumber: string;
  status: BookingStatus;
  paymentStatus: string;
  createdAt: string;
}

export interface AIDetectionResult {
  id?: string;
  processed_at: string;
  image_dimensions?: { width: number; height: number };
  total_slots: number;
  occupied_slots: number;
  available_slots: number;
  occupancy_percentage: number;
  confidence_avg: number;
  total_vehicles_detected: number;
  slot_status: Record<string, SlotStatus>;
  slot_details?: Record<string, {
    status: SlotStatus;
    overlap: number;
    vehicle?: {
      bbox: [number, number, number, number];
      confidence: number;
      class_name: string;
    } | null;
  }>;
  detections: Array<{
    bbox: [number, number, number, number];
    confidence: number;
    class_id: number;
    class_name: string;
    centroid: [number, number];
    area: number;
  }>;
  annotated_image: string; // Base64 Data URL
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  parkingName: string;
  pricePerHour: number;
  floorsCount: number;
  openingHour: string;
  closingHour: string;
  aiConfidenceThreshold: number;
  autoReleaseMinutes: number;
}

export interface OperatorKPIs {
  totalUsers: number;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  todayRevenue: number;
  totalRevenue: number;
  activeBookings: number;
  occupancyRate: number;
  aiServiceOnline: boolean;
  aiLastDetectionTime?: string | null;
  lastDetectionVehicles?: number;
}