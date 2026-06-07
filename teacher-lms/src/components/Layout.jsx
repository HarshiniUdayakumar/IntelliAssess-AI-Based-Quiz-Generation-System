import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f4f6fb",
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  }
};