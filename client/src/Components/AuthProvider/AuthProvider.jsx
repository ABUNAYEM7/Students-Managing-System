import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
  } from "firebase/auth";
  import { createContext, useEffect, useState } from "react";
  import Swal from "sweetalert2";
  import Auth from "../../Firebase/firebase";
  
  export const AuthContext = createContext();
  
  const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const googleProvider = new GoogleAuthProvider();
  
    const registerUser = (email, pass) => {
      setLoading(true);
      return createUserWithEmailAndPassword(Auth, email, pass);
    };
  
    const userLogIn = (email, pass) => {
      setLoading(true);
      return signInWithEmailAndPassword(Auth, email, pass);
    };
  
    const signInWithGoogle = () => {
      setLoading(true);
      return signInWithPopup(Auth, googleProvider);
    };
  
    const updateUserProfile = async (updatedData) => {
      try {
        await updateProfile(Auth.currentUser, updatedData);
        await Auth.currentUser.reload();
        setUser({ ...Auth.currentUser });
      } catch (err) {
        Swal.fire({
          title: `${err.message || err.code}`,
          text: "Thanks For Being With Us",
          icon: "warning",
          confirmButtonText: "close",
        });
      }
    };
  
    const userLogOut = async () => {
      return signOut(Auth);
    };
  
    useEffect(() => {
        setLoading(true);
      
        const unsubscribe = onAuthStateChanged(Auth, async (currentUser) => {
          try {
            if (currentUser?.email) {
              console.log(currentUser)
              setUser(currentUser);
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error during authentication or clearing cookies:", error);
            setUser(null);
          } finally {
            setLoading(false);
          }
        });
      
        // Cleanup function
        return () => unsubscribe();
      }, []);

    const authInfo = {
      registerUser,
      userLogIn,
      signInWithGoogle,
      updateUserProfile,
      userLogOut,
      user,
      loading,
    };
  
    return (
      <AuthContext.Provider value={authInfo}>
        {children}
        </AuthContext.Provider>
    );
  };
  
  export default AuthProvider;