import { Outlet /* useLocation */ } from "react-router-dom";
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
import loadingIcon from "./assets/loading-icon.png";

interface Props {
  topic: Topic;
}

function ChatHistory({
  history,
  className,
}: {
  history: string[];
  className: string;
}) {
  return (
    <div id="chat-history">
      {history.map((msg, idx) => {
        return (
          <>
            <div key={idx} className={className}>
              {msg}
            </div>
            <hr />
          </>
        );
      })}
    </div>
  );
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [userHistory, setUserHistory] = useState<string[]>([]);
  const [assisstantHistory, setAssistantHistory] = useState<string[]>([]);
  const [beingQuestioned, setBeingQuestioned] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isDisabled = !username || beingQuestioned;

  const waitingTime = 0;
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!username) return;
    interface Data {
      user: string[];
      ai: string[];
    }

    const timerID = setTimeout(() => setIsSpinning(true), waitingTime);

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
        clearTimeout(timerID);
        setIsSpinning(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [username, isSpinning]);

  function onEnterDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function updatePrompt(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    e.preventDefault();
    setInput(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input) return;

    axios
      .post("http://localhost:5000/chat", {
        user: username,
        prompt: input,
      })
      .then((res) => {
        const assistant: string = res.data;
        console.log("Assistant:", assistant);

        // Append backend response to history
        setUserHistory([...userHistory, input]);
        setAssistantHistory([...assisstantHistory, assistant]);
      })
      .catch((err) => {
        console.log(err.config);
        console.error(err);
      });
  }

  return (
    <>
      <div className="chat-page-container">
        {username ? (
          <h2>Topic is: {topic}</h2>
        ) : (
          <NamePrompt setUsername={setUsername} />
        )}

        <ChatHistory history={assisstantHistory} className="ai-chat" />
        <img
          src={loadingIcon}
          style={{ maxWidth: "100px", maxHeight: "100px" }}
          className={isSpinning ? "spinning" : ""}
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
            onChange={updatePrompt}
            disabled={isDisabled}
          />
          <button type="submit" disabled={isDisabled}>
            <FontAwesomeIcon icon={faArrowAltCircleRight} />
          </button>
        </form>
      </div>
      <Outlet />
    </>
  );
}
