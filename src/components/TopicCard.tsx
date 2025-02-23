import { Link } from "react-router-dom";
import { Topic } from "../main";

interface Props {
  src: string;
  topic: Topic;
  text: string;
  color: string;
}

export default function TopicCard({ src, topic, text, color }: Props) {
  return (
    <Link to={`/${topic}`}>
      <div className="topic-card">
        <img src={src} style={{ backgroundColor: color }} />
        {text}
      </div>
    </Link>
  );
}
