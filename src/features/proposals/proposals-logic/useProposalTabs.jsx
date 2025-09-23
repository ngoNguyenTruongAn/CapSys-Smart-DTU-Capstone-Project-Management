

export const filterProposals = (proposals, status) => {
  if (status === "Tất cả") {
    return proposals;
  }
  return proposals.filter((p) => p.status === status);
};