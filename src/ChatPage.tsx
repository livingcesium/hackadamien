import { Outlet } from "react-router-dom";
import { Topic } from "./main";
import { useEffect, useRef, useState } from "react";
import NamePrompt from "./components/NamePrompt";
import "./ChatPage.css";
import axios from "axios";

interface Props {
  topic: Topic;
}

function ChatHistory({ history, className }) {
  return (
    <div>
      {history.map((msg, idx) => (
        <div key={idx} className={className}>{msg}</div>
      ))}
    </div>
  );
}

export default function ChatPage({ topic }: Props) {
  const [username, setUsername] = useState("");
  const [reply, setReply] = useState("");
  const [userHistory, setUserHistory] = useState<string[]>([]);
  const [assisstantHistory, setAssistantHistory] = useState<string[]>(["BLAAAH"]);
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if(!username) return;
    interface Data {
      user: string[];
      ai: string[];
    }

    // Load up previous history, on mount
    axios.get("http://localhost:5000/history", {
        params: { username: username },
      })
      .then((res) => {
        const { user, ai }: Data = res.data;
        console.log(user, ai);
        setUserHistory(user);
        setAssistantHistory(ai);
      }).catch((err) => {
        console.error(err)});
  }, [username]);

  function onEnterDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function updatePrompt(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    e.preventDefault();
    setReply(e.target.value);
  }

  function handleSubmit() {
    interface ChatPairs {
      user: string;
      assistant: string;
    }
    axios.post("http://localhost:5000/chat", {
        user: username, prompt: reply,
      })
      .then((res) => {
        const assistant : string = res.data;
        console.log("Assistant:", assistant);
        
        // Append backend response to history
        setUserHistory([...userHistory, reply]);
        setAssistantHistory([...assisstantHistory, assistant]);
      })
      .catch((err) => {
        console.error(err)});
  }

  return (
    <>
      <div className="chat-page-container">
        {/* <div id="ai-text">{
          assisstantHistory.map((msg, idx) => (
            <div key={idx} className="ai-chat">{msg}</div>
          ))
          }</div> */}
        <ChatHistory history={assisstantHistory} className="ai-chat" />
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
            onChange={updatePrompt}
            rows={10}
            cols={100}
            disabled={!username}
          />
          <button type="submit">=</button>
        </form>
      </div>
      {topic}
      <Outlet />
    </>
  );
}
