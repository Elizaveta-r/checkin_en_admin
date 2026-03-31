// CodeInput.jsx
import React, { useRef, useEffect } from 'react';
import styles from './CodeInput.module.scss';

const CodeInput = ({ length = 6, value = '', onComplete, onChange, loading = false }) => {
  const values = value.split('').concat(new Array(length).fill('')).slice(0, length);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Автофокус на первом инпуте при монтировании
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, inputValue) => {
    if (loading) return; // Блокируем ввод во время загрузки
    
    // Обработка вставки кода
    if (inputValue.length > 1) {
      const pastedCode = inputValue.slice(0, length);
      const newValues = [...values];
      
      for (let i = 0; i < pastedCode.length && i + index < length; i++) {
        newValues[i + index] = pastedCode[i];
      }
      
      // Фокус на следующий инпут после вставки или на последний заполненный
      const nextIndex = Math.min(index + pastedCode.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      
      // Вызов колбэков
      const newCode = newValues.join('');
      onChange?.(newCode);
      if (newValues.every(v => v !== '') && newCode.length === length) {
        onComplete?.(newCode);
      }
      
      return;
    }

    // Обычный ввод одного символа
    const newValues = [...values];
    newValues[index] = inputValue;

    // Автоматический переход к следующему инпуту
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Вызов колбэков
    const newCode = newValues.join('');
    onChange?.(newCode);
    if (newValues.every(v => v !== '') && newCode.length === length) {
      onComplete?.(newCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (loading) return; // Блокируем клавиши во время загрузки
    
    // Обработка Backspace
    if (e.key === 'Backspace') {
      const newValues = [...values];
      
      if (values[index]) {
        // Если есть значение в текущем инпуте, удаляем его
        newValues[index] = '';
      } else if (index > 0) {
        // Если текущий инпут пустой, переходим к предыдущему и удаляем его значение
        newValues[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }
      
      onChange?.(newValues.join(''));
    }
    
    // Обработка стрелок
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    // Выделяем весь текст при фокусе для удобства замены
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`${styles.codeInput} ${loading ? styles.loading : ''}`}>
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length} // Разрешаем больше символов для вставки
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={loading}
          className={`${styles.input} ${value ? styles.filled : ''} ${loading ? styles.disabled : ''}`}
          aria-label={`Код, позиция ${index + 1}`}
        />
      ))}
      {loading && (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default CodeInput;