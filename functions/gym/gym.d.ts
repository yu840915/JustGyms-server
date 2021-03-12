import { DocumentReference } from '../firestoreTypes';
import { GeoLocation } from '../geoLocation/location';

export interface Gym extends GeoLocation {
  images: [String];
  name: String;
  address: String;
  phones: [String];
  businessHours: [BusinessHours];
  equipments: [Equipments];
  hourlyRate: Price;
  capacity?: Number;

  equipmentTypes: [Number];
  townId: Number;
  countyId: Number;
}

export interface BusinessHours {
  dayOfWeek?: String;
  start: Number;
  end: Number;
}

export interface Equipments {
  type: DocumentReference;
  typeId: Number;
  name: String;
  brand?: DocumentReference;
  number: Number;
}

export interface Weights extends Equipments {
  min: Number;
  max: Number;
  collections?: [Number];
}

export interface EquipmentCategory {
  id: Number;
  name: String;
}

export interface EquipmentType {
  id: Number;
  categoryId: Number;
  name: String;
}

export interface Fare {
  type: 'hourlyRate';
  unit: 'hour';
  price: Price;
}

export interface Price {
  amount: Number;
  currency: String;
}
