import React from "react";
import styles from "./TasksDetailsPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useSelector } from "react-redux";

export default function TasksDetailsPage() {
  const { activeTask } = useSelector((state) => state.tasks);

  return (
    <div className={styles.container}>
      <PageTitle title={"Детали задачи"} />

      <TaskCard task={activeTask} isFull />
    </div>
  );
}
