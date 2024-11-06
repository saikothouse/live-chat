import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await addDoc(collection(db, "messages"), {
        text: input,
        timestamp: new Date(),
      });
      setInput("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 overflow-y-auto" style={{ height: "400px" }}>
        {messages.map(({ id, text }) => (
          <div key={id} className="p-2 bg-gray-100 rounded-lg mb-2">{text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-lg"
          placeholder="Type a message"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-lg">Send</button>
      </form>
    </div>
  );
};

export default Chat;
