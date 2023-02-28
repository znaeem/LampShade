import { Routes, Route } from "react-router-dom";
import { HomePage, AnnotatePage } from "./routes";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/annotate" element={<AnnotatePage />}></Route>
    </Routes>
  );
}

export default App;
