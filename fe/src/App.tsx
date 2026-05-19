import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CreateBook from "@/pages/CreateBook";
import BookPlan from "@/pages/BookPlan";
import TableOfContents from "@/pages/TableOfContents";
import WritingWorkspace from "@/pages/WritingWorkspace";
import TextAnalysis from "@/pages/TextAnalysis";
import AnalysisResult from "@/pages/AnalysisResult";
import MyModels from "@/pages/MyModels";
import BookLibrary from "@/pages/BookLibrary";
import BookDetail from "@/pages/BookDetail";
import AuthorLibrary from "@/pages/AuthorLibrary";
import AuthorDetail from "@/pages/AuthorDetail";
import Projects from "@/pages/Projects";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppLayout
          topbar={{
            saveStatus: "saved",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateBook />} />
            <Route path="/plan" element={<BookPlan />} />
            <Route path="/outline" element={<TableOfContents />} />
            <Route path="/workspace" element={<WritingWorkspace />} />
            <Route path="/analyze" element={<TextAnalysis />} />
            <Route path="/analysis-result" element={<AnalysisResult />} />
            <Route path="/models" element={<MyModels />} />
            <Route path="/library" element={<BookLibrary />} />
            <Route path="/library/:id" element={<BookDetail />} />
            <Route path="/authors" element={<AuthorLibrary />} />
            <Route path="/authors/:id" element={<AuthorDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  );
}
