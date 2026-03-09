import { useState } from "react";
import Layout from "./components/layout/Layout";
import Gestion from "./pages/Gestion";
import Reporteria from "./pages/Reporteria";
import Operaciones from "./pages/Operaciones";
import Imagenes from "./pages/Imagenes";

export default function App() {
  const [page, setPage] = useState("gestion");

  const pages = {
    gestion: <Gestion onNavigate={setPage}/>,
    reporteria: <Reporteria />,
    operaciones: <Operaciones />,
    imagenes: <Imagenes />,
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {pages[page]}
    </Layout>
  );
}