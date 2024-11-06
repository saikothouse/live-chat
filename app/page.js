'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signInWithGoogle } from './auth';
import { database } from './firebase/config';
import { ref, onValue, set } from 'firebase/database';
import { useAuth } from './auth'; // Assuming you have a custom hook for auth

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuth(); // Get the currently logged-in user
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const messagesRef = ref(database, 'messages');
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const messagesArray = data ? Object.values(data) : [];
            setMessages(messagesArray);
        });
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat when new messages are added
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (newMessage.trim() === '') return; // Prevent sending empty messages
        const timestamp = new Date().toISOString();
        const messageData = {
            text: newMessage,
            user: user?.displayName || 'Anonymous',
            timestamp,
        };
        const messagesRef = ref(database, 'messages');
        set(messagesRef, (prevMessages) => ({
            ...prevMessages,
            [timestamp]: messageData,
        }));
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-blue-500 p-4 text-white flex justify-between items-center">
                <h1 className="text-xl">Live Chat</h1>
                {!user ? (
                    <button onClick={signInWithGoogle} className="bg-white text-blue-500 p-2 rounded">Sign in with Google</button>
                ) : (
                    <span className="text-white">{user.displayName}</span>
                )}
            </header>
            <main className="flex-1 overflow-auto p-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 my-2 rounded ${msg.user === (user?.displayName || 'Anonymous') ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}>
                        <div className="font-semibold">{msg.user}</div>
                        <div>{msg.text}</div>
                        <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 bg-white border-t">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="border p-2 w-full rounded"
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded ml-2">Send</button>
            </footer>
        </div>
    );
};

export default ChatApp;
