import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";


export default function Navbar() {
const { token, userRole, handleLogout } = useContext(AuthContext);


return (
<nav className="nav">
<div className="nav-inner container">
<div className="brand">BusTickets</div>
<div className="nav-links">
<Link to="/trips">Trips</Link>
{token && userRole === "organiser" && <Link to="/organiser">Organiser</Link>}
{!token ? (
<>
<Link to="/login">Login</Link>
<Link to="/signup">Signup</Link>
</>
) : (
<button className="btn small" onClick={handleLogout}>Logout</button>
)}
</div>
</div>
</nav>
);
}