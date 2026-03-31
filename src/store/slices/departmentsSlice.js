import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateDepartment } from "../../utils/api/actions/departments";
import { toast } from "sonner";

const initialDepartmentState = {
  id: null,
  name: null,
  description: null,

  manager: null,
  employees: [],
};

const getInitialDepartment = () => {
  const savedDepartment = sessionStorage.getItem("department");
  if (savedDepartment) {
    const parsed = JSON.parse(savedDepartment);
    return {
      ...initialDepartmentState,
      ...parsed,
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
    },
    updateSessionStorage(state) {
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartmentManager(state, action) {
      state.department.manager = action.payload;
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartmentEmployees(state, action) {
      state.department.employees = action.payload;
      sessionStorage.setItem("department", JSON.stringify(state.department));
    },
    setDepartment(state, action) {
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
    const originalValue = department.is_default;
    dispatch(setIsDefaultValue(newValue));

    const dataForServer = {
      department_id: department.id,
      title: department.title,
      description: department.description,
      timezone: department.timezone,
      check_in_time: department.check_in_time,
      check_out_time: department.check_out_time,
      is_default: newValue,
    };

    const toastId = toast.loading("Saving...");

    try {
      await dispatch(updateDepartment(dataForServer));

      dispatch(updateSessionStorage());

      toast.dismiss(toastId);

      return newValue;
    } catch (error) {
      dispatch(setIsDefaultValue(originalValue));

      return rejectWithValue(error);
    }
  },
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

  return departmentsList.some((dept) => dept.is_default === true);
};
