import { createSlice } from "@reduxjs/toolkit";

const initialDraftTask = {
  title: "",
  task_type: { value: "daily", label: "Ежедневно" }, // Передаем на бек строку value
  week_days: [], // int
  month_days: [],
  start_time: "",
  deadline_time: "",
  onetime_date: "", // Единоразовая дата
  late_push: false, // просрочка
  to_report: false, // в итоговый отчет
  done_type: "", // Тип подтверждения
  ai_prompt: "", // Критерий приемки
  // department_id: "",
  position_ids: [],
  department_ids: [],
};

const initialTaskFilters = {
  department_ids: [], // 👈 массив выбранных подразделений
  position_ids: [], // 👈 массив выбранных должностей
  searchText: "",
};

const initialState = {
  data: localStorage.getItem("tasksData")
    ? JSON.parse(localStorage.getItem("tasksData"))
    : null,
  isEdit: sessionStorage.getItem("isEdit")
    ? JSON.parse(sessionStorage.getItem("isEdit"))
    : false,
  draftTask: sessionStorage.getItem("draftTask")
    ? JSON.parse(sessionStorage.getItem("draftTask"))
    : initialDraftTask,
  activeTask: sessionStorage.getItem("activeTask")
    ? JSON.parse(sessionStorage.getItem("activeTask"))
    : null,

  // 🔹 Новый параметр — режим отображения
  viewMode: localStorage.getItem("viewMode") || "full", // "full" | "short"
  taskFilters: initialTaskFilters,
  filteredTasks: [],
  loadingTask: false,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setIsEdit(state, action) {
      state.isEdit = action.payload;
      sessionStorage.setItem("isEdit", action.payload);
    },
    setActiveTask(state, action) {
      state.activeTask = action.payload;
      sessionStorage.setItem("activeTask", JSON.stringify(action.payload));
    },
    setLoadingTask(state, action) {
      state.loadingTask = action.payload;
    },
    setTaskFilter(state, action) {
      const { key, value } = action.payload;
      state.taskFilters[key] = value;
    },
    setTaskFilters(state, action) {
      state.taskFilters = action.payload;
    },
    resetTaskFilters(state) {
      state.taskFilters = initialTaskFilters;
    },
    resetPhotoToggles: (state) => {
      if (state.draftTask) {
        state.draftTask.ai_prompt = "";
      }
    },

    setViewMode(state, action) {
      state.viewMode = action.payload; // "full" или "short"
      localStorage.setItem("viewMode", action.payload);
    },

    setDraftFromEditedTask(state, action) {
      const serverTask = action.payload;

      // Конвертация поля task_type
      const taskTypeOptions = [
        { value: "daily", label: "Ежедневно" },
        { value: "weekly", label: "Еженедельно" },
        { value: "monthly", label: "Ежемесячно" },
        { value: "onetime", label: "Единоразово" },
      ];
      const taskType = taskTypeOptions.find(
        (o) => o.value === serverTask.time_type
      ) || { value: serverTask.time_type, label: "Неизвестно" };

      // Конвертация week_days
      const weekDaysOptions = [
        { value: 1, label: "Понедельник" },
        { value: 2, label: "Вторник" },
        { value: 3, label: "Среда" },
        { value: 4, label: "Четверг" },
        { value: 5, label: "Пятница" },
        { value: 6, label: "Суббота" },
        { value: 7, label: "Воскресенье" },
      ];
      const weekDays = serverTask.week_days
        ? serverTask.week_days.map(
            (dayValue) =>
              weekDaysOptions.find((d) => d.value === dayValue) || {
                value: dayValue,
                label: dayValue,
              }
          )
        : [];

      // Конвертация done_type (Тип подтверждения)
      const doneTypeOptions = [
        { value: "photo", label: "Фото" },
        { value: "text", label: "Текст" },
        { value: "check_box", label: "Чекбокс" },
      ];

      const doneType = doneTypeOptions.find(
        (o) => o.value === serverTask.done_type
      ) || { value: serverTask.done_type, label: "Неизвестно" };

      const departmentIds = serverTask.departments
        ? serverTask.departments.map((d) => ({ value: d.id, label: d.name }))
        : [];

      const positionIds = serverTask.positions
        ? serverTask.positions.map((p) => ({ value: p.id, label: p.name }))
        : [];

      const getFormattedDate = (dateString) => {
        if (!dateString || dateString === "0001-01-01 00:00:00 +0000 UTC")
          return "";
        return new Date(dateString).toISOString();
      };

      state.draftTask = {
        ...state.draftTask,

        title: serverTask.title,
        task_type: taskType,
        week_days: weekDays,
        month_days: serverTask.month_days || [],

        start_time: serverTask.start_time,
        deadline_time: serverTask.deadline_time,
        onetime_date: getFormattedDate(serverTask.onetime_date),

        late_push: serverTask.late_push, // Предполагаем обратное соответствие
        to_report: serverTask.to_report, // Предполагаем обратное соответствие

        done_type: doneType,
        ai_prompt: serverTask.ai_prompt,

        department_ids: departmentIds,
        position_ids: positionIds,

        id: serverTask.id, // ID задачи
      };
    },
    // setDepartmentIdToDraft(state, action) {
    //   // action.payload ожидает объект { value: id, label: name }
    //   state.draftTask.department_id = action.payload;
    // },
    setTasks(state, action) {
      state.data = action.payload;
    },
    resetDraftTask(state) {
      state.draftTask = initialDraftTask;
    },
    loadTaskToDraft(state, action) {
      state.draftTask = { ...initialDraftTask, ...action.payload };
    },
    setDraftName(state, action) {
      state.draftTask.title = action.payload;
    },
    setTimeType(state, action) {
      state.draftTask.task_type = action.payload;
    },
    setWeekDays(state, action) {
      state.draftTask.week_days = action.payload;
    },
    setMonthDays(state, action) {
      state.draftTask.month_days = action.payload;
    },
    setStartTime(state, action) {
      state.draftTask.start_time = action.payload;
    },
    setDeadlineTime(state, action) {
      state.draftTask.deadline_time = action.payload;
    },
    setDisposableDate(state, action) {
      state.draftTask.onetime_date = action.payload;
    },

    setExpiredNotify(state, action) {
      state.draftTask.late_push = action.payload;
    },
    setToFinalReport(state, action) {
      state.draftTask.to_report = action.payload;
    },
    setDoneType(state, action) {
      state.draftTask.done_type = action.payload;
    },
    setAcceptCondition(state, action) {
      state.draftTask.ai_prompt = action.payload;
    },
    setDepartmentIds(state, action) {
      state.draftTask.department_ids = action.payload;
    },
    setPositionIds(state, action) {
      state.draftTask.position_ids = action.payload;
    },
    setFilteredTasks(state, action) {
      state.filteredTasks = action.payload;
    },
  },
});

