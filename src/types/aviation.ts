export type AircraftCondition = 'Factory New (FN)' | 'Overhauled (OH)' | 'Serviceable (SV)' | 'As Removed (AR)';

export type AircraftCategory = 
  | 'Engines & Propulsion'
  | 'Landing Gear & Brakes'
  | 'Flight Controls'
  | 'Hydraulic Systems'
  | 'Avionics & Radar'
  | 'Fuel Systems'
  | 'Pneumatics & Environmental'
  | 'Cabin & Interior';

export type AirframeFamily = 
  | 'Boeing 737 Series'
  | 'Boeing 777 Series'
  | 'Airbus A320 Family'
  | 'Airbus A330 Family'
  | 'ATR 72 Series';

export interface AircraftComponentTarget {
  id: string;
  name: string;
  category: AircraftCategory;
  ataChapter: string;
  description: string;
  threePosition: [number, number, number]; // base local position
  explodedOffset: [number, number, number]; // vector to push when disassembled
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  relatedPartCount: number;
}

export interface AircraftPart {
  id: string;
  partNumber: string;
  altPartNumber?: string;
  name: string;
  category: AircraftCategory;
  ataChapter: string; // e.g. "ATA 72-00"
  manufacturer: string;
  airframeCompatibility: AirframeFamily[];
  condition: AircraftCondition;
  availability: 'Immediate Dispatch' | '24-48h AOG' | 'Procurement Lead 5-7d';
  quantityInStock: number;
  priceUSD: number | null; // null means "Request Quote"
  imageUrl?: string;
  componentId: string; // ties to 3D component (e.g. 'engine', 'landing-gear')
  specifications: {
    weightKg: number;
    dimensionsCm?: string;
    serialTracking: boolean;
    traceability: string; // e.g. "FAA 8130-3 / EASA Form 1 Dual Release"
    cureDateOrShelfLife?: string;
    hazmat: boolean;
  };
  overview: string;
}

export interface CartItem {
  part: AircraftPart;
  quantity: number;
  requiredCondition?: AircraftCondition;
  rfqOnly?: boolean;
}

export interface RFQData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  deliveryAirportCode: string; // ICAO / IATA (e.g. KJFK, EGLL, DXB)
  priorityLevel: 'Routine' | 'Critical AOG (Aircraft On Ground)' | 'Scheduled Heavy Check';
  notes: string;
}
