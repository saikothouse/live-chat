'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase/config'; // Ensure this path is correct

const provider = new GoogleAuthProvider();

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser (user);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("User  signed in: ", user);
            setUser (user); // Update the user state
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setUser (null); // Update the user state
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
