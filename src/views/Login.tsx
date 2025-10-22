import { useNavigate } from "react-router-dom"


export default function Login() {
    const navigate = useNavigate()
    return (
        <>
        <h1>Login</h1>
        <button onClick={() => navigate('/register')}>Register</button>
        </>
    )
}