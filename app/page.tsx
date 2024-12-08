"use client";
import Image from "next/image";
import logo from "./assets/logo.webp";
import { useChat } from "ai/react";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import { Message } from "ai";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const handlePrompt = (prompt) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: prompt,
      role: "user",
    };
    append(msg);
  };
  const noMessages = !messages || messages.length === 0;

  return (
    <main>
      <Image
        src={logo}
        width="100"
        height="100"
        alt="Cricket GPT Logo"
        style={{ alignSelf: "flex-start", marginBottom: "20px" }}
      />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <p className="starter-text">
            The ultimate place for Cricket Fans! Ask anything about cricket, and
            it will return the most relevant answers.
          </p>
        ) : (
          <>
            {messages?.map((data, index) => (
              <Bubble key={`message-${index}`} message={data} />
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me a cricket-related question..."
        />
        <input type="submit" value="Ask" />
      </form>
    </main>
  );
};

export default Home;
