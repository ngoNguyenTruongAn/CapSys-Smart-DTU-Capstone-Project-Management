import styles from "./ProposalDetails.module.scss";
import CardDetails from "./CardDetails";
// XÓA: Không import data cứng nữa, nhận qua props
// import proposals from "../proposals-data";

// Cập nhật props để nhận proposals, selectedProposalId, setSelectedProposalId
function CardDetailsList({
  proposals,
  selectedProposalId,
  setSelectedProposalId,
}) {
  if (!proposals || proposals.length === 0) {
    return <p>Không có đề tài nào</p>;
  }

  return (
    <div className={styles["DetailsList-wrapper"]}>
      {proposals.map((p) => (
        <CardDetails
          key={p.id}
          proposal={p}
          selectedProposalId={selectedProposalId} // Truyền state
          setSelectedProposalId={setSelectedProposalId} // Truyền setter
        />
      ))}
    </div>
  );
}

export default CardDetailsList;
