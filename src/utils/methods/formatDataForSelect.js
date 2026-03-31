/**
 * Преобразует массив подразделений в формат { value: id, label: name } для CustomSelect.
 * @param {Array<Object>} data - Массив подразделений с сервера.
 * @returns {Array<Object>} Массив объектов в формате Select.
 */
export const formatDataForSelect = (data) => {
  // Используем .map() для преобразования каждого объекта
  return data.map((item) => ({
    value: item.id, // ID становится значением (value)
    label: item.title, // Название становится отображаемым текстом (label)
  }));
};

/**
 * Преобразует массив объектов { value, label } в массив объектов вида { id: value }.
 *
 * @param {Array} selectOptions - Массив выбранных опций из CustomSelect.
 * @returns {Array<Object>} Массив объектов в формате [{ id: "value_1" }, { id: "value_2" }].
 */
export const mapSelectOptionsToIds = (selectOptions) => {
  // Убеждаемся, что это массив и что он не пустой
  if (!Array.isArray(selectOptions) || selectOptions.length === 0) {
    return [];
  }

  // Используем .map() для создания нового объекта для каждого элемента,
  // где 'value' становится значением ключа 'id'.
  return selectOptions.map((option) => ({
    id: option.value,
  }));
};
