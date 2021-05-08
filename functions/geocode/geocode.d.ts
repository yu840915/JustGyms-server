export interface GeocodeResponse {
  results: [GeocodeResult];
  status: String;
}

export interface GeocodeResult {
  formatted_address: String;
  geometry: {
    location: {
      lat: Number;
      lng: Number;
    };
  };
  address_components: [AddressComponent];
}

export interface AddressComponent {
  long_name: String;
  short_name: String;
  types: [String];
}
