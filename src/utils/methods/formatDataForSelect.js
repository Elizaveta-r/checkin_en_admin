/**
 * Преобразует массив подразделений в формат { value: id, label: name } для CustomSelect.
 * @param {Array<Object>} data - Массив подразделений с сервера.
 * @returns {Array<Object>} Массив объектов в формате Select.
 */
export const formatDataForSelect = (data) => {
  return data.map((item) => ({
    value: item.id,
    label: item.title,
  }));
};

/**
 * Преобразует массив объектов { value, label } в массив объектов вида { id: value }.
 *
 * @param {Array} selectOptions - Массив выбранных опций из CustomSelect.
 * @returns {Array<Object>} Массив объектов в формате [{ id: "value_1" }, { id: "value_2" }].
 */
export const mapSelectOptionsToIds = (selectOptions) => {
  if (!Array.isArray(selectOptions) || selectOptions.length === 0) {
    return [];
  }

  return selectOptions.map((option) => ({
    id: option.value,
  }));
};
