import styles from "./TasksPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useEffect, useMemo } from "react";
import { getTasksWithFilters } from "../../utils/api/actions/tasks";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  resetDraftTask,
  setFilteredTasks,
  setIsEdit,
} from "../../store/slices/tasksSlice";
import { TaskFilter } from "../../modules/TaskFilter/TaskFilter";
import { toast } from "sonner";
import { Loading } from "../../ui/Loading/Loading";
import { SimpleTaskInfoTable } from "../../modules/SimpleTaskInfoTable/SimpleTaskInfoTable";
import { useMediaQuery } from "react-responsive";

export default function TasksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    taskFilters,
    data: tasks,
    filteredTasks: filteredTasksFromStore,
    loadingTask,
    viewMode,
  } = useSelector((state) => state?.tasks);
  const { departments } = useSelector((state) => state?.departments);

  const isShowCardMdScreen = useMediaQuery({
    query: "(min-width: 1024px) and (max-width: 1222px)",
  });

  const isShowCardSmScreen = useMediaQuery({
    query: "(max-width: 930px)",
  });

  const { searchText } = taskFilters;

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const normalizedSearchText = searchText ? searchText.toLowerCase() : null;

    return tasks?.filter((task) => {
      const matchesSearch = normalizedSearchText
        ? [
            task?.title,
            task?.ai_prompt,
            task?.positions?.map((p) => p.name).join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearchText)
        : true;

      return matchesSearch;
    });
  }, [tasks, searchText]);

  useEffect(() => {
    dispatch(setFilteredTasks(filteredTasks));
  }, [filteredTasks, dispatch]);

  const handleGoToNewTask = () => {
    dispatch(setIsEdit(false));
    dispatch(resetDraftTask());
    if (!departments) {
      toast("Department not found", {
        description: "To continue, create at least one department.",
        action: {
          label: "Create",
          onClick: () => navigate("/departments?create=true"),
        },
        style: { textAlign: "left" },
      });
    } else {
      navigate("/tasks/new");
    }
  };

  useEffect(() => {
    dispatch(getTasksWithFilters(1, 200));
  }, [dispatch, taskFilters]);

  return (
    <div className={styles.container}>
      <PageTitle
        title={"Tasks"}
        hasButton
        onClick={handleGoToNewTask}
        dataTour={"tasks.add"}
        dataTourMobile={"menu.tasks"}
      />
      {tasks && <TaskFilter />}
      {!loadingTask &&
        (tasks ? (
          <div
            className={`${styles.tasksContainer} ${styles[viewMode]}`}
            style={{
              display: filteredTasksFromStore?.length === 0 ? "flex" : "grid",
              justifyContent: filteredTasksFromStore?.length === 0 && "center",
            }}
          >
            {filteredTasksFromStore?.length > 0 ? (
              viewMode === "full" ||
              isShowCardSmScreen ||
              isShowCardMdScreen ? (
                filteredTasksFromStore?.map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    isViewShort={viewMode === "short"}
                  />
                ))
              ) : (
                <SimpleTaskInfoTable tasks={filteredTasksFromStore} />
              )
            ) : (
              <div className={styles.empty}>
                No tasks found. <br /> Try <strong>changing the filters</strong>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            No tasks yet. <br /> Click <strong>"Add"</strong> to create your
            first task.
          </div>
        ))}
      {loadingTask && <Loading />}
    </div>
  );
}
