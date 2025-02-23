import "./App.css";
import TopicCard from "./components/TopicCard";
import sandwich from "./assets/sandwich.png";
import derivative from "./assets/dydx.png";
import { Outlet } from "react-router-dom";
import { Topic } from "./main";
// import { useState } from "react";

function App() {
  // const [model, setModel] = useState<string>("");

  return (
    <>
      <h1 id="title">What do you want to learn today?</h1>
      <div id="topics">
        <TopicCard
          src={sandwich}
          text="Make a sandwich"
          color="purple"
          topic={Topic.sandwich}
          // model={model}
        />
        <TopicCard
          src={derivative}
          text="Differentiate Polynomials"
          color="peachpuff"
          topic={Topic.calculus}
          // model={model}
        />
      </div>
      <Outlet />
    </>
  );
}

export default App;
