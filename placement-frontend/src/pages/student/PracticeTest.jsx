import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckSquare, ArrowRight, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../../services/axios';
import Loader from '../../components/Loader';
import { toastError } from '../../utils/toast';

export default function PracticeTest() {
    const navigate = useNavigate();
    const mode = useSelector((s) => s.theme?.mode || 'light');
    const isDark = mode === 'dark';
    const user = useSelector((s) => s.auth.user);
    // Fallback to localStorage if Redux user not yet hydrated
    const userId = user?._id || user?.id || localStorage.getItem('studentId');

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [testStarted, setTestStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

        const handleSubmit = useCallback(async () => {
        if (submitting) return;

        if (!userId) {
            toastError('Session error: could not identify user. Please refresh and try again.');
            return;
        }

        if (Object.keys(answers).length === 0) {
            toastError('Please answer at least one question before submitting.');
            return;
        }
    useEffect(() => {
        if (testStarted && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && testStarted) {
            handleSubmit();
        }
    }, [testStarted, timeLeft, handleSubmit]);

    
    const fetchQuestions = async (category = '') => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/test/questions?limit=10${category ? `&category=${category}` : ''}`);
            if (!data.questions || data.questions.length === 0) {
                toastError('No questions found for this category. Try another category.');
                return;
            }
            setQuestions(data.questions);
            setAnswers({});
            setCurrentIdx(0);
            setTimeLeft(600);
            setTestStarted(true);
        } catch (error) {
            console.error("Fetch questions error:", error);
            toastError(error?.response?.data?.msg || 'Failed to load questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };



        setSubmitting(true);

        const formattedAnswers = Object.entries(answers).map(([id, opt]) => ({
            questionId: id,
            selectedOption: opt
        }));

        try {
            const { data } = await api.post('/api/test/submit', {
                userId,
                answers: formattedAnswers
            });
            navigate('/student/test-results', { state: { result: data.result } });
        } catch (error) {
            console.error("Submit test error:", error);
            toastError(error?.response?.data?.msg || 'Failed to submit test. Please try again.');
            setSubmitting(false);
        }
    }, [answers, userId, navigate, submitting]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!testStarted) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[70vh] space-y-8 p-6 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-2 font-black uppercase tracking-widest text-indigo-500">
                        <Zap className="animate-pulse" />
                        <span>Adaptive Assessment</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">
                        Placement <span className="text-zinc-500">Readiness</span> Test
                    </h1>
                    <p className="max-w-md mx-auto text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                        Test your skills in Aptitude, Reasoning, and Verbal. 10 questions. 10 minutes. Real-time AI feedback.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {['Aptitude', 'Reasoning', 'Verbal'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => fetchQuestions(cat)}
                            className={`group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${isDark
                                    ? 'border-zinc-800 bg-zinc-900/50 hover:border-indigo-500 hover:bg-zinc-900'
                                    : 'border-zinc-100 bg-white shadow-xl hover:border-indigo-600'
                                }`}
                        >
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xl group-hover:scale-110 transition-transform">
                                <Zap />
                            </div>
                            <span className="font-black uppercase tracking-widest text-sm">{cat} Special</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => fetchQuestions()}
                    className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                    Mixed Practice Run
                </button>
            </div>
        );
    }

    if (loading || submitting) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader label={submitting ? "Analyzing Performance..." : "Compiling Questions..."} />
            </div>
        );
    }

    const currentQ = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
        <div className={`max-w-4xl mx-auto space-y-8 p-4 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Active Session</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                        Question <span className="text-zinc-500">{currentIdx + 1}</span> / {questions.length}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 60 ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 'border-zinc-800 bg-zinc-900/50'
                        }`}>
                        <Clock />
                        <span className="font-black tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                    >
                        Finish Test
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question Card */}
            <div className={`rounded-[3rem] border p-12 space-y-10 transition-all duration-500 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-white shadow-soft'
                }`}>
                <div className="space-y-4">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        {currentQ.category} • {currentQ.difficulty}
                    </span>
                    <h3 className="text-2xl font-black leading-tight tracking-tight">
                        {currentQ.question}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => setAnswers(prev => ({ ...prev, [currentQ._id || currentQ.id]: opt }))}
                            className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left ${answers[currentQ._id || currentQ.id] === opt
                                    ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400'
                                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                                }`}
                        >
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black ${answers[currentQ._id || currentQ.id] === opt ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
                >
                    Previous
                </button>
                {currentIdx === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        Submit for AI Analysis <ArrowRight />
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIdx(prev => prev + 1)}
                        className="flex items-center gap-2 px-10 py-5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95"
                    >
                        Next Question <ArrowRight />
                    </button>
                )}
            </div>
        </div>
    );
}
