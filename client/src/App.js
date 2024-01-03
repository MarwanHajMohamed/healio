import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./Components/Main";
import Register from "./Components/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
