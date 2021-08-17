import { DocumentReference } from '../firestoreTypes';
import { GeoLocation } from '../geoLocation/location';

export interface Gym extends GeoLocation {
  images: [String];
  name: String;
  address: String;
  phones: [String];
  pageLink: String;
  businessHours: [BusinessHours];
  equipments: [Equipments];
  pricing: [Fare];
  hourlyRate: Price;
  capacity?: Number;
  facilities: [
    'changingRoom' | 'toilet' | 'locker' | 'firstAid' | 'waterDispenser'
  ];
  equipmentTypes: [Number];
  townId: Number;
  countyId: Number;
  admins: [DocumentReference];
}

export interface ChangeLog {
  date: Date;
  type: 'adminAdded' | 'adminRemoved';
  user: DocumentReference;
}

export interface BusinessHours {
  dayOfWeek?: String;
  start: String;
  end: String;
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
  unit: 'hour' | 'time' | 'min' | 'day';
  amount: Number;
  price: Price;
}

export interface Price {
  amount: Number;
  currency: String;
}
