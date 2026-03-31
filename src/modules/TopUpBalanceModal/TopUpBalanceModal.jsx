import React, { useState, useMemo } from "react";
import styles from "./TopUpBalanceModal.module.scss";
import { CreditCard, Zap, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";
import { useDispatch, useSelector } from "react-redux";
import { topUpBalance } from "../../utils/api/actions/billing";
import { toast } from "sonner";
import { RingLoader } from "react-spinners";

// Минимальная сумма пополнения для валидации
const MIN_TOP_UP_AMOUNT = 150;

// Быстрые суммы
const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

/**
 * @param {{isOpen: boolean, onClose: () => void, onSubmit: (amount: number) => Promise<void>}} props
 */
export default function TopUpBalanceModal({ isOpen, onClose, onSubmit }) {
  const dispatch = useDispatch();

  const { wallet } = useSelector((state) => state?.billing);

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const amountNumber = parseFloat(amount);
  const currentBalance = wallet?.balance || 0;

  const isAmountValid = amountNumber >= MIN_TOP_UP_AMOUNT;

  const errorMessage = useMemo(() => {
    if (amount === "") return null;
    if (amountNumber > 0 && amountNumber < MIN_TOP_UP_AMOUNT) {
      return `Минимальная сумма пополнения: ${MIN_TOP_UP_AMOUNT} ₽`;
    }
    return null;
  }, [amountNumber, amount]);

  const handleSubmit = (e) => {
    const amountFloat = parseFloat(String(amountNumber).replace(/\s/g, ""));
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      toast.warning("Введите сумму пополнения");
      return;
    }
    let data = {
      order_type: "topup_wallet",
      out_sum: amountNumber.toString().replace(/\s/g, ""),
    };

    e.preventDefault();
    if (isAmountValid) {
      dispatch(topUpBalance(data, setIsLoading)).then((res) => {
        if (res.data.status === 200) {
          onSubmit(amountNumber);
          setAmount("");
          onClose();
        }
      });
    }
  };

  const handleQuickSelect = (value) => {
    setAmount(String(value));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Пополнение баланса">
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit}>
              <div className={styles.balanceInfo}>
                <p>Ваш текущий баланс:</p>
                <p className={styles.currentBalance}>
                  {formatWithSpaces(currentBalance.toLocaleString("ru-RU"))} ₽
                </p>
              </div>

              <div className={styles.quickSelect}>
                <p className={styles.label}>Быстрое пополнение:</p>
                <div className={styles.buttonGroup}>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={styles.quickButton}
                      onClick={() => handleQuickSelect(val)}
                    >
                      +{val} ₽
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="amount" className={styles.label}>
                  Введите сумму пополнения (в ₽):
                </label>
                <CustomInput
                  id="amount"
                  type="number"
                  placeholder={MIN_TOP_UP_AMOUNT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${
                    !isAmountValid && amount !== "" ? styles.inputError : ""
                  }`}
                  min={MIN_TOP_UP_AMOUNT}
                  step="1"
                  autoFocus
                />

                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              </div>

              <button
                type="submit"
                className={`${styles.submitButton} ${
                  isLoading ? styles.loading : ""
                }`}
                disabled={!isAmountValid}
              >
                {isLoading ? (
                  <RingLoader size={14} color="white" />
                ) : (
                  <CreditCard size={20} />
                )}
                {isLoading ? "Подождите" : "Оплатить"}{" "}
                {!isLoading &&
                  (amountNumber > 0
                    ? `${amountNumber.toLocaleString("ru-RU")} ₽`
                    : "")}
              </button>

              <p className={styles.paymentNote}>
                <Zap size={14} /> Вы будете перенаправлены на страницу Robokassa
                для выбора способа оплаты (карты, электронные деньги и др.).
              </p>
            </form>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
