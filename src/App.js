import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./Pages/Home/Home.js";


function App() {
  return (
    <body>
      <head>
        <link href="os-gui/layout.css" rel="stylesheet" type="text/css" />
        <link href="os-gui/windows-98.css" rel="stylesheet" type="text/css" />
        <link href="os-gui/windows-default.css" rel="stylesheet" type="text/css" />
      </head>
      <script src="os-gui/MenuBar.js"></script>   
      <script src="lib/jquery.js"></script>
      <script src="os-gui/$Window.js"></script>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
    </body>
    
  );
}

export default App;