import { DocumentReference } from '../firestoreTypes';

export interface Gym extends GeoLocation {
  name: String;
  address: Address;
  businessHours: [Any];
  equipments: [Equipments]
  capacity: Number
  hourlyRate: Price

  equipmentTypes: [String];
  townId: Number;
  countyId: Number;
}

export interface Equipments {
  type: DocumentReference
  typeId: Number
  name: String
  brand?: DocumentReference
  number: Number
}

export interface Weights extends Equipments {
  min: Number
  max: Number
  collections?: [Number]
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


interface Fare {
  type: 'hourlyRate';
  unit: 'hour';
  price: Price;
}

interface Price {
  amount: Number;
  currency: String;
}