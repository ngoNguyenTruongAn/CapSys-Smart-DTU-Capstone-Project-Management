import styles from "./ProposalDetails.module.scss";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";

// Cập nhật props: nhận selectedProposalId và setSelectedProposalId
function CardDetails({ proposal, selectedProposalId, setSelectedProposalId }) {
  const { id, title, mentor, registerDate, approveDate, status } = proposal;

  const key = getStatusKey(status);
  const statusLabel = getStatusLabel(key);
  const badgeClass = styles["status-" + key];

  // Logic: Kiểm tra nếu ID hiện tại khớp với ID đang được chọn thì set active
  const isActive = id === selectedProposalId;

  const handleClick = () => {
    // 1. Cập nhật ID được chọn khi click
    setSelectedProposalId(id);

    // 2. THÊM LOGIC CUỘN VỀ ĐẦU TRANG
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0, // Cuộn về vị trí 0 (đầu trang)
        behavior: "smooth", // Tạo hiệu ứng cuộn mượt
      });

      // Hoặc, nếu bạn chỉ muốn cuộn về đầu phần nội dung chính bên phải:
      // Bạn cần đặt một ref (tham chiếu) vào phần nội dung bên phải trong Proposal-detail.jsx
      // và truyền nó xuống, hoặc sử dụng ID của phần tử đó (ít được khuyến khích hơn).

      // Giữ lại cách cuộn toàn bộ window là đơn giản và hiệu quả nhất trong trường hợp này.
    }
  };

  return (
    <div
      className={`${styles["DetailsCard-wrapper"]} ${
        isActive ? styles["Card-active"] : ""
      }`}
      onClick={handleClick} // Thêm onClick handler
    >
      <div className={styles["DetailsCard-header"]}>
        <span className={styles["DetailsCard-id"]}>{id}</span>
        <span className={`${styles["DetailsCard-status"]} ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>

      <h3 className={styles["DetailsCard-title"]}>{title}</h3>
      <p className={styles["DetailsCard-mentor"]}>GVHD: {mentor}</p>
      <p className={styles["DetailsCard-date"]}>Ngày đăng ký: {registerDate}</p>
      <p className={styles["DetailsCard-date"]}>Ngày duyệt: {approveDate}</p>
    </div>
  );
}

export default CardDetails;
