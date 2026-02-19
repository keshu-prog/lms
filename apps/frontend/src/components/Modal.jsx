export default function Modal({ title, children, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3>{title}</h3>
          <button onClick={onClose}>✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  width: "400px",
  borderRadius: "8px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px",
};
