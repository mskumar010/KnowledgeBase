import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { EditorPage } from "@/features/editor/EditorPage";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
      <Toaster position="top-center" theme="light" />
    </BrowserRouter>
  );
}

export default App;
