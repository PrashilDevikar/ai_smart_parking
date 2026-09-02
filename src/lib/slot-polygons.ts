export interface SlotPolygon {
  slotId: string;
  points: [number, number][]; // [x, y] in normalized (0.0 to 1.0) or pixel
  floor: string;
}

export const STANDARD_NORMALIZED_POLYGONS: Record<string, [number, number][]> = {
  A1: [[0.06, 0.22], [0.26, 0.22], [0.26, 0.44], [0.06, 0.44]],
  A2: [[0.29, 0.22], [0.49, 0.22], [0.49, 0.44], [0.29, 0.44]],
  A3: [[0.52, 0.22], [0.72, 0.22], [0.72, 0.44], [0.52, 0.44]],
  A4: [[0.75, 0.22], [0.95, 0.22], [0.95, 0.44], [0.75, 0.44]],
  A5: [[0.06, 0.56], [0.26, 0.56], [0.26, 0.78], [0.06, 0.78]],
  A6: [[0.29, 0.56], [0.49, 0.56], [0.49, 0.78], [0.29, 0.78]],
  A7: [[0.52, 0.56], [0.72, 0.56], [0.72, 0.78], [0.52, 0.78]],
  A8: [[0.75, 0.56], [0.95, 0.56], [0.95, 0.78], [0.75, 0.78]],
};

export const FLOORS = ['Ground Floor', 'Floor 1', 'Floor 2'] as const;
export type FloorName = typeof FLOORS[number];

export const VEHICLE_TYPES = ['CAR', 'BIKE', 'EV'] as const;
export type VehicleType = typeof VEHICLE_TYPES[number];

export const SLOT_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'] as const;
export type SlotStatus = typeof SLOT_STATUSES[number];