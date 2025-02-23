import { Outlet } from "react-router-dom";
import { Topic } from "./main";
import { useRef, useState } from "react";
import NamePrompt from "./components/NamePrompt";
import "./ChatPage.css";

interface Props {
  topic: Topic;
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("");
  const [prompt, setPrompt] = useState("");
  console.log(prompt);

  const formRef = useRef<HTMLFormElement>(null);

  function onEnterDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <>
      <div className="chat-page-container">
        <div id="ai-text"></div>
        {username || <NamePrompt setUsername={setUsername} />}
        <form
          ref={formRef}
          action={(formData) => setPrompt(formData.get("reply") as string)}
          id="user-input"
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
