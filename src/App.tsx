import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Material from "@/pages/Material";
import StyleDesign from "@/pages/StyleDesign";
import Proofread from "@/pages/Proofread";
import ColorScheme from "@/pages/ColorScheme";
import Review from "@/pages/Review";
import Export from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/material" element={<Material />} />
          <Route path="/style" element={<StyleDesign />} />
          <Route path="/proofread" element={<Proofread />} />
          <Route path="/color" element={<ColorScheme />} />
          <Route path="/review" element={<Review />} />
          <Route path="/export" element={<Export />} />
        </Route>
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
