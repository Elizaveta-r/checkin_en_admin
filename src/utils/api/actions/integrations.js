import { toast } from "sonner";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";
import {
  setIntegrationsList,
  setIsIntegrationLoading,
} from "../../../store/slices/integrationsSlice";

export const getIntegrationsList = (page, page_size) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/integration/list?page=${page}&page_size=${page_size}`,
      );
      if (res.status === 200) {
        dispatch(setIntegrationsList(res.data.integrations));
      }
      return res;
    } catch (error) {
      console.error("getIntegrations", error);
      throw error;
    }
  };
};

/**
 * @param name string
 * @param description string
 * @param use_type string (employee_interface)
 * @param integration_type string (telegram_bot)
 * @param perpetual_token string (токен интеграции, в нашем случае бота)
 * @returns
 */
export const createIntegration = (data) => {
  return async (dispatch) => {
    dispatch(setIsIntegrationLoading(true));
    try {
      const res = await $authHost.post(`/integration`, data);
      if (res.status === 200) {
        dispatch(getIntegrationsList(1, 200));
        toast.success("Integration created successfully!");
      }
      return res;
    } catch (error) {
      logPostError("createIntegration", error);
      throw error;
    } finally {
      dispatch(setIsIntegrationLoading(false));
    }
  };
};

export const toggleIntegrationStatus = (integration_id, status) => {
  return async (dispatch) => {
    dispatch(setIsIntegrationLoading(true));
    try {
      const res = await $authHost.put(
        `/integration/enabled?integration_id=${integration_id}&enabled=${status}`,
      );
      if (res.status === 200) {
        dispatch(getIntegrationsList(1, 200));
        return true;
      }
      return false;
    } catch (error) {
      logPostError("toggleIntegrationStatus", error);
      return false;
    } finally {
      dispatch(setIsIntegrationLoading(false));
    }
  };
};

/**
 * @param integration_id string
 * @param name string
 * @param description string
 * @param use_type string (employee_interface)
 * @param integration_type string (telegram_bot)
 * @param perpetual_token string (токен интеграции, в нашем случае бота)
 * @returns
 */
export const updateIntegration = (data) => {
  return async (dispatch) => {
    dispatch(setIsIntegrationLoading(true));
    try {
      const res = await $authHost.put(`/integration`, data);
      if (res.status === 200) {
        dispatch(getIntegrationsList(1, 200));
        toast.success("Integration updated successfully!");
      }
      return res;
    } catch (error) {
      logPostError("updateIntegration", error);
      throw error;
    } finally {
      dispatch(setIsIntegrationLoading(false));
    }
  };
};
export const getIntegrationById = (id) => {
  return async () => {
    try {
      const res = await $authHost.get(`/integration?integration_id=${id}`);

      return res;
    } catch (error) {
      console.error("getIntegrationById", error);
      throw error;
    }
  };
};

export const deleteIntegration = (id) => {
  return async (dispatch) => {
    dispatch(setIsIntegrationLoading(true));
    try {
      const res = await $authHost.delete(`/integration?integration_id=${id}`);
      if (res.status === 200) {
        dispatch(getIntegrationsList(1, 200));
        toast.success("Integration deleted successfully!");
      }
      return res;
    } catch (error) {
      logPostError("deleteIntegration", error);
      throw error;
    } finally {
      dispatch(setIsIntegrationLoading(false));
    }
  };
};
