export interface Gym {
  name: String;
  address: Address;
  businessHours: [Any];
  equipments: []
  equipmentTypes: []
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