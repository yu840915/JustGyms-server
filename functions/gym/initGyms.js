const {
  firestore,
  equipmentCategoriesRef,
  equipmentTypes,
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
    batch.create(
      equipmentCategoriesRef
        .doc(`${type.categoryId}`)
        .collection(equipmentTypes)
        .doc(`${type.id}`),
      type
    );
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
    batch.create(
      equipmentCategoriesRef
        .doc(`${type.categoryId}`)
        .collection(equipmentTypes)
        .doc(`${type.id}`),
      type
    );
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
  ];

  for (const type of others) {
    batch.create(
      equipmentCategoriesRef
        .doc(`${type.categoryId}`)
        .collection(equipmentTypes)
        .doc(`${type.id}`),
      type
    );
  }
  await batch.commit();
};

module.exports = {
  initEquipmentCategory,
  initEquipmentType,
};
