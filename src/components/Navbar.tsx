import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white h-16 flex justify-between items-center px-4 shadow-md">   
            <Link to="/">Home</Link>
            <div className="flex gap-4">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            </div>
        </nav>
    )
}