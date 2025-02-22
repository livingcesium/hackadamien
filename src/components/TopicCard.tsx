interface Props {
  src: string;
  name: string;
  color: string;
}

export default function TopicCard({ src, name, color }: Props) {
  return (
    <div className="topic-card">
      <img src={src} style={{ backgroundColor: color }} />
      {name}
    </div>
  );
}
