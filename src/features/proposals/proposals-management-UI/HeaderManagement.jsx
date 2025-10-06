import Header from "../layout-proposal-common/Header";
import AddButton from "../layout-proposal-common/Button/Addbutton";
import AddProposalModal from "../layout-proposal-common/Modal/AddProposalModal";
import { useProposalsStore } from "../proposals-logic/useProposalsStore";

function HeaderManagement() {
  // Dùng đúng state & action trong store hiện tại
  const { isModalOpen, openModal, closeModal, addProposal } = useProposalsStore();

  return (
    <div>
      <Header
        heading="Quản lý đồ án"
        subheading="Danh sách tất cả các đồ án Capstone"
        // Khi bấm nút + sẽ mở modal
        rightContent={<AddButton onClick={openModal} />}
      />

      <AddProposalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={(payload) => addProposal(payload)}
      />
    </div>
  );
}

export default HeaderManagement;
