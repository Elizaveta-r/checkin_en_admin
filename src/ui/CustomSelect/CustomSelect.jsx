/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomSelect.module.scss";
import { ChevronDown, Search, Plus, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RingLoader } from "react-spinners";

/**
 * Переиспользуемый компонент селекта с поддержкой одиночного и множественного выбора.
 *
 * @param {Array<Object>} options - Список опций: [{ value: 'id', label: 'Название' }]
 * @param {Object | Array<Object>} value - Текущая выбранная опция(ии).
 * @param {function} onChange - Коллбэк при выборе опции (принимает Object или Array<Object>).
 * @param {string} [placeholder="Выберите опцию..."] - Текст плейсхолдера.
 * @param {boolean} [isSearchable=false] - Включает строку поиска для фильтрации.
 * @param {boolean} [isCreatable=false] - Включает возможность создания новой опции.
 * @param {boolean} [isMulti=false] - Разрешает выбор нескольких опций.
 * @param {boolean} [showSelectAll=false] - Разрешает выбор всех опций.
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Выберите опцию...",
  isSearchable = false,
  isCreatable = false,
  isMulti = false, // <-- Новый пропс
  dataTourId,
  dataTourHeader = "modal.timezone.header",
  forceOpen,
  onCreate,
  showSelectAll = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const selectRef = useRef(null);

  // синк внешнего открытия
  useEffect(() => {
    if (typeof forceOpen === "boolean") {
      setIsOpen((prev) => forceOpen || prev);
    }
  }, [forceOpen]);

  // Проверка, является ли текущее значение массивом (для isMulti)
  const isValueArray = Array.isArray(value);

  // --- Логика фильтрации ---
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Опция для создания (если включена)
  const canCreate =
    isCreatable &&
    searchTerm &&
    !options.some(
      (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase()
    );

  // --- Обработчики ---

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCount = isMulti && isValueArray ? value.length : 0;
  const allSelected =
    isMulti &&
    showSelectAll &&
    options?.length > 0 &&
    selectedCount === options.length;

  const handleSelect = (option) => {
    if (isMulti) {
      const isSelected =
        isValueArray && value.some((v) => v.value === option.value);
      let newValue = isSelected
        ? value.filter((v) => v.value !== option.value) // Удалить
        : [...(isValueArray ? value : []), option]; // Добавить

      onChange(newValue);
      if (!isSearchable) {
        setIsOpen(false);
      }
      window.dispatchEvent(
        new CustomEvent("tour:select:chosen", {
          detail: { option, multi: true },
        })
      );
    } else {
      // Логика для сингл-селекта
      onChange(option);
      setIsOpen(false);
      setSearchTerm("");
      window.dispatchEvent(
        new CustomEvent("tour:select:chosen", {
          detail: { option, multi: false },
        })
      );
    }
  };

  const handleSelectAll = () => {
    if (!isMulti) return;
    onChange(options); // выбрать все опции
  };

  const handleClearAll = () => {
    if (!isMulti) return;
    onChange([]); // очистить
  };

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;

    setIsCreating(true);

    try {
      // Ждём, пока dispatch вернёт результат (res.data)
      const created = await onCreate({ value: searchTerm, label: searchTerm });

      // Проверяем, что сервер действительно вернул позицию
      const createdPosition = created?.position;
      if (!createdPosition || !createdPosition.id) {
        throw new Error("Некорректный ответ при создании должности");
      }

      // Готовим новую опцию для селекта
      const newOption = {
        value: createdPosition.id,
        label: createdPosition.title,
      };

      // Добавляем её в выбранные значения
      onChange(
        isMulti ? [...(isValueArray ? value : []), newOption] : newOption
      );

      // Очищаем и закрываем
      setIsOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Ошибка при создании должности:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleHeaderClick = (e) => {
    // Предотвращаем закрытие, если клик был на теге
    if (e.target.closest(`.${styles.multiValueTag}`)) return;
    setIsOpen(!isOpen);
  };

  // --- Рендеринг ---

  // Анимационные варианты для выпадающего списка
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: { duration: 0.2 },
    },
  };

  const hasValues = isMulti && isValueArray && value.length > 0;

  return (
    <div
      className={styles.selectContainer}
      ref={selectRef}
      data-tour={dataTourId /* например "modal.timezone" */}
    >
      {/* Шапка селекта (кнопка) */}
      <div
        className={`${styles.selectHeader} ${hasValues ? styles.selected : ""}`}
        data-tour={dataTourHeader}
        onClick={handleHeaderClick}
      >
        {/* Отображение выбранного значения / тегов */}
        {isMulti && isValueArray && value.length > 0 ? (
          <div className={styles.multiValueWrapper}>
            {value.map((opt) => (
              <span
                key={opt.value}
                className={styles.multiValueTag}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt);
                }}
              >
                {/* ⬇️ новый span для обрезки текста тега */}
                <span className={styles.tagText}>{opt.label}</span>
                <span className={styles.removeTag}>&times;</span>
              </span>
            ))}
          </div>
        ) : (
          <span
            className={
              (value && !isMulti) ||
              (isMulti && isValueArray && value.length > 0)
                ? styles.selectedLabel
                : styles.placeholder
            }
          >
            <span className={styles.labelText}>
              {isMulti && isValueArray && value.length === 0
                ? placeholder
                : value && !isMulti
                ? value.label
                : placeholder}
            </span>
          </span>
        )}

        <ChevronDown
          size={20}
          className={`${styles.icon} ${isOpen ? styles.open : ""}`}
        />
      </div>

      {/* Выпадающий список (с анимацией) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-tour={dataTourId ? `${dataTourId}.menu` : undefined}
            className={styles.dropdown}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Поисковая строка */}
            {isSearchable && (
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={
                    isCreatable ? "Поиск или создание..." : "Поиск..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.searchInput}
                  // autoFocus // Удобство: фокус при открытии
                />
              </div>
            )}

            {/* Опция создания */}
            {canCreate && (
              <div
                className={`${styles.option} ${styles.createOption}`}
                onClick={handleCreate}
              >
                <div className={styles.createLabel}>
                  {isCreating ? (
                    <RingLoader size={16} color="#16a34a" />
                  ) : (
                    <Plus size={16} />
                  )}
                  <p>{isCreating ? "Создание..." : "Создать:"}</p>
                </div>
                <strong>{`"${searchTerm}"`}</strong>
              </div>
            )}

            {isMulti && showSelectAll && options?.length > 0 && (
              <div className={styles.selectAllRow}>
                <button
                  type="button"
                  className={styles.selectAllBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  title="Выбрать все"
                >
                  Выбрать все
                  <span className={styles.counter}>
                    {selectedCount}/{options.length}
                  </span>
                </button>

                {allSelected && (
                  <button
                    type="button"
                    className={styles.clearAllIconBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    title="Очистить выбор"
                    aria-label="Очистить выбор"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Список опций */}
            <div className={styles.optionsList}>
              {filteredOptions.length > 0
                ? filteredOptions.map((option) => {
                    // Логика активного/выбранного состояния
                    const isActive = isMulti
                      ? isValueArray &&
                        value.some((v) => v.value === option.value)
                      : value && value.value === option.value;

                    return (
                      <div
                        key={option.id || option.value}
                        className={`${styles.option} ${
                          isActive ? styles.active : ""
                        }`}
                        onClick={() => handleSelect(option)}
                      >
                        {option.label}
                        {isActive && isMulti && (
                          <Check size={16} className={styles.checkMark} />
                        )}
                      </div>
                    );
                  })
                : !canCreate && (
                    <div className={styles.noResults}>Нет результатов.</div>
                  )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
