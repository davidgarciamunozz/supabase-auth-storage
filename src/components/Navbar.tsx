import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOut } from '../store/auth/authSlice';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
    const { session, user, role } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleSignOut = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/media/fesamed-logo.png" alt="FesamedCare Logo" className="navbar-logo-img" />
                </Link>

                {/* User Section */}
                <div className="navbar-right">
                    <button 
                        onClick={toggleTheme} 
                        className="theme-toggle"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    
                    {session ? (
                        <>
                            <div className="user-info-nav">
                                <div className="user-details">
                                    <span className="user-email">{user?.email}</span>
                                    <span className="user-role">{role}</span>
                                </div>
                            </div>
                            <button onClick={handleSignOut} className="btn-signout">
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <div className="nav-links">
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link nav-link-primary">Registrarse</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}