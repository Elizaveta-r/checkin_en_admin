import { toast } from "sonner";
import {
  setDepartment,
  setDepartments,
  setDepartmentsLoading,
} from "../../../store/slices/departmentsSlice";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";
import { getEmployeesByDepartmentAndRole } from "./employees";

export const getDepartmentsList = (page, page_size) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/department/list?page=${page}&page_size=${page_size}`,
      );
      if (res.status === 200) {
        dispatch(setDepartments(res.data.departments));
        sessionStorage.setItem(
          "departments",
          JSON.stringify(res.data.departments),
        );
      }
      return res;
    } catch (error) {
      console.error("getDepartmentsList", error);
      throw error;
    }
  };
}; // route: /organization/department/list

export const getDepartmentById = (id) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.get(
        `/organization/department?department_id=${id}`,
      );
      if (res.status === 200) {
        dispatch(setDepartment(res.data.department));
        dispatch(getEmployeesByDepartmentAndRole(id, "head"));
        dispatch(getEmployeesByDepartmentAndRole(id, "employee"));
      }
      return res;
    } catch (error) {
      console.error("getDepartmentsList", error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
};

export const createDepartment = (data) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.post(`/organization/department`, data);
      if (res.status === 200) {
        dispatch(getDepartmentsList(1, 10));
        toast.success("Department created successfully!");
      }
      return res;
    } catch (error) {
      logPostError("createDepartment", error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
}; // route: /organization/department
export const updateDepartment = (data) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.put(`/organization/department`, data);
      if (res.status === 200) {
        dispatch(getDepartmentsList(1, 10));
        toast.success("Department updated successfully!");
      }
      return res;
    } catch (error) {
      logPostError("updateDepartment", error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
}; // route: /organization/department
export const deleteDepartment = (id) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.delete(
        `/organization/department?department_id=${id}`,
      );
      if (res.status === 200) {
        dispatch(getDepartmentsList(1, 10));
        toast.success("Department deleted successfully!");
      }
      return res;
    } catch (error) {
      logPostError("deleteDepartment", error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
};
