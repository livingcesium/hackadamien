interface Props {
  setUsername: (name: string) => void;
}

export default function NamePrompt({ setUsername }: Props) {
  return (
    <div id="name-prompt">
      <form
        action={(formData) => setUsername(formData.get("username") as string)}
      >
        <input name="username" type="text" placeholder="Your name" />
      </form>
    </div>
  );
}
