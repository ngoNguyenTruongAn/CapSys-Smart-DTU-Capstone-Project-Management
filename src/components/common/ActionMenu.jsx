// // ActionMenu.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   FiMoreVertical,
//   FiEye,
//   FiTrash2,
//   FiRepeat,
//   FiShuffle,
//   FiEdit2,
// } from "react-icons/fi";
// import "./ActionMenu.scss";

// const ActionMenu = ({ detail, edit, move, swap, remove }) => {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="action-menu" ref={menuRef}>
//       <button className="action-btn" onClick={() => setOpen((v) => !v)}>
//         <FiMoreVertical size={20} />
//       </button>

//       {open && (
//         <div className="dropdown">
//           {detail && (
//             <div className="item" onClick={detail}>
//               <FiEye size={16} style={{ marginRight: "8px" }} />
//               Xem
//             </div>
//           )}
//           {edit && (
//             <div className="item" onClick={edit}>
//               <FiEdit2 size={16} style={{ marginRight: "8px" }} />
//               Sửa
//             </div>
//           )}
//           {move && (
//             <div className="item" onClick={move}>
//               <FiRepeat size={16} style={{ marginRight: "8px" }} />
//               Chuyển SV
//             </div>
//           )}
//           {swap && (
//             <div className="item" onClick={swap}>
//               <FiShuffle size={16} style={{ marginRight: "8px" }} />
//               Đổi SV
//             </div>
//           )}
//           {remove && (
//             <div className="item delete" onClick={remove}>
//               <FiTrash2 size={16} style={{ marginRight: "8px" }} />
//               Xóa
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActionMenu;
