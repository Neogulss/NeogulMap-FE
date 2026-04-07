import { Outlet } from "react-router-dom";
import MainNav from "../main/MainNav";
import Footer from "../layouts/Footer";
import "../../styles/main.css";

export default function Layout() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <MainNav />
      <main style={{ flex: 1, paddingTop: "64px" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
