import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";
import {
  resetTaskFilters,
  areTaskFiltersChanged,
  setTaskFilter,
  setViewMode,
} from "../../store/slices/tasksSlice";

import styles from "./TaskFilter.module.scss";
import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { ArrowDownAZ, Eye, Filter, LayoutGrid, LayoutList } from "lucide-react";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { useMediaQuery } from "react-responsive";
import { Button } from "../../ui/Button/Button";
import { getTasksWithFilters } from "../../utils/api/actions/tasks";

const viewOptions = [
  {
    value: "full",
    label: "Стандартное отображение",
    icon: <LayoutList size={12} />,
  },
  {
    value: "short",
    label: "Упрощённое отображение",
    icon: <LayoutGrid size={12} />,
  },
];

export const TaskFilter = () => {
  const dispatch = useDispatch();

  const isBigScreen = useMediaQuery({
    query: "(min-width: 1331px)",
  });

  const isTablet = useMediaQuery({
    query: "(max-width: 767px)",
  });

  const isSmallDesktop = useMediaQuery({
    query: "(max-width: 1330px)",
  });

  const isMobile = useMediaQuery({
    query: "(max-width: 479px)",
  });

  const isSmallMobile = useMediaQuery({
    query: "(max-width: 369px)",
  });

  const { positions } = useSelector((state) => state?.positions);
  const { departments } = useSelector((state) => state?.departments);
  const { taskFilters, viewMode } = useSelector((state) => state?.tasks);

  const { searchText, department_ids, position_ids } = taskFilters;

  const [visibleAllFilters, setVisibleAllFilters] = useState(false);

  const filtersAreActive = useSelector(areTaskFiltersChanged);

  const currentOption = viewOptions.find((o) => o.value === viewMode);

  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions]
  );

  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );

  const handleViewModeChange = (option) => {
    dispatch(setViewMode(option.value));
  };

  const handleSearchChange = (e) => {
    dispatch(
      setTaskFilter({
        key: "searchText",
        value: e.target.value,
      })
    );
  };

  const handleSelectChange = (key, selectedOption) => {
    const normalizedValue = Array.isArray(selectedOption)
      ? selectedOption
      : selectedOption
      ? [selectedOption]
      : [];

    dispatch(
      setTaskFilter({
        key,
        value: normalizedValue,
      })
    );

    dispatch(getTasksWithFilters(1, 100));
  };

  return (
    <div className={styles.filters}>
      {isSmallDesktop && !isMobile && !isTablet && (
        <div className={styles.filtersMobile}>
          <SearchInput
            placeholder={"Поиск по задачам..."}
            value={searchText}
            onChange={handleSearchChange}
          />
          <div className={styles.selects}>
            <CustomSelect
              isMulti
              onChange={(selectedOption) =>
                handleSelectChange("position_ids", selectedOption)
              }
              value={position_ids}
              options={positionsOptions}
              placeholder="Выберите должности"
            />

            <CustomSelect
              options={departmentsOptions}
              placeholder="Выберите отделы"
              value={department_ids}
              isMulti
              onChange={(selectedOption) =>
                handleSelectChange("department_ids", selectedOption)
              }
            />

            <Sorting
              viewMode={currentOption}
              options={viewOptions}
              onChange={handleViewModeChange}
            />
          </div>
        </div>
      )}

      {(isMobile || isTablet) && (
        <div className={styles.filtersMobile}>
          <div className={styles.inputs}>
            <SearchInput
              placeholder={isSmallMobile ? "Поиск..." : "Поиск по задачам..."}
              value={searchText}
              onChange={handleSearchChange}
            />
            <Sorting
              viewMode={currentOption}
              options={viewOptions}
              onChange={handleViewModeChange}
            />
            <Button
              onClick={() => setVisibleAllFilters(!visibleAllFilters)}
              leftIcon={<Filter size={16} className={styles.sortIcon} />}
              className={styles.filtersButton}
            />
          </div>

          {visibleAllFilters && (
            <div className={styles.selects}>
              <CustomSelect
                isMulti
                onChange={(selectedOption) =>
                  handleSelectChange("position_ids", selectedOption)
                }
                value={position_ids}
                options={positionsOptions}
                placeholder="Выберите должности"
              />

              <CustomSelect
                options={departmentsOptions}
                placeholder="Выберите отделы"
                value={department_ids}
                isMulti
                onChange={(selectedOption) =>
                  handleSelectChange("department_ids", selectedOption)
                }
              />
            </div>
          )}
        </div>
      )}

      {isBigScreen && (
        <>
          <SearchInput
            placeholder={"Поиск по задачам..."}
            value={searchText}
            onChange={handleSearchChange}
          />
          <CustomSelect
            isMulti
            onChange={(selectedOption) =>
              handleSelectChange("position_ids", selectedOption)
            }
            value={position_ids}
            options={positionsOptions}
            placeholder="Выберите должности"
          />

          <CustomSelect
            options={departmentsOptions}
            placeholder="Выберите отделы"
            value={department_ids}
            isMulti
            onChange={(selectedOption) =>
              handleSelectChange("department_ids", selectedOption)
            }
          />

          <Sorting
            viewMode={currentOption}
            options={viewOptions}
            onChange={handleViewModeChange}
            isSmallDesktop={isSmallDesktop}
          />
        </>
      )}

      {filtersAreActive && (
        <button
          className={styles.clearFiltersBtn}
          onClick={() => {
            dispatch(resetTaskFilters());
            dispatch(getTasksWithFilters(1, 100));
          }}
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
};

const getSortIcon = (key) => {
  switch (key) {
    case "full":
      return LayoutList;
    case "short":
      return LayoutGrid;
    default:
      return ArrowDownAZ;
  }
};
const Sorting = ({ viewMode, options, onChange, isSmallDesktop }) => {
  const sortRef = useRef(null);
  const [visibleOptions, setVisibleOptions] = useState(false);

  const handleToggle = () => {
    setVisibleOptions(!visibleOptions);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setVisibleOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setVisibleOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 💡 Определяем текущую иконку для отображения в заголовке
  const CurrentIcon = viewMode?.value ? getSortIcon(viewMode.value) : Eye;

  return (
    <div className={styles.sort} ref={sortRef}>
      <HintWithPortal
        hasIcon={false}
        hintContent={"Тип отображения"}
        position={isSmallDesktop ? "right" : "top"}
      >
        <div className={styles.sortHeader} onClick={handleToggle}>
          {/* 💡 Отображаем ТОЛЬКО иконку текущего типа сортировки */}
          <CurrentIcon size={18} className={styles.sortIcon} />
        </div>
      </HintWithPortal>

      {visibleOptions && (
        <div className={styles.sortOptions}>
          {options?.map((option) => (
            <div
              onClick={() => handleOptionClick(option)}
              key={`${option.value}`}
              className={`${styles.optionContainer} ${
                viewMode?.value === option.value ? styles.activeOption : ""
              }`}
            >
              <div className={styles.icon}>{option.icon}</div>

              {/* Отображаем полный текст опции */}
              <p className={styles.option}>{option.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
