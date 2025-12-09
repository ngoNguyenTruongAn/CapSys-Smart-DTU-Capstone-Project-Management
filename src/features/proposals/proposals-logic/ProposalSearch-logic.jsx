export const searchProposals = (proposals, searchTerm) => {
  // Nếu không có từ khóa hoặc danh sách rỗng thì trả về nguyên gốc
  if (!searchTerm || !proposals) {
    return proposals;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return proposals.filter((p) => {
    // 1. Xử lý ID: Dùng String() để tránh lỗi nếu ID là số. Check cả id/proposalId
    const rawId = p.id ?? p.proposalId ?? p.ProposalID ?? "";
    const matchesId = String(rawId).toLowerCase().includes(normalizedSearchTerm);

    // 2. Xử lý Title: Check title/proposalTitle
    const rawTitle = p.title ?? p.proposalTitle ?? "";
    const matchesTitle = String(rawTitle).toLowerCase().includes(normalizedSearchTerm);

    // 3. Xử lý Mentor: Check mentor là string hoặc object lecturer
    let rawMentor = "";
    if (typeof p.mentor === "string") rawMentor = p.mentor;
    else if (p.lecturer?.fullName) rawMentor = p.lecturer.fullName;
    else if (p.mentorName) rawMentor = p.mentorName;
    
    const matchesMentor = String(rawMentor).toLowerCase().includes(normalizedSearchTerm);

    return matchesId || matchesTitle || matchesMentor;
  });
};