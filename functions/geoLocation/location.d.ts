export interface GeoLocation {
  geohash: String;
  lat: Number;
  lon: Number;
}

export interface TownProperties {
  countyId: Number;
  county: String;
  townId: Number;
  town: String;
}

export interface CountyProperties {
  countyId: Number;
  county: String;
  townId: Number;
  town: String;
}
