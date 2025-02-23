import { useEffect, useState } from "react";
import "./QuestionPanel.css";
import axios from "axios";

interface Props {
  topic: string;
  user: string;
  onAnswer: () => void;
}

export default function QuestionPanel({ topic, user, onAnswer }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(""); // Fix: use state instead of let
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fix: Corrected URL and proper POST method
    axios.post("http://localhost:5000/question", {
      topic: topic,
      user: user
    })
    .then((res) => setQuestion(res.data.question))
    .catch((err) => console.error("Question error:", err));
  }, [topic, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Fix: prevent form submission
    if (!answer.trim() || loading) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/answer", {
        user: user,
        topic: topic,
        answer: answer
      });
      onAnswer();
    } catch (err) {
      console.error("Answer error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="question-panel">
      <p>{question}</p>
      <form onSubmit={handleSubmit}>
        <input
          name="answer"
          type="text"
          placeholder="The answer is..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Submit"}
        </button>
      </form>
    </div>
  );
}