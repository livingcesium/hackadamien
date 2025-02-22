import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  const get = () => {
    axios.get("http://localhost:5000/getnumber").then((res) => {
      console.log(res);
      const data: Record<string, string> = res.data;
      console.log(data);
      setMessage(res.data.number);
    });
  };

  return (
    <>
      <h1 id="title">What do you want to learn today</h1>
      <div id="topics"></div>
    </>
  );
}

export default App;
