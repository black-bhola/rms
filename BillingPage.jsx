import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GenerateBillModal from './GenerateBillModal';

export default function BillingPage() {
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [aiSummary, setAiSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentTransactions(transactions);
        });
        return () => unsub();
    }, []);
    
    const dailyIncomeData = [
        { time: '12 PM', income: 400 }, { time: '1 PM', income: 300 },
        { time: '2 PM', income: 600 }, { time: '3 PM', income: 700 },
        { time: '4 PM', income: 500 }, { time: '5 PM', income: 800 },
        { time: '6 PM', income: 900 }, { time: '7 PM', income: 1200 },
        { time: '8 PM', income: 1500 }, { time: '9 PM', income: 1300 },
    ];
    
    const getAiSummary = async () => {
        setIsLoading(true);
        setAiSummary('');
        setError('');
        
        const systemPrompt = `You are a restaurant business analyst. Analyze the provided JSON data which contains hourly income. Provide a concise, insightful summary of the day's performance. Mention the total income and peak hours. Keep the tone professional and encouraging.`;
        const userQuery = `Here is today's hourly income data for "Allrounder Restaurant": ${JSON.stringify(dailyIncomeData)}. Please provide a summary.`;
        
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            const result = await response.json();
            const summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (summaryText) {
                setAiSummary(summaryText.trim());
            } else {
                throw new Error("Couldn't generate a summary.");
            }
        } catch (err) {
            console.error("Gemini API call failed:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <div className="animate-slide-in-up space-y-12">
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-bold font-playfair text-white">Today's Income Analytics</h3>
                     <button onClick={getAiSummary} disabled={isLoading} className="flex items-center justify-center py-2 px-4 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 duration-300 disabled:opacity-50">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div> : '✨'}
                        {isLoading ? 'Analyzing...' : 'Get Daily Summary'}
                    </button>
                </div>

                {aiSummary && (
                    <div className="bg-black/20 p-6 rounded-2xl shadow-2xl mb-8 animate-fade-in border border-purple-500/50">
                        <h4 className="text-xl font-semibold font-playfair text-purple-300 mb-2">✨ AI-Powered Summary</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{aiSummary}</p>
                    </div>
                )}
                 {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                <div className="bg-black/20 p-8 rounded-2xl shadow-2xl h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyIncomeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.7)" />
                            <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                            <Legend />
                            <Bar dataKey="income" fill="url(#colorIncome)" />
                        </BarChart>
                    </ResponsiveContainer>
                     <svg width="0" height="0">
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <div>
                 <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Billing</h3>
                 <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-2xl font-semibold font-playfair text-white">Recent Transactions</h4>
                        <div className="space-x-4">
                            <button className="py-2 px-4 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 duration-300">View Full Report</button>
                            <button onClick={() => setIsBillModalOpen(true)} className="py-2 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 duration-300">Generate New Bill</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4">Table</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map(t => (
                                    <tr key={t.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="p-4">Table {t.tableNumber}</td>
                                        <td className="p-4 text-green-400">${t.totalAmount.toFixed(2)}</td>
                                        <td className="p-4 text-gray-400">{t.orderTime?.toDate().toLocaleTimeString()}</td>
                                        <td className="p-4 text-gray-400">{t.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        </div>
        <GenerateBillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} />
        </>
    );
}

