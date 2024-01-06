import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./Components/Main";
import Register from "./Components/Register";
import Login from "./Components/Login";
import VerifyEmail from "./Components/VerifyEmail";
import PageIntro from "./Components/PageIntro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageIntro />} />
        <Route path="/main" element={<Main />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify_email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
