import {
  setAiSuccessRate,
  setCheckedInCount,
  setDayStats,
  setDoneTasks,
  setEmployeesCount,
  setNeedAttention,
  setNotDoneTasks,
} from "../../../store/slices/dashboardSlice";
import { $authHost } from "../http";

export const getDashboard = () => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(`/workflow/dashboard`);
      if (res.status === 200) {
        dispatch(setAiSuccessRate(res.data.dashboard.ai_success_rate));
        dispatch(setCheckedInCount(res.data.dashboard.checked_in_count));
        dispatch(setDayStats(res.data.dashboard.day_stats));
        dispatch(setDoneTasks(res.data.dashboard.done_tasks));
        dispatch(setEmployeesCount(res.data.dashboard.employees_count));
        dispatch(setNeedAttention(res.data.dashboard.is_problem));
        dispatch(setNotDoneTasks(res.data.dashboard.not_done_tasks));
      }
      return res;
    } catch (error) {
      console.error("getDashboard", error);
      throw error;
    }
  };
};
