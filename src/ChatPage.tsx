import { Outlet } from "react-router-dom";
import { Topic } from "./main";
import { useEffect, useRef, useState } from "react";
import NamePrompt from "./components/NamePrompt";
import "./ChatPage.css";
import axios from "axios";
import {
  faQuestion,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QuestionPanel from "./components/QuestionPanel";

interface Props {
  topic: Topic;
}

// Update ChatHistory component to show both user and AI messages
function ChatHistory({
  userHistory,
  aiHistory,
}: {
  userHistory: string[];
  aiHistory: string[];
}) {
  return (
    <div id="chat-history">
      {[...userHistory].map((msg, idx) => (
        <div key={`chat-${idx}`}>
          {/* Show user message first */}
          <div className="message user-chat">
            {msg}
          </div>
          {/* Then show AI response */}
          {aiHistory[idx] && (
            <div className="message ai-chat">
              {aiHistory[idx]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("");  // Remove test username
  const [input, setInput] = useState("");
  const [userHistory, setUserHistory] = useState<string[]>([]);
  const [assistantHistory, setAssistantHistory] = useState<string[]>([]); // Remove test data
  const [beingQuestioned, setBeingQuestioned] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isDisabled = !username || beingQuestioned || loading;

  useEffect(() => {
    if (!username) return;
    interface Data {
      user: string[];
      ai: string[];
    }

    // Load up previous history, on mount
    axios
      .get("http://localhost:5000/history", {
        params: { username: username },
        headers: {
          "Content-Type": "application/json",
          // Add any other headers you need here
        },
      })
      .then((res) => {
        const { user, ai }: Data = res.data;
        setUserHistory(user);
        setAssistantHistory(ai);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [username]);

  function onEnterDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
  
    axios.post("http://localhost:5000/chat", {
      user: username,
      prompt: input,
      topic: topic  // Add topic to the request
    })
    .then((res) => {
      const assistant: string = res.data;
      setUserHistory([...userHistory, input]);
      setAssistantHistory([...assistantHistory, assistant]);
      setInput("");
    })
    .catch((err) => {
      console.error("Chat error:", err);
      alert("Failed to send message. Please try again.");
    })
    .finally(() => {
      setLoading(false);
    });
  }

  return (
    <>
      <div className="chat-page-container">
        {username ? (
          <h1>Topic is: {topic}</h1>
        ) : (
          <NamePrompt setUsername={setUsername} />
        )}

        <ChatHistory 
          userHistory={userHistory} 
          aiHistory={assistantHistory} 
        />

        <button
          id="question"
          disabled={isDisabled}
          onClick={() => {
            setBeingQuestioned(true);
          }}
        >
          <FontAwesomeIcon icon={faQuestion} />
        </button>
        {beingQuestioned && (
          <QuestionPanel
            topic={topic}
            user={username}
            onAnswer={() => setBeingQuestioned(false)}
          />
        )}
        <form ref={formRef} id="user-input" onSubmit={handleSubmit}>
          <textarea
            name="reply"
            placeholder="Reply to RoboDamien"
            onKeyDown={onEnterDown}
            onChange={(e) => setInput(e.target.value)}
            disabled={isDisabled}
          />
          <button type="submit" disabled={isDisabled}>
          {loading ? (
              "..." // You could add a loading spinner here
            ) : (
            <FontAwesomeIcon icon={faArrowAltCircleRight} />
          )}
          </button>
        </form>
      </div>
      {topic}
      <Outlet />
    </>
  );
}
