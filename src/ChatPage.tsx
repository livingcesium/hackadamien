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

function ChatHistory({
  history,
  className,
}: {
  history: string[];
  className: string;
}) {
  return (
    <div>
      {history.map((msg, idx) => {
        return (
          <>
            <p key={idx} className={className}>
              {msg}
            </p>
            <br />
          </>
        );
      })}
    </div>
  );
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("awudijawiudh");
  const [input, setInput] = useState("");
  const [userHistory, setUserHistory] = useState<string[]>([]);
  const [assisstantHistory, setAssistantHistory] = useState<string[]>([]);
  const [beingQuestioned, setBeingQuestioned] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isDisabled = !username || beingQuestioned;

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

  function updatePrompt(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    e.preventDefault();
    setInput(e.target.value);
  }

  function handleSubmit() {
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
        console.error(err);
      });
  }

  return (
    <>
      <div className="chat-page-container">
        <ChatHistory history={assisstantHistory} className="ai-chat" />
        {username ? (
          <h1>{username}</h1>
        ) : (
          <NamePrompt setUsername={setUsername} />
        )}
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
      {topic}
      <Outlet />
    </>
  );
}