// export const areTaskFiltersChanged = (state) => {
//   const currentFilters = state.tasks.taskFilters;

//   // Проверяем, отличается ли хоть один ключ от начального состояния
//   return Object.keys(initialTaskFilters).some((key) => {
//     const initialValue = initialTaskFilters[key];
//     const currentValue = currentFilters[key];

//     // Специальная проверка для null/undefined/пустой строки
//     if (key === "searchText") {
//       return currentValue !== initialValue;
//     }

//     // Для department_id и position_id, которые могут быть null/undefined
//     return currentValue !== initialValue;
//   });
// };
export const areTaskFiltersChanged = (state) => {
  const current = state.tasks.taskFilters;

  // что-то typed, но простая версия:
  const isSearchChanged = current.searchText !== initialTaskFilters.searchText;
  const isDepChanged =
    (current.department_ids?.length || 0) !==
    (initialTaskFilters.department_ids.length || 0);
  const isPosChanged =
    (current.position_ids?.length || 0) !==
    (initialTaskFilters.position_ids.length || 0);

  return isSearchChanged || isDepChanged || isPosChanged;
};

export const {
  setIsEdit,
  setActiveTask,
  setTaskFilter,
  setLoadingTask,
  setTaskFilters,
  setSort,
  setViewMode,
  setDraftFromEditedTask,
  // setDepartmentIdToDraft,
  setTasks,
  resetDraftTask,
  loadTaskToDraft,
  setDraftName,
  setTimeType,
  setWeekDays,
  setMonthDays,
  setStartTime,
  setDeadlineTime,
  setDisposableDate,
  resetPhotoToggles,
  setExpiredNotify,
  setToFinalReport,
  setDoneType,
  setAcceptCondition,
  resetTaskFilters,
  setPositionIds,
  setDepartmentIds,
  setFilteredTasks,
} = tasksSlice.actions;
export default tasksSlice.reducer;
