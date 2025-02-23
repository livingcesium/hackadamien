import { Outlet } from "react-router-dom";
import { Topic } from "./main";
import { useEffect, useRef, useState } from "react";
import NamePrompt from "./components/NamePrompt";
import "./ChatPage.css";
import axios from "axios";

interface Props {
  topic: Topic;
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("");
  const [reply, setReply] = useState("");
  const [userHistory, setUserHistory] = useState<string[]>([]);
  const [assisstantHistory, setAssistantHistory] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    interface Data {
      user: string[];
      ai: string[];
    }

    // Load up previous history, on mount
    axios
      .get("localhost:5000/history", {
        params: { data: { username: username } },
      })
      .then((res) => {
        const { user, ai }: Data = res.data;
        setUserHistory(user);
        setAssistantHistory(ai);
      });
  });

  function onEnterDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function handleSubmit() {
    interface ChatPairs {
      user: string;
      assistant: string;
    }

    axios
      .post("localhost:5000", {
        data: { user: username, prompt: reply },
      })
      .then((res) => {
        const { user, assistant }: ChatPairs = res.data;
        // Append backend response to history
        setUserHistory([...userHistory, user]);
        setAssistantHistory([...assisstantHistory, assistant]);
      });
  }

  return (
    <>
      <div className="chat-page-container">
        <div id="ai-text">{}</div>
        {username || <NamePrompt setUsername={setUsername} />}
        <form
          ref={formRef}
          action={(formData) => setReply(formData.get("reply") as string)}
          id="user-input"
          onSubmit={handleSubmit}
        >
          <textarea
            name="reply"
            placeholder="Reply to RoboDamien"
            onKeyDown={onEnterDown}
            rows={10}
            cols={100}
          />
          <button type="submit">=</button>
        </form>
      </div>
      {topic}
      <Outlet />
    </>
  );
}
