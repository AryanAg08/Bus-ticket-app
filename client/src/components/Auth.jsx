import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../App";


export default function Auth({ mode = "login" }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // user | organiser
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();


    async function submit(e) {
        e.preventDefault();
        try {
            if (mode === "signup") {
                // same endpoint for both roles: backend separate organiser routes exist; we'll route based on role
                if (role === "organiser") {
                    await api.organiserSignup({ email, password, role });
                    alert("Organiser created. Please login.");
                    navigate("/login");
                    return;
                } else {
                    await api.signup({ email, password, role });
                    alert("User created. Please login.");
                    navigate("/login");
                    return;
                }
            } else {
                // login
                if (role === "organiser") {
                    const res = await api.organiserLogin({ email, password });
                    handleLogin(res.token, "organiser");
                    localStorage.setItem("authToken", res.token);
                } else {
                    const res = await api.login({ email, password });
                    handleLogin(res.token, "user");
                    localStorage.setItem("authToken", res.token);
                }
                navigate("/trips");
            }
        } catch (err) {
            alert(err.message);
        }
    }


    return (
        <form className="card auth-card" onSubmit={submit}>
            <h2>{mode === "signup" ? "Signup" : "Login"}</h2>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />


            {mode === "signup" && (
                <>
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="user">User</option>
                        <option value="organiser">Organiser</option>
                    </select>
                </>
            )}


            {mode === "login" && (
                <>
                    <label>Login as</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="user">User</option>
                        <option value="organiser">Organiser</option>
                    </select>
                </>
            )}


            <button className="btn">{mode === "signup" ? "Signup" : "Login"}</button>
        </form>
    );
}