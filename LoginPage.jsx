import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import OwnerDashboard from "./OwnerDashboard.jsx";

// --- CONFIGURATION ---
// The specific UID allowed to access the dashboard
const ADMIN_UID = "SgGYmF3NLPbRDrVWFbtewGjchm33";

// --- MAIN APP COMPONENT ---
export default function App() {
  const [ownerUser, setOwnerUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // STRICT UID CHECK:
        // If the logged-in user does not match the Owner UID, force logout immediately.
        if (currentUser.uid === ADMIN_UID) {
          setOwnerUser(currentUser);
        } else {
          console.warn("Unauthorized access attempt. UID mismatch.");
          signOut(auth);
          setOwnerUser(null);
        }
      } else {
        setOwnerUser(null);
      }
      setLoadingAuthState(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Loading State
  if (loadingAuthState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-orange-500 rounded-full mb-2 animate-bounce"></div>
          Loading...
        </div>
      </div>
    );
  }
  
  // If authorized owner is logged in, show Dashboard
  if (ownerUser) {
    return <OwnerDashboard onLogout={() => signOut(auth)} />;
  }

  // Otherwise, show the Owner-Only Login Screen
  return <LoginScreen />;
}

// --- INLINE SVG ICONS ---
const AtSymbolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
);
const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

// --- SUB-COMPONENTS ---

const AIPasswordHintModal = ({ isOpen, onClose, onGenerateHint, hint, isLoading, error }) => {
    if (!isOpen) return null;
    const [email, setEmail] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 text-white animate-fade-up">
                <h3 className="text-2xl font-bold text-center mb-4 font-playfair">✨ Let AI Help You Remember</h3>
                <p className="text-center text-gray-300 mb-6">Enter your email for a creative hint.</p>
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AtSymbolIcon /></div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email Address" className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <button onClick={() => onGenerateHint(email)} disabled={isLoading || !email} className="w-full flex items-center justify-center py-3 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-transform transform hover:scale-105 duration-300 disabled:opacity-50">
                    {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div> : '✨ Generate Password Hint'}
                </button>
                {hint && !isLoading && <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-center"><p className="font-semibold">Here's your hint:</p><p className="mt-2 text-green-200">{hint}</p></div>}
                {error && !isLoading && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-center"><p className="font-semibold">Oops!</p><p className="mt-2 text-red-200">{error}</p></div>}
                <button onClick={onClose} className="w-full mt-6 py-2 px-4 text-sm text-gray-300 bg-transparent hover:bg-gray-700/50 rounded-lg transition">Close</button>
            </div>
        </div>
    );
};

const OwnerLogin = ({ setIsModalOpen, setAiHint, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');
        
        try {
            // 1. Attempt to sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // 2. Check if the authenticated UID matches the Admin UID
            if (userCredential.user.uid !== ADMIN_UID) {
                // If mismatch, sign out immediately and throw error
                await signOut(auth);
                throw new Error("Access Denied: You are not the authorized owner.");
            }
            // If UID matches, the logic in App.js (onAuthStateChanged) will handle the redirect to Dashboard

        } catch (error) {
            console.error("Login failed:", error);
            setLoginError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl animate-fade-up">
            <h2 className="text-3xl font-bold text-center text-white font-playfair">Owner Login</h2>
            <p className="text-center text-gray-300 text-sm">Restricted Access Area</p>
            
            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AtSymbolIcon /></div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 transition" required />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon /></div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 transition" required />
                </div>
                
                {loginError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">
                        {loginError}
                    </div>
                )}
                
                <div className="text-right">
                    <button type="button" onClick={() => { setIsModalOpen(true); setAiHint(''); setError(''); }} className="text-sm text-orange-300 hover:text-orange-200 hover:underline transition bg-transparent border-none cursor-pointer">
                        ✨ Forgot Password? Let AI Help
                    </button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-400 transition-transform transform hover:scale-105 disabled:opacity-50">
                    {loading ? 'Verifying Credentials...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

// --- LOGIN SCREEN LAYOUT ---
function LoginScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const backgroundImageUrl = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2670&auto=format&fit=crop';
  
  // Placeholder for AI logic
  const handleGenerateHint = async (userEmail) => {
      setIsLoading(true);
      setError('');
      setAiHint('');
      // Simulate API call
      setTimeout(() => {
          setAiHint("Try recalling the street you grew up on combined with your birth year.");
          setIsLoading(false);
      }, 1500);
  };

  return (
    <>
      <div className="relative min-h-screen w-full font-sans bg-gray-900 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImageUrl})` }}></div>
        <div className="absolute inset-0 bg-black opacity-70 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-10 animate-fade-down">
              <h1 className="text-5xl md:text-7xl font-bold text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.7)] font-serif">
                  Allrounder Restaurant
              </h1>
          </div>
          
          {/* Only Owner Login Component is rendered now */}
          <OwnerLogin setIsModalOpen={setIsModalOpen} setAiHint={setAiHint} setError={setError} />
        </div>
      </div>
      
      <AIPasswordHintModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onGenerateHint={handleGenerateHint} 
          hint={aiHint} 
          isLoading={isLoading} 
          error={error}
      />
    </>
  );
}