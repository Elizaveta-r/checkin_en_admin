import styles from "./History.module.scss";
import {
  convertGoDateToISO,
  formatDateLocal,
} from "../../../../utils/methods/dateFormatter";
import { formatMoneyDynamic } from "../../../../utils/methods/amountFormatter";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHistory } from "../../../../utils/api/actions/billing";
import { RingLoader } from "react-spinners";

export const History = () => {
  const dispatch = useDispatch();

  const { history, historyMeta, loadingHistory } = useSelector(
    (state) => state?.billing,
  );

  const loadMore = () => {
    if (historyMeta.loading || !historyMeta.hasMore) return;

    const next = (historyMeta.page || 1) + 1;
    dispatch(
      getHistory({ page: next, pageSize: historyMeta.pageSize, append: true }),
    );
  };

  useEffect(() => {
    dispatch(getHistory({ page: 1, pageSize: 4, append: false }));
  }, [dispatch]);

  return (
    <div className={styles.history}>
      <div className={styles.scrollWrapper}>
        {history?.length > 0 ? (
          <>
            {[...history]
              ?.sort((a, b) => {
                const dateA = new Date(convertGoDateToISO(a.created_at));
                const dateB = new Date(convertGoDateToISO(b.created_at));
                return dateB - dateA;
              })
              ?.map((item, index) => {
                return (
                  <div key={`history-item-${index}`} className={styles.item}>
                    <div>{formatDateLocal(item.created_at)}</div>
                    <div>{item.description}</div>
                    <div>
                      {item.operation_type === "outcome" ? "-" : "+"}
                      {formatMoneyDynamic(item.amount)}
                    </div>
                  </div>
                );
              })}
            {historyMeta.hasMore && (
              <div className={styles.loadMore} onClick={loadMore}>
                {loadingHistory && <RingLoader size={14} color="white" />}
                {loadingHistory ? "Please wait" : "Load more"}
              </div>
            )}
          </>
        ) : (
          <div>No history</div>
        )}
      </div>
    </div>
  );
};
