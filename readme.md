# Bus Seat Booking System

A real-time bus seat booking system with seat selection, holding, and ticket confirmation. The project includes a **Node.js/Express backend** and a **React frontend**, supporting real-time updates via **Socket.IO**.

---

## Technologies Used

* **Backend**:

  * Node.js, Express
  * Sequelize ORM with PostgreSQL
  * Socket.IO for real-time seat updates
  * JWT authentication
  * Nodemailer for email notifications
  * PDF generation for invoices
  * Redis for temporary seat holds

* **Frontend**:

  * React.js with Hooks
  * React Router for navigation
  * Socket.IO client for real-time updates
  * React Toastify for notifications
  * CSS for seat map styling

---

## Backend Routes

### **Auth Routes**

* `POST /auth/register` – Register a new user
* `POST /auth/login` – Login and receive JWT

### **Trip Routes**

* `GET /trips` – Get all trips
* `GET /trips/:id` – Get details of a specific trip (used for seat map display)

### **Seat Routes**

* `GET /trips/:tripId/seats` – Fetch seats for a trip
* `POST /seats/hold` – Hold selected seats temporarily
* `POST /seats/release` – Release held seats
* `POST /seats/purchase` – Purchase seats (finalize booking)

### **Booking Routes**

* `POST /booking/confirm` – Confirm booking and generate invoice
* Sends email with invoice attached

### **Socket Events**

* `seatHeld` – When a seat is held by any user
* `seatReleased` – When a seat is released
* `seatSold` – When a seat is purchased

> The frontend listens to these events to update the seat map in real-time.

---

## Frontend Features

* **Seat Map Visualization**: Shows available, selected, held (by self or others), and booked seats.
* **Seat Selection**: Users can select multiple seats and hold them temporarily.
* **Countdown Timer**: Seats held show a countdown until expiration.
* **Real-Time Updates**: Seat status updates instantly via Socket.IO.
* **Booking Confirmation**: After purchase, booking is confirmed and invoice emailed.
* **Trip Details**: Shows trip origin, destination, date, departure, and arrival time in a styled info box.

---

## Example Workflow

1. User logs in and selects a trip.
2. Frontend fetches seats and trip details.
3. User selects seats → clicks **Hold**.
4. Held seats are updated in real-time for all users.
5. User can release or purchase seats.
6. On purchase, backend confirms booking, generates invoice, and sends email.
7. Seat map updates for all users via Socket.IO events.

---

Thank You!!