import { Info, PencilLine, Trash } from "lucide-react";
import styles from "./CardActions.module.scss";
import { RingLoader } from "react-spinners";

export const CardActions = ({
  onDetails,
  onUpdate,
  onDelete,
  loading = false,
}) => {
  return (
    <div className={styles.cardActions}>
      <div className={styles.infoBtn} onClick={onDetails}>
        {loading ? <RingLoader color="white" size={14} /> : <Info size={16} />}
        <p>Подробнее</p>
      </div>
      <div className={styles.edit} onClick={onUpdate}>
        <PencilLine size={16} />
      </div>
      <div className={styles.trash} onClick={onDelete}>
        <Trash size={16} />
      </div>
    </div>
  );
};
