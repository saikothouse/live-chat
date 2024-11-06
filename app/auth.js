import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from './firebase/config';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User  signed in: ", user);
        return user; // Return the user object for further use
    } catch (error) {
        // Handle specific error cases
        let errorMessage = "An error occurred during sign-in.";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "The sign-in popup was closed before completion.";
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = "The sign-in request was cancelled.";
        }
        console.error("Error signing in: ", error);
        throw new Error(errorMessage); // Throw a user-friendly error
    }
};
