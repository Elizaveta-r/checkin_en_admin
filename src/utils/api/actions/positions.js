import { toast } from "sonner";
import {
  setPositions,
  setPositionsLoading,
} from "../../../store/slices/positionsSlice";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";

export const getPositionsList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/position/list?page=${page}&page_size=${pageSize}`,
      );
      if (res.status === 200) {
        dispatch(setPositions(res.data.positions));
        localStorage.setItem("positions", JSON.stringify(res.data.positions));
      }
      return res;
    } catch (error) {
      console.error("getPositionsList", error);
      throw error;
    }
  };
}; // rout: /organization/position/list (page, page_size > 200)

export const createPosition = (data) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.post(`/organization/position`, data);
      if (res.status === 200) {
        if (res.status === 200) {
          dispatch(getPositionsList(1, 10));
          toast.success("Position created successfully!");
        }

        return res.data;
      }
      return res;
    } catch (error) {
      logPostError("createPosition", error);
      console.error("createPosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
}; // rout: /organization/position (name, description)

export const createPositionWithoutReload = (data) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.post(`/organization/position`, data);
      if (res.status === 200) {
        toast.success("Position created successfully!");
        return res.data; // возвращаем только созданную должность
      }
      return res;
    } catch (error) {
      logPostError("createPosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
};

export const updatePosition = (data) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.put(`/organization/position`, data);
      if (res.status === 200) {
        dispatch(getPositionsList(1, 10));
        toast.success("Position updated successfully!");
        return res.data;
      }
      return res;
    } catch (error) {
      logPostError("updatePosition", error);
      console.error("updatePosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
}; // rout: /organization/position (position_id, name, description)

export const deletePosition = (id) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.delete(
        `/organization/position?position_id=${id}`,
      );
      if (res.status === 200) {
        dispatch(getPositionsList(1, 10));
        toast.success("Position deleted successfully!");
        return res.data;
      }
      return res;
    } catch (error) {
      logPostError("deletePosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
}; // rout: /organization/position (not allowed)
