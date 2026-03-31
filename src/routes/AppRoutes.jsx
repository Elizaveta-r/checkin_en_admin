import { useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { PageLayout } from "../layout/PageLayout/PageLayout";
import HomePage from "../pages/HomePage/HomePage";
import { AuthLayout } from "../layout/AuthLayout/AuthLayout";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { RegPage } from "../pages/RegPage/RegPage";
import { BillingPage } from "../pages/BillingPage/BillingPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import { CodeVerifyPage } from "../pages/CodeVerifyPage/CodeVerifyPage";
import EmployeePage from "../pages/EmployeePage/EmployeePage";
import DepartmentsPage from "../pages/DepartmentsPage/DepartmentsPage";
import DepartmentDetailPage from "../pages/DepartmentDetailPage/DepartmentDetailPage";
import EmployeeDetailPage from "../pages/EmployeeDetailPage/EmployeeDetailPage";
import TasksPage from "../pages/TasksPage/TasksPage";
import PositionsPage from "../pages/PositionsPage/PositionsPage";
import TasksDetailsPage from "../pages/TasksDetailsPage/TasksDetailsPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";
import { SettingsPage } from "../pages/SettimgsPage/SettingsPage";
import UpdateTaskPage from "../pages/UpdateTaskPage/UpdateTaskPage";
import IntegrationPage from "../pages/IntegrationPage/IntegrationPage";
import CreateBotPage from "../pages/CreateBotPage/CreateBotPage";
import { BaseLayout } from "../layout/BaseLayout/BaseLayout";
import EditEmployeePage from "../pages/EditEmployeePage/EditEmployeePage";
import StaffingTablePage from "../pages/StaffingTablePage/StaffingTablePage";

export default function AppRoutes() {
  const location = useLocation();

  const routes = useRoutes([
    {
      path: "/",
      element: (
        <PageLayout>
          <HomePage />
        </PageLayout>
      ),
      handle: {
        title: "Обзор | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/auth",
      element: (
        <AuthLayout>
          <AuthPage />
        </AuthLayout>
      ),
      handle: {
        title: "Авторизация | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/reg",
      element: (
        <AuthLayout>
          <RegPage />
        </AuthLayout>
      ),
      handle: {
        title: "Регистрация | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/code-verify",
      element: (
        <AuthLayout>
          <CodeVerifyPage />
        </AuthLayout>
      ),
      handle: {
        title: "Подтвердите почту | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/create-bot",
      element: (
        <BaseLayout>
          <CreateBotPage />
        </BaseLayout>
      ),
    },
    {
      path: "/billing",
      element: (
        <PageLayout>
          <BillingPage />
        </PageLayout>
      ),
      handle: {
        title: "Биллинг | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/employees",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <EmployeePage />,
          handle: {
            title: "Сотрудники | Летучка", // 👈 Заголовок
          },
        },
        {
          path: ":id",
          element: <EmployeeDetailPage />,
          handle: {
            title: "Детали сотрудника | Летучка", // 👈 Заголовок
          },
        },
        {
          path: ":id/update",
          element: <EditEmployeePage />,
        },
        {
          path: "new",
          element: <EditEmployeePage />,
        },
      ],
    },
    {
      path: "/departments",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <DepartmentsPage />,
          handle: {
            title: "Подразделения | Летучка", // 👈 Заголовок
          },
        },
        {
          path: ":id",
          element: <DepartmentDetailPage />,
          handle: {
            title: "Детали подразделения | Летучка", // 👈 Заголовок
          },
        },
      ],
    },
    {
      path: "/tasks",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <TasksPage />,
          handle: {
            title: "Задачи | Летучка", // 👈 Заголовок
          },
        },
        {
          path: ":id",
          element: <TasksDetailsPage />,
          handle: {
            title: "Детали задачи | Летучка", // 👈 Заголовок
          },
        },
        { path: "new", element: <UpdateTaskPage /> },
        { path: "update/:id", element: <UpdateTaskPage /> },
      ],
    },
    {
      path: "/reports",
      element: (
        <PageLayout>
          <ReportsPage />
        </PageLayout>
      ),
      handle: {
        title: "Отчеты | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/staffing-table",
      element: (
        <PageLayout>
          <StaffingTablePage />
        </PageLayout>
      ),
    },
    {
      path: "/settings",
      element: (
        <PageLayout>
          <SettingsPage />
        </PageLayout>
      ),
      handle: {
        title: "Настройки | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/positions",
      element: (
        <PageLayout>
          <PositionsPage />
        </PageLayout>
      ),
      handle: {
        title: "Должности | Летучка", // 👈 Заголовок
      },
    },
    {
      path: "/integrations",
      element: (
        <PageLayout>
          <IntegrationPage />
        </PageLayout>
      ),
    },
    {
      path: "/*",
      element: (
        <PageLayout>
          <NotFoundPage />
        </PageLayout>
      ),
      handle: {
        title: "Страница не найдена | Летучка", // 👈 Заголовок
      },
    },
  ]);

  const isAuthRoute = ["/auth", "/reg", "/code-verify"].includes(
    location.pathname
  );

  return isAuthRoute ? (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>{routes}</div>
    </AnimatePresence>
  ) : (
    routes
  );
}
