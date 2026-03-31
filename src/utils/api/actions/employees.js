import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";
import {
  setEmployee,
  setEmployeeHistory,
  setEmployees,
  setEmployeesLoading,
  setEmployeesWithHistory,
  setFilteredEmployees,
  setLoadingGetEmployee,
} from "../../../store/slices/employeesSlice";
import { toast } from "sonner";
import {
  setDepartmentEmployees,
  setDepartmentManager,
} from "../../../store/slices/departmentsSlice";

export const getEmployeesList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/employee/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        dispatch(setEmployees(res.data.employees));
        sessionStorage.setItem("employees", JSON.stringify(res.data.employees));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const getFilteredEmployeesList = (page, pageSize, filters = {}) => {
  return async (dispatch) => {
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("page_size", pageSize);

      const { position_ids, department_ids, role } = filters;

      if (position_ids?.length) {
        params.set("positions", position_ids.join(","));
      }

      if (department_ids?.length) {
        params.set("departments", department_ids.join(","));
      }

      if (role) {
        // имя параметра подгони под бэк: role / roles / employee_role и т.п.
        params.set("role", role);
      }

      const res = await $authHost.get(
        `/organization/employee/list?${params.toString()}`
      );

      if (res.status === 200) {
        dispatch(setFilteredEmployees(res.data.employees));
      }

      return res;
    } catch (e) {
      console.error("getEmployeesList", e);
      throw e;
    }
  };
};

export const getEmployeesByDepartmentAndRole = (departmentId, role) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/employee/list?page=1&page_size=200&departments=${departmentId}&role=${role}`
      );
      if (res.status === 200) {
        if (role === "head") {
          dispatch(setDepartmentManager(res.data.employees));
        } else {
          dispatch(setDepartmentEmployees(res.data.employees));
        }
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const createEmployee = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.post(`/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 1000));
        toast.success("Сотрудник успешно создан!");
      }
      return res;
    } catch (error) {
      logPostError("createEmployee", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const updateEmployee = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.put(`/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 1000));
        dispatch(getEmployeeWithHistory(data.employee_id, 1, 1000));
        toast.success("Сотрудник успешно обновлен!");
      }
      return res;
    } catch (error) {
      logPostError("updateEmployee", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

/**
 * @param contact_id string
 * @param type string
 * @param value string
 *
 * @returns {Promise<void>}
 */
export const updateEmployeeContact = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.put(`/organization/contact`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 200));
        dispatch(getEmployeeById(data.employee_id));
        toast.success("Контактные данные сотрудника были успешно обновлены!");
      }
      return res;
    } catch (error) {
      logPostError("updateEmployeeContact", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const createEmployeeContact = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.post(`/organization/contact`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 200));
        dispatch(getEmployeeById(data.employee_id));
        toast.success("Контактные данные сотрудника были успешно созданы!");
      }
      return res;
    } catch (error) {
      logPostError("createEmployeeContact", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const getEmployeeById = (id) => {
  return async (dispatch) => {
    dispatch(setLoadingGetEmployee(id));
    try {
      const res = await $authHost.get(
        `/organization/employee?employee_id=${id}`
      );
      if (res.status === 200) {
        dispatch(setEmployee(res.data.employee));
      }
      return res;
    } catch (error) {
      console.error("getEmployeeById", error);
      throw error;
    } finally {
      dispatch(setLoadingGetEmployee(null));
    }
  };
};

export const deleteEmployee = (id) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.delete(
        `/organization/employee?employee_id=${id}`
      );
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 1000));
        toast.success("Сотрудник успешно удален!");
      }
      return res;
    } catch (error) {
      logPostError("deleteEmployee", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

// export const getEmployeeWithHistory = (
//   employeeId,
//   page,
//   pageSize,
//   startDate = "",
//   endDate = ""
// ) => {
//   return async (dispatch) => {
//     dispatch(setLoadingGetEmployee(employeeId));
//     try {
//       const res = await $authHost.get(
//         `/organization/employee/history?employee_id=${employeeId}&page=${page}&page_size=${pageSize}&start_date=${startDate}&end_date=${endDate}`
//       );
//       if (res.status === 200) {
//         dispatch(setEmployee(res.data.employee));
//         dispatch(setEmployeeHistory(res.data.employee_history));
//       }
//       return res;
//     } catch (error) {
//       logPostError(error);
//       throw error;
//     } finally {
//       dispatch(setLoadingGetEmployee(null));
//     }
//   };
// };

export const getEmployeeWithHistory = (
  employeeId,
  page,
  pageSize,
  startDate = "",
  endDate = ""
) => {
  return async (dispatch) => {
    dispatch(setLoadingGetEmployee(employeeId));

    try {
      const params = new URLSearchParams({
        employee_id: employeeId,
        page,
        page_size: pageSize,
      });

      if (startDate) params.append("created_from", startDate);
      if (endDate) params.append("created_to", endDate);

      const res = await $authHost.get(
        `/workflow/event/list?${params.toString()}`
      );

      if (res.status === 200) {
        dispatch(getEmployeeById(employeeId));
        dispatch(setEmployeeHistory(res.data.events));
      }

      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setLoadingGetEmployee(null));
    }
  };
};

export const getAllEmployeesWithHistory = (
  page = 1,
  pageSize = 1000,
  startDate = "",
  endDate = ""
) => {
  return async (dispatch) => {
    try {
      // 1️⃣ Получаем список сотрудников
      const listRes = await dispatch(getEmployeesList(page, pageSize));

      if (listRes?.status === 200 && listRes.data?.employees) {
        const employees = listRes.data.employees;

        // 2️⃣ Загружаем историю для каждого сотрудника (с учётом диапазона)
        const results = await Promise.all(
          employees.map(async (emp) => {
            try {
              const histRes = await dispatch(
                getEmployeeWithHistory(emp.id, 1, 100, startDate, endDate)
              );

              return {
                ...emp,
                employee_history: histRes?.data?.events || [],
              };
            } catch {
              return { ...emp, employee_history: [] };
            }
          })
        );

        // 3️⃣ Сохраняем итог в Redux
        dispatch(setEmployeesWithHistory(results));
        return results;
      }
    } catch (error) {
      console.error("Ошибка при получении сотрудников с историей:", error);
    }
  };
};

export const getEventHistory = (event_id, page, pageSize) => {
  return async (dispatch) => {
    try {
      return $authHost.get(
        `/workflow/event/history?event_id=${event_id}&page=${page}&page_size=${pageSize}`
      );
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};
