import React, { useState, useEffect, useRef } from 'react';

export default function QRCodeGenerator() {
    // --- STATE MANAGEMENT ---
    // Manages the value in the input box
    const [inputValue, setInputValue] = useState('');
    // The final number of tables to generate after clicking the button
    const [tableCount, setTableCount] = useState(0);
    // An array of QR codes that are currently visible on the screen
    const [displayedQRs, setDisplayedQRs] = useState([]);
    // A flag to track if we are currently in the process of generating codes
    const [isGenerating, setIsGenerating] = useState(false);
    // A flag to show the print button when generation is complete
    const [isFinished, setIsFinished] = useState(false);
    // Holds any validation error messages
    const [error, setError] = useState('');

    // --- QR CODE IMAGE DATA ---
    // =================================================================================
    // This now points to your local images.
    // IMPORTANT: For this to work, you MUST place your "qrCodeImages" folder
    // inside the "public" directory of your React project.
    // The image files inside should be named T1.png, T2.png, ..., T20.png.
    // =================================================================================
    const qrCodeImages = Array.from({ length: 20 }, (_, i) => {
        // This creates the correct path to your images, e.g., "/qrCodeImages/T1.png"
        return `/qrCodeImages/T${i + 1}.png`;
    });

    // A reference to the timer to control the animation interval
    const intervalRef = useRef(null);

    // --- EFFECT FOR SEQUENTIAL DISPLAY ---
    // This effect runs whenever the `isGenerating` or `displayedQRs` state changes.
    useEffect(() => {
        // If we are generating and haven't displayed all QRs yet...
        if (isGenerating && displayedQRs.length < tableCount) {
            // ...set a timer to add the next QR code after a short delay.
            intervalRef.current = setTimeout(() => {
                const nextQRIndex = displayedQRs.length;
                const newQR = {
                    src: qrCodeImages[nextQRIndex],
                    number: nextQRIndex + 1,
                };
                setDisplayedQRs(prevQRs => [...prevQRs, newQR]);
            }, 300); // Delay in milliseconds between each QR code appearing
        }
        // If all requested QR codes have been displayed...
        else if (displayedQRs.length === tableCount && tableCount > 0) {
            // ...stop the generation process and mark it as finished.
            setIsGenerating(false);
            setIsFinished(true);
            clearTimeout(intervalRef.current);
        }

        // Cleanup function to clear the timer if the component unmounts
        return () => clearTimeout(intervalRef.current);
    }, [isGenerating, displayedQRs, tableCount, qrCodeImages]);


    // --- EVENT HANDLERS ---
    // Handles changes to the number input field
    const handleInputChange = (e) => {
        const value = e.target.value;
        // Basic validation to allow empty or numbers between 1-20
        if (value === '' || (/^\d+$/.test(value) && value >= 1 && value <= 20)) {
            setInputValue(value);
            setError('');
        } else {
            setError('Please enter a number between 1 and 20.');
        }
    };

    // Starts the QR code generation process
    const handleGenerateClick = () => {
        const numTables = parseInt(inputValue, 10);
        if (numTables > 0 && numTables <= 20) {
            resetState(); // Reset for re-generation
            setTableCount(numTables);
            setIsGenerating(true);
        } else {
            setError('Please enter a valid number between 1 and 20.');
        }
    };

    // Triggers the browser's print dialog
    const handlePrint = () => {
        window.print();
    };

    // Resets all states to their initial values
    const resetState = () => {
        setTableCount(0);
        setDisplayedQRs([]);
        setIsGenerating(false);
        setIsFinished(false);
        setError('');
    }

    // --- RENDER ---
    return (
        <div className="bg-slate-50 min-h-screen font-sans p-4 sm:p-8 flex flex-col items-center antialiased">
            {/* --- INPUT SECTION (hidden on print) --- */}
            <div className="w-full max-w-lg mb-8 print:hidden">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Table QR Generator</h1>
                        <p className="text-slate-500 mt-1">Enter the number of tables you need (max 20).</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="e.g., 15"
                            min="1"
                            max="20"
                            disabled={isGenerating}
                            className="flex-grow w-full px-4 py-3 text-black bg-slate-100 border-2 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                        <button
                            onClick={handleGenerateClick}
                            disabled={isGenerating || !inputValue}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                     {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
            </div>


            {/* --- QR CODES DISPLAY AREA --- */}
            <div id="qr-code-container" className="w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayedQRs.map((qr) => (
                        <div
                            key={qr.number}
                            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center aspect-square animate-fade-in break-inside-avoid"
                        >
                            <img src={qr.src} alt={`Table ${qr.number} QR Code`} className="w-full h-auto object-contain rounded-md" />
                            <p className="mt-3 font-bold text-slate-700 text-lg">Table {qr.number}</p>
                        </div>
                    ))}
                </div>
            </div>

             {/* --- PRINT BUTTON (appears when finished, hidden on print) --- */}
            {isFinished && (
                <div className="mt-12 text-center print:hidden">
                     <button
                        onClick={handlePrint}
                        className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 animate-fade-in"
                    >
                        Print Codes or Save as PDF
                    </button>
                </div>
            )}

            {/* --- STYLES FOR ANIMATION AND PRINTING --- */}
            <style>
                {`
                    /* A simple fade-in and scale animation for each card */
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out forwards;
                    }

                    /* Styles applied only when printing the page */
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            padding: 0;
                            margin: 0;
                        }
                        #qr-code-container {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            max-width: 100%;
                        }
                        /* Prevents a QR card from being split across two pages */
                        .break-inside-avoid {
                            page-break-inside: avoid;
                        }
                    }
                `}
            </style>
        </div>
    );
}
