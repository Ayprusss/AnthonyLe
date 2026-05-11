import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Desktop from "./Windows98/Desktop/Desktop";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Desktop />} />
        <Route path="/site" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
