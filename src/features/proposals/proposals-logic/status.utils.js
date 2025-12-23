// Chuẩn hoá mọi chuỗi trạng thái -> key thống nhất: approved | waiting | reject
export function getStatusKey(raw) {
  const s = (raw || "").toString().trim().toLowerCase().normalize("NFC");

  // reject
  if (s.includes("từ chối") || s.includes("reject")) return "reject";

  // waiting (chờ / chưa duyệt / đang / pending)
  if (
    s.includes("chờ") ||
    s.includes("chưa duyệt") ||
    s.includes("đang") ||
    s.includes("pending") ||
    s.includes("được duyệt")
  ) {
    return "waiting";
  }

  // approved (đã duyệt / đã phê duyệt / approved / completed - team đã chấm điểm xong)
  if (
    s.includes("duyệt") ||
    s.includes("phê duyệt") ||
    s.includes("approved") ||
    s.includes("completed") ||
    s.includes("hoàn thành")
  ) {
    return "approved";
  }

  return "waiting";
}

// Label hiển thị THỐNG NHẤT cho cả 2 trang
export function getStatusLabel(key) {
  switch (key) {
    case "approved":
      return "Đã Duyệt";
    case "waiting":
      return "Chờ Được Duyệt";
    case "reject":
      return "Bị Từ Chối";
    default:
      return "Chờ Được Duyệt";
  }
}
