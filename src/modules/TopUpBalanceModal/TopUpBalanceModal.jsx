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

const MIN_TOP_UP_AMOUNT = 150;
const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

const CURRENCY_SYMBOL = "₽";
const CURRENCY_POSITION = "after"; // "before" | "after"

const formatPrice = (value) => {
  const formatted =
    typeof value === "number"
      ? formatWithSpaces(value.toLocaleString("en-US"))
      : formatWithSpaces(value);

  return CURRENCY_POSITION === "before"
    ? `${CURRENCY_SYMBOL}${formatted}`
    : `${formatted} ${CURRENCY_SYMBOL}`;
};

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
      return `Minimum top-up amount: ${formatPrice(MIN_TOP_UP_AMOUNT)}`;
    }
    return null;
  }, [amountNumber, amount]);

  const handleSubmit = (e) => {
    const amountFloat = parseFloat(String(amountNumber).replace(/\s/g, ""));
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      toast.warning("Enter a top-up amount");
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
        <Modal isOpen={isOpen} onClose={onClose} title="Top Up Balance">
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit}>
              <div className={styles.balanceInfo}>
                <p>Your current balance:</p>
                <p className={styles.currentBalance}>
                  {formatPrice(currentBalance)}
                </p>
              </div>

              <div className={styles.quickSelect}>
                <p className={styles.label}>Quick top-up:</p>
                <div className={styles.buttonGroup}>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={styles.quickButton}
                      onClick={() => handleQuickSelect(val)}
                    >
                      +{formatPrice(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="amount" className={styles.label}>
                  Enter top-up amount:
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
                {isLoading ? "Please wait" : "Pay"}{" "}
                {!isLoading &&
                  (amountNumber > 0 ? `${formatPrice(amountNumber)}` : "")}
              </button>

              <p className={styles.paymentNote}>
                <Zap size={14} /> You will be redirected to Robokassa to choose
                a payment method, such as card or e-wallet.
              </p>
            </form>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
