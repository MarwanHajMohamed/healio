import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./Components/Main";
import Register from "./Components/Register";
import Login from "./Components/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
