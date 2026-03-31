import {
  setLoadingTable,
  setTable,
} from "../../../store/slices/staffingTableSlice";
import { $authHost } from "../http";

export const getTableData = (created_from, created_to, timezone) => {
  return async (dispatch) => {
    dispatch(setLoadingTable(true));
    try {
      const res = await $authHost.get(
        `/workflow/worklog/table?created_from=${created_from}&created_to=${created_to}&timezone=${timezone}`
      );
      if (res.status == 200) {
        dispatch(setTable(res.data.departments || []));
      }

      return res;
    } catch (error) {
      console.error("error: getTableData", error);
      throw error;
    } finally {
      dispatch(setLoadingTable(false));
    }
  };
};
