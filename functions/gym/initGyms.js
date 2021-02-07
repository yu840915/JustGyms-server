const {
  firestore,
  equipmentCategoriesRef,
  equipmentTypes,
  equipmentTemplates,
} = require('./firestoreRefs');

const initEquipmentCategory = async () => {
  /**
   * @type {[import('./gym').EquipmentCategory]}
   */
  const categories = [
    { id: 1, name: '自由重量' },
    { id: 2, name: '固定機械' },
    { id: 9, name: '其他' },
  ];
  const batch = firestore.batch();
  for (const category of categories) {
    batch.create(equipmentCategoriesRef.doc(`${category.id}`), category);
  }
  await batch.commit();
};

const initEquipmentType = async () => {
  const batch = firestore.batch();

  /**
   * @type {[import('./gym').EquipmentType]}
   */
  const freeWeights = [
    { categoryId: 1, id: 101, name: '啞鈴' },
    { categoryId: 1, id: 102, name: '臥推架' },
    { categoryId: 1, id: 103, name: '深蹲架' },
    { categoryId: 1, id: 104, name: '硬舉台' },
    { categoryId: 1, id: 105, name: '舉重台' },
    { categoryId: 1, id: 106, name: '肩推架' },
    { categoryId: 1, id: 107, name: '臥推椅' },
    { categoryId: 1, id: 108, name: '肩推椅' },
    { categoryId: 1, id: 109, name: '壺鈴' },
    { categoryId: 1, id: 110, name: '槓片' },
    { categoryId: 1, id: 111, name: '地雷管' },
  ];
  for (const type of freeWeights) {
    batch.create(firestore.collection(equipmentTypes).doc(`${type.id}`), type);
  }

  /**
   * @type {[import('./gym').EquipmentType]}
   */
  const weightMachines = [
    { categoryId: 2, id: 201, name: '胸推機械' },
    { categoryId: 2, id: 202, name: '飛鳥機械' },
    { categoryId: 2, id: 203, name: '肩推機械' },
    { categoryId: 2, id: 204, name: '划船機械' },
    { categoryId: 2, id: 205, name: '引體輔助機械' },
    { categoryId: 2, id: 206, name: '腿推機械' },
    { categoryId: 2, id: 207, name: '腿屈伸機械' },
    { categoryId: 2, id: 208, name: '腿後勾機械' },
    { categoryId: 2, id: 209, name: '哈克深蹲機械' },
    { categoryId: 2, id: 210, name: '臀推機械' },
    { categoryId: 2, id: 211, name: '腿外展機械' },
    { categoryId: 2, id: 212, name: '腿內收機械' },
    { categoryId: 2, id: 213, name: '史密斯機械' },
    { categoryId: 2, id: 214, name: '龍門架' },
  ];

  for (const type of weightMachines) {
    batch.create(firestore.collection(equipmentTypes).doc(`${type.id}`), type);
  }

  /**
   * @type {[import('./gym').EquipmentType]}
   */
  const others = [
    { categoryId: 9, id: 901, name: 'TRX' },
    { categoryId: 9, id: 902, name: '雪橇' },
    { categoryId: 9, id: 903, name: '瑜珈球' },
    { categoryId: 9, id: 904, name: '藥球' },
    { categoryId: 9, id: 905, name: '軟跳箱' },
    { categoryId: 9, id: 906, name: '防摔墊' },
    { categoryId: 9, id: 907, name: '火箭筒' },
    { categoryId: 9, id: 908, name: '沙鈴' },
    { categoryId: 9, id: 909, name: '戰繩' },
  ];

  for (const type of others) {
    batch.create(firestore.collection(equipmentTypes).doc(`${type.id}`), type);
  }
  await batch.commit();
};

