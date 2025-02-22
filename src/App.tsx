import "./App.css";
import TopicCard from "./components/TopicCard";
import sandwich from "./assets/sandwich.png";
import derivative from "./assets/dydx.png";

function App() {
  return (
    <>
      <h1 id="title">What do you want to learn today</h1>
      <div id="topics">
        <TopicCard
          src={sandwich}
          name="Differentiate Polynomials"
          color="purple"
        />
        <TopicCard src={derivative} name="Make a sandwich" color="peachpuff" />
      </div>
    </>
  );
}

export default App;
