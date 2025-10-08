export const searchProposals = (proposals, searchTerm) => {
  if (!searchTerm) {
    return proposals;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase();

  return proposals.filter((p) => {
    // Tìm kiếm theo mã nhóm (id)
    const matchesId = p.id.toLowerCase().includes(normalizedSearchTerm);

    // Tìm kiếm theo tên đề tài (title)
    const matchesTitle = p.title.toLowerCase().includes(normalizedSearchTerm);

    // Tìm kiếm theo tên giảng viên hướng dẫn (mentor)
    const matchesMentor = p.mentor.toLowerCase().includes(normalizedSearchTerm);

    return matchesId || matchesTitle || matchesMentor;
  });
};