const initEquipmentTemplates = async () => {
  const typeRef = firestore.collection(equipmentTypes);
  /**
   * @type {[import('./gym').Weights]}
   */
  const weights = [
    {
      type: typeRef.doc('101'),
      typeId: 101,
      name: '啞鈴',
      number: 0,
      min: 0,
      max: 0,
    },
    {
      type: typeRef.doc('109'),
      typeId: 109,
      name: '壺鈴',
      number: 0,
      min: 0,
      max: 0,
    },
    {
      type: typeRef.doc('110'),
      typeId: 110,
      name: '槓片',
      number: 0,
      min: 0,
      max: 0,
    },
  ];
  /**
   * @type {[import('./gym').Equipments]}
   */
  const list = [
    { type: typeRef.doc('102'), typeId: 102, number: 1, name: '臥推架' },
    { type: typeRef.doc('103'), typeId: 103, number: 1, name: '深蹲架' },
    { type: typeRef.doc('104'), typeId: 104, number: 1, name: '硬舉台' },
    { type: typeRef.doc('105'), typeId: 105, number: 1, name: '舉重台' },
    { type: typeRef.doc('106'), typeId: 106, number: 1, name: '肩推架' },
    { type: typeRef.doc('107'), typeId: 107, number: 1, name: '臥推椅' },
    { type: typeRef.doc('108'), typeId: 108, number: 1, name: '肩推椅' },
    { type: typeRef.doc('111'), typeId: 111, number: 1, name: '地雷管' },
    { type: typeRef.doc('201'), typeId: 201, number: 1, name: '胸推機械' },
    { type: typeRef.doc('202'), typeId: 202, number: 1, name: '飛鳥機械' },
    { type: typeRef.doc('203'), typeId: 203, number: 1, name: '肩推機械' },
    { type: typeRef.doc('204'), typeId: 204, number: 1, name: '划船機械' },
    { type: typeRef.doc('205'), typeId: 205, number: 1, name: '引體輔助機械' },
    { type: typeRef.doc('206'), typeId: 206, number: 1, name: '腿推機械' },
    { type: typeRef.doc('207'), typeId: 207, number: 1, name: '腿屈伸機械' },
    { type: typeRef.doc('208'), typeId: 208, number: 1, name: '腿後勾機械' },
    { type: typeRef.doc('209'), typeId: 209, number: 1, name: '哈克深蹲機械' },
    { type: typeRef.doc('210'), typeId: 210, number: 1, name: '臀推機械' },
    { type: typeRef.doc('211'), typeId: 211, number: 1, name: '腿外展機械' },
    { type: typeRef.doc('212'), typeId: 212, number: 1, name: '腿內收機械' },
    { type: typeRef.doc('213'), typeId: 213, number: 1, name: '史密斯機械' },
    { type: typeRef.doc('214'), typeId: 214, number: 1, name: '龍門架' },
    { type: typeRef.doc('901'), typeId: 901, number: 1, name: 'TRX' },
    { type: typeRef.doc('902'), typeId: 902, number: 1, name: '雪橇' },
    { type: typeRef.doc('903'), typeId: 903, number: 1, name: '瑜珈球' },
    { type: typeRef.doc('904'), typeId: 904, number: 1, name: '藥球' },
    { type: typeRef.doc('905'), typeId: 905, number: 1, name: '軟跳箱' },
    { type: typeRef.doc('906'), typeId: 906, number: 1, name: '防摔墊' },
    { type: typeRef.doc('907'), typeId: 907, number: 1, name: '火箭筒' },
    { type: typeRef.doc('908'), typeId: 908, number: 1, name: '沙鈴' },
    { type: typeRef.doc('909'), typeId: 909, number: 1, name: '戰繩' },
  ];

  const batch = firestore.batch();
  for (const e of weights) {
    batch.create(firestore.collection(equipmentTemplates).doc(), e);
  }
  for (const e of list) {
    batch.create(firestore.collection(equipmentTemplates).doc(), e);
  }
  await batch.commit();
};

module.exports = {
  initEquipmentCategory,
  initEquipmentType,
  initEquipmentTemplates,
};
