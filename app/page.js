'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signInWithGoogle } from './auth';
import { database } from './firebase/config';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from './auth'; // Assuming you have a custom hook for auth

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Get the currently logged-in user
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        const messagesRef = ref(database, 'messages');
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const messagesArray = data ? Object.values(data) : [];
            setMessages(messagesArray);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages: ", error);
            setError("Failed to load messages. Please try again.");
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
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
        })).catch((error) => {
            console.error("Error sending message: ", error);
            setError("Failed to send message. Please try again.");
        });
        setNewMessage('');
    };

    const deleteMessage = (timestamp) => {
        const messageRef = ref(database, `messages/${timestamp}`);
        remove(messageRef).catch((error) => {
            console.error("Error deleting message: ", error);
            setError("Failed to delete message. Please try again.");
        });
    };

    const handleTyping = () => {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000); // Set typing indicator timeout
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
                {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : (
                    <>
                        {error && <div className="text-red-500 text-center">{error}</div>}
                        {messages.map((msg, index) => (
                            <div key ={index} className={`p-2 my-2 rounded ${msg.user === (user?.displayName || 'Anonymous') ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}>
                                <div className="flex items-center">
                                    <div className="font-semibold">{msg.user}</div>
                                    {msg.user === (user?.displayName || 'Anonymous') && (
                                        <button onClick={() => deleteMessage(msg.timestamp)} className="ml-2 text-red-500 hover:text-red-700">Delete</button>
                                    )}
                                </div>
                                <div>{msg.text}</div>
                                <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                            </div>
                        ))}
                        {typing && <div className="text-gray-500 italic">{user?.displayName} is typing...</div>}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>
            <footer className="p-4 bg-white border-t">
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        className="border p-2 w-full rounded shadow"
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded ml-2 hover:bg-blue-600 transition">Send</button>
                </div>
                <div className="text-xs text-gray-500">{newMessage.length}/200</div> {/* Character count */}
            </footer>
        </div>
    );
};

export default ChatApp;
