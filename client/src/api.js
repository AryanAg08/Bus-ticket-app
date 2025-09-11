const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";


async function request(path, method = "GET", body = null, token = null) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;


    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });


    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        throw new Error(data?.message || "Request failed");
    }
    return data;
}


export const api = {
    signup: (payload) => request("/user/signup", "POST", payload),
    login: (payload) => request("/user/login", "POST", payload),
    logout: (token) => request("/user/logout", "GET", null, token),


    organiserSignup: (payload) => request("/organiser/signup", "POST", payload),
    organiserLogin: (payload) => request("/organiser/login", "POST", payload),
    createTrip: (payload, token) => request("/organiser/create", "POST", payload, token),


    getTrips: () => request("/trips", "GET"), // you need a GET /trips backend route; implement if missing
    getTrip: (tripId) => request(`/trips/${tripId}`, "GET"),
    getSeats: (tripId, token) => request(`/trips/${tripId}/seats`, "GET", null, token),
    holdSeats: (payload, token) => request("/user/hold", "POST", payload, token),
    releaseSeats: (payload, token) => request("/user/release", "POST", payload, token),
    purchaseSeats: (payload, token) => request("/user/purchase", "POST", payload, token),
    confirmBooking: (payload, token) => request("/user/confirm", "POST", payload, token),
};