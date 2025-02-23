import "./App.css";
import TopicCard from "./components/TopicCard";
import sandwich from "./assets/sandwich.png";
import derivative from "./assets/dydx.png";
import { Outlet } from "react-router-dom";
import { Topic } from "./main";

function App() {
  return (
    <>
      <h1 id="title">What do you want to learn today</h1>
      <div id="topics">
        <TopicCard
          src={sandwich}
          text="Make a sandwich"
          color="purple"
          topic={Topic.sandwich}
        />
        <TopicCard
          src={derivative}
          text="Differentiate Polynomials"
          color="peachpuff"
          topic={Topic.calculus}
        />
      </div>
      <Outlet />
    </>
  );
}

export default App;
