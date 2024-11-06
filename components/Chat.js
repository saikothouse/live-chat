'use client';

import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";

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
        <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
            <header className="bg-blue-500 p-4 rounded-t-lg">
                <h2 className="text-white text-lg font-bold">Live Chat</h2>
            </header>
            <div className="p-4 overflow-y-auto" style={{ height: "400px" }}>
                {messages.map(({ id, text, timestamp }) => (
                    <div key={id} className="flex items-start mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                            {text.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg w-full">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-500 text-sm">{format(new Date(timestamp?.seconds * 1000), 'PPpp')}</span>
                            </div>
                            <p className="text-gray-700">{text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex p-4 border-t border-gray-200">
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
