import { useEffect, useState } from "react";
import "./QuestionPanel.css";
import axios from "axios";

interface Props {
  topic: string;
  user: string;
  onAnswer: () => void;
}

export default function QuestionPanel({ topic, user, onAnswer }: Props) {
  useEffect(() => {
    // Load question on mount
    axios
      .get("httpcle://localhost:5000/question", {
        params: { topic: topic, user: user },
      })
      .then((res) => setQuestion(res.data))
      .catch((err) => console.log(err));
  }, [topic, user]);

  const [question, setQuestion] = useState("");

  let answer: string = "";
  function handleSubmit() {
    if (!answer) return;
    // POST answer to backend
    axios
      .post("http://localhost:5000/answer", { answer: answer })
      .then(onAnswer)
      .catch((err) => console.log(err));
  }

  return (
    <div id="question-panel">
      <p>{question}</p>
      <form onSubmit={handleSubmit}>
        <input
          name="answer"
          type="text"
          placeholder="The answer is..."
          onChange={(e) => (answer = e.target.value)}
        />
      </form>
    </div>
  );
}
