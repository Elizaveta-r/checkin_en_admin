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
    if (!formData.topic.trim()) errs.topic = "Please enter a subject";
    if (!formData.message.trim()) errs.message = "Please enter a message";

    const hasContact =
      formData.phone.trim() ||
      formData.email.trim() ||
      formData.telegram.trim();

    if (!hasContact)
      errs.contact =
        "Please provide at least one contact method: email, phone, or Telegram";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const contactInfo = `
        Contact details:
        ${formData.name ? `Name: ${formData.name}\n` : ""}
        ${formData.phone ? `Phone: ${formData.phone}\n` : ""}
        ${formData.email ? `Email: ${formData.email}\n` : ""}
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
      console.error("Error while sending a support request:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className={styles.title}>Contact Support</h2>

        <form className={styles.form}>
          <div className={styles.inputs}>
            <CustomInput
              placeholder="How should we address you?"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <CustomInput
              placeholder="Subject *"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              error={errors.topic}
            />
          </div>

          <CustomTextArea
            placeholder="Message *"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            error={errors.message}
          />

          <div className={styles.contacts}>
            <div className={styles.contactsHeader}>
              <TriangleAlert />
              <p className={styles.contactsTitle}>
                Please provide at least one contact method: email, phone, or
                Telegram
              </p>
            </div>

            <div className={styles.contactsGrid}>
              <PhoneInput
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <div>
                <label htmlFor="">Email</label>
                <CustomInput
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="">Telegram</label>
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
            title="Send request"
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};
