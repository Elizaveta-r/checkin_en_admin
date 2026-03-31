import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateDepartment } from "../../utils/api/actions/departments";
import { toast } from "sonner";

const initialDepartmentState = {
  // Базовые поля отдела
  id: null,
  name: null,
  description: null,

  // --- НОВЫЕ ПОЛЯ ДЛЯ СОТРУДНИКОВ ПО РОЛЯМ ---
  manager: null, // Объект сотрудника (руководитель)
  employees: [], // Массив объектов сотрудников
  // -------------------------------------------
};

// Функция для получения начального состояния department из sessionStorage
const getInitialDepartment = () => {
  const savedDepartment = sessionStorage.getItem("department");
  if (savedDepartment) {
    // Восстанавливаем сохраненный объект, но убеждаемся, что новые поля есть
    const parsed = JSON.parse(savedDepartment);
    return {
      ...initialDepartmentState,
      ...parsed,
      // Обеспечиваем, что employees всегда массив, если не сохранен
      employees: parsed.employees || [],
      is_default: parsed.is_default !== undefined ? parsed.is_default : false,
    };
  }
  return initialDepartmentState;
};

const initialState = {
  departments: sessionStorage.getItem("departments")
    ? JSON.parse(sessionStorage.getItem("departments"))
    : null,
  department: getInitialDepartment(),
  loading: false,
  loadingGetDetails: "",
};

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setDepartments(state, action) {
      state.departments = action.payload;
    },
    setIsDefaultValue(state, action) {
      state.department.is_default = action.payload;
      // В этом редьюсере НЕ сохраняем в sessionStorage, это делает Thunk после успеха
    },
    updateSessionStorage(state) {
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartmentManager(state, action) {
      // action.payload должен быть объектом одного сотрудника
      state.department.manager = action.payload;
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartmentEmployees(state, action) {
      // action.payload должен быть массивом объектов сотрудников
      state.department.employees = action.payload;
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartment(state, action) {
      // Здесь ожидается полный объект отдела с сервера,
      // включая manager и employees
      state.department = {
        ...initialDepartmentState,
        ...action.payload,
      };
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setLoadingGetDetails(state, action) {
      state.loadingGetDetails = action.payload;
    },
    setDepartmentsLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const toggleDepartmentIsDefault = createAsyncThunk(
  "departments/toggleIsDefault",
  async ({ department, newValue }, { dispatch, rejectWithValue }) => {
    // 1. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ (Применяем изменение немедленно)
    const originalValue = department.is_default;
    dispatch(setIsDefaultValue(newValue));

    // 2. ФОРМИРОВАНИЕ ДАННЫХ
    const dataForServer = {
      department_id: department.id,
      title: department.title,
      description: department.description,
      timezone: department.timezone,
      check_in_time: department.check_in_time,
      check_out_time: department.check_out_time,
      is_default: newValue,
    };

    const toastId = toast.loading("Сохранение...");

    try {
      // 3. ОТПРАВКА ЗАПРОСА
      await dispatch(updateDepartment(dataForServer));

      // Успех: сохраняем в sessionStorage, т.к. state уже обновлен
      dispatch(updateSessionStorage());

      toast.dismiss(toastId);

      return newValue;
    } catch (error) {
      // 4. ОТКАТ (Если API-запрос не удался)
      dispatch(setIsDefaultValue(originalValue));

      return rejectWithValue(error);
    }
  }
);

export const {
  setDepartments,
  setDepartment,
  setLoadingGetDetails,
  setDepartmentsLoading,
  setDepartmentManager,
  setDepartmentEmployees,
  setIsDefaultValue,
  updateSessionStorage,
} = departmentsSlice.actions;
export default departmentsSlice.reducer;

export const selectHasDefaultDepartment = (state) => {
  const departmentsList = state.departments.departments;

  if (!Array.isArray(departmentsList) || departmentsList.length === 0) {
    return false;
  }

  // Проверяем, есть ли хотя бы один отдел с is_default === true
  return departmentsList.some((dept) => dept.is_default === true);
};
