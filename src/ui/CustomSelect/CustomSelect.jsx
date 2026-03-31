import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomSelect.module.scss";
import { ChevronDown, Search, Plus, Check, Trash2 } from "lucide-react";
// eslint-disable-next-line no-unused-vars
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
  placeholder = "Select an option...",
  isSearchable = false,
  isCreatable = false,
  isMulti = false,
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

  useEffect(() => {
    if (typeof forceOpen === "boolean") {
      setIsOpen((prev) => forceOpen || prev);
    }
  }, [forceOpen]);

  const isValueArray = Array.isArray(value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const canCreate =
    isCreatable &&
    searchTerm &&
    !options.some(
      (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase(),
    );

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
        ? value.filter((v) => v.value !== option.value)
        : [...(isValueArray ? value : []), option];

      onChange(newValue);
      if (!isSearchable) {
        setIsOpen(false);
      }
      window.dispatchEvent(
        new CustomEvent("tour:select:chosen", {
          detail: { option, multi: true },
        }),
      );
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm("");
      window.dispatchEvent(
        new CustomEvent("tour:select:chosen", {
          detail: { option, multi: false },
        }),
      );
    }
  };

  const handleSelectAll = () => {
    if (!isMulti) return;
    onChange(options);
  };

  const handleClearAll = () => {
    if (!isMulti) return;
    onChange([]);
  };

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;

    setIsCreating(true);

    try {
      const created = await onCreate({ value: searchTerm, label: searchTerm });

      const createdPosition = created?.position;
      if (!createdPosition || !createdPosition.id) {
        throw new Error("Invalid response while creating the position");
      }

      const newOption = {
        value: createdPosition.id,
        label: createdPosition.title,
      };

      onChange(
        isMulti ? [...(isValueArray ? value : []), newOption] : newOption,
      );

      setIsOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error while creating the position:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleHeaderClick = (e) => {
    if (e.target.closest(`.${styles.multiValueTag}`)) return;
    setIsOpen(!isOpen);
  };

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
      data-tour={dataTourId}
    >
      <div
        className={`${styles.selectHeader} ${hasValues ? styles.selected : ""}`}
        data-tour={dataTourHeader}
        onClick={handleHeaderClick}
      >
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
            {isSearchable && (
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={
                    isCreatable ? "Search or create..." : "Search..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.searchInput}
                />
              </div>
            )}

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
                  <p>{isCreating ? "Creating..." : "Create:"}</p>
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
                  title="Select all"
                >
                  Select all
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
                    title="Clear selection"
                    aria-label="Clear selection"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}

            <div className={styles.optionsList}>
              {filteredOptions.length > 0
                ? filteredOptions.map((option) => {
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
                    <div className={styles.noResults}>No results.</div>
                  )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
