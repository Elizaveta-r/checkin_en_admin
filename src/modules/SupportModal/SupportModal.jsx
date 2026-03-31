import { useState } from "react";
import styles from "./SupportModal.module.scss";

import { TriangleAlert, X } from "lucide-react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { PhoneInput } from "../../ui/PhoneInput/PhoneInput";
import { Button } from "../../ui/Button/Button";
import { sendMessageSupport } from "../../utils/api/actions/support";
import { useDispatch } from "react-redux";

export const SupportModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    name: "",
    phone: "",
    email: "",
    telegram: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.topic.trim()) errs.topic = "Укажите тему обращения";
    if (!formData.message.trim()) errs.message = "Введите сообщение";

    const hasContact =
      formData.phone.trim() ||
      formData.email.trim() ||
      formData.telegram.trim();

    if (!hasContact)
      errs.contact =
        "Укажите хотя бы один способ связи: почта, телефон или Telegram";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Формируем сообщение с контактами
    const contactInfo = `
        Контактные данные:
        ${formData.name ? `Имя: ${formData.name}\n` : ""}
        ${formData.phone ? `Телефон: ${formData.phone}\n` : ""}
        ${formData.email ? `Почта: ${formData.email}\n` : ""}
        ${formData.telegram ? `Telegram: ${formData.telegram}\n` : ""}
        ---------------------------
        ${formData.message}
        `.trim();

    const payload = {
      topic: formData.topic,
      message: contactInfo,
    };

    setLoading(true);
    try {
      await dispatch(sendMessageSupport(payload, onClose, setLoading));
    } catch (error) {
      console.error("Ошибка при отправке в поддержку:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className={styles.title}>Связаться с поддержкой</h2>

        <form className={styles.form}>
          <div className={styles.inputs}>
            <CustomInput
              placeholder="Как к вам обращаться"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <CustomInput
              placeholder="Тема обращения *"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              error={errors.topic}
            />
          </div>

          <CustomTextArea
            placeholder="Сообщение *"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            error={errors.message}
          />

          <div className={styles.contacts}>
            <div className={styles.contactsHeader}>
              <TriangleAlert />
              <p className={styles.contactsTitle}>
                Укажите хотя бы один способ связи: почта, телефон или Telegram
              </p>
            </div>

            <div className={styles.contactsGrid}>
              <PhoneInput
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <div>
                <label htmlFor="">Почта</label>
                <CustomInput
                  placeholder="Почта"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="">Телеграм</label>
                <CustomInput
                  placeholder="Telegram"
                  value={formData.telegram}
                  onChange={(e) => handleChange("telegram", e.target.value)}
                />
              </div>
            </div>
          </div>

          {errors.contact && (
            <span className={styles.error}>{errors.contact}</span>
          )}

          <Button
            type="submit"
            loading={loading}
            title="Отправить обращение"
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};
