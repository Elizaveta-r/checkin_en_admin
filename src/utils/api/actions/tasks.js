import { toast } from "sonner";
import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";
import {
  setActiveTask,
  setFilteredTasks,
  setLoadingTask,
  setTasks,
} from "../../../store/slices/tasksSlice";

export const getTasksList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/task/list?page=${page}&page_size=${pageSize}`,
      );
      if (res.status === 200) {
        dispatch(setTasks(res.data.tasks));
        localStorage.setItem("tasksData", JSON.stringify(res.data.tasks));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const getFilteredTasks = (page, pageSize, filterTitle, filterValue) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.get(
        `/organization/task/list?page=${page}&page_size=${pageSize}&${filterTitle}=${filterValue}`,
      );
      if (res.status === 200) {
        dispatch(setTasks(res.data.tasks));
        localStorage.setItem("tasksData", JSON.stringify(res.data.tasks));
      }
      return res;
    } catch (error) {
      logPostError("getFilteredTasks", error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const getTasksWithFilters = (page = 1, pageSize = 100) => {
  return async (dispatch, getState) => {
    dispatch(setLoadingTask(true));
    try {
      const { taskFilters } = getState().tasks;
      const params = new URLSearchParams();

      params.set("page", page);
      params.set("page_size", pageSize);

      if (taskFilters.searchText) {
        params.set("search", taskFilters.searchText);
      }

      if (
        Array.isArray(taskFilters.department_ids) &&
        taskFilters.department_ids.length
      ) {
        const ids = taskFilters.department_ids.map((d) => d.value);
        params.set("departments", ids.join(","));
      }

      if (
        Array.isArray(taskFilters.position_ids) &&
        taskFilters.position_ids.length
      ) {
        const ids = taskFilters.position_ids.map((p) => p.value);
        params.set("positions", ids.join(","));
      }

      const res = await $authHost.get(
        `/organization/task/list?${params.toString()}`,
      );

      if (res.status === 200) {
        dispatch(setFilteredTasks(res.data.tasks));
        localStorage.setItem("tasksData", JSON.stringify(res.data.tasks));
      }

      return res;
    } catch (error) {
      logPostError("getTasksWithFilters", error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const createTask = (data) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.post(`/organization/task`, data);
      if (res.status === 200) {
        dispatch(getTasksList(1, 1000));
        toast.success("Task created successfully!");
      }
      return res;
    } catch (error) {
      logPostError("createTask", error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const updateTask = (data) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.put(`/organization/task`, data);
      if (res.status === 200) {
        dispatch(getTasksList(1, 1000));
        toast.success("Task updated successfully!");
      }
      return res;
    } catch (error) {
      logPostError("updateTask", error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const getTaskById = (id) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(`/organization/task?task_id=${id}`);
      if (res.status === 200) {
        dispatch(setActiveTask(res.data.task));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const deleteTask = (id) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.delete(`/organization/task?task_id=${id}`);
      if (res.status === 200) {
        dispatch(getTasksList(1, 1000));
        toast.success("Task deleted successfully!");
      }
      return res;
    } catch (error) {
      logPostError("deleteTask", error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};
