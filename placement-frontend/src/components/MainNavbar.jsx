import { Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function MainNavbar() {
    const navigate = useNavigate();

    // Updated Helper for Indigo active link styling
    const linkStyles = ({ isActive }) => 
        `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
            isActive 
            ? "text-indigo-600 bg-indigo-600/10 dark:text-indigo-400 dark:bg-indigo-400/10 shadow-sm" 
            : "text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-indigo-300"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/70">
            <div className="mx-auto max-w-7xl flex h-20 items-center justify-between gap-4 px-6">

                {/* LEFT SIDE: LOGO - Updated to Indigo Gradient */}
                <div 
                    className="flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-95" 
                    onClick={() => navigate("/")}
                >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                        <span className="text-white font-black text-lg">P</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Placement<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                    </h1>
                </div>

                {/* RIGHT SIDE: NAV & ACTIONS */}
                <div className="flex items-center gap-4 md:gap-8">

                    {/* NAV LINKS */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" className={linkStyles}>Home</NavLink>
                        <NavLink to="/about" className={linkStyles}>About</NavLink>
                        <NavLink to="/contact" className={linkStyles}>Contact</NavLink>
                    </nav>

                    {/* SEPARATOR */}
                    <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        
                        {/* THEMED GHOST BUTTON */}
                        <Link 
                            to="/login" 
                            className={`hidden sm:block px-6 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 border-2 active:scale-95 ${
                                "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white"
                            }`}
                        >
                            Sign In
                        </Link>

                        {/* Mobile Menu Icon */}
                        <button className="md:hidden p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}