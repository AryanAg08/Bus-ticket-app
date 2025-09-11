const Seat = require("../models/seat");
const Trip = require("../models/trip");
const generateInvoice = require("../utils/invoiceGenerator");
const sendEmail = require("../utils/sendEmail");

exports.confirmBooking = async (req, res) => {
  try {
    const { tripId, seatNos } = req.body;
    const user = req.user;

    const trip = await Trip.findByPk(tripId);
    const seats = await Seat.findAll({ where: { tripId, seatNo: seatNos } });

    if (!trip || seats.length === 0) {
      return res.status(400).json({ message: "Invalid trip or seats" });
    }

    await Promise.all(seats.map(seat => seat.update({ isBooked: true })));

    const booking = {
      id: Date.now(), 
      trip,
      seats,
      totalPrice: seats.reduce((sum, seat) => sum + trip.seatPricing, 0),
    };

    const filePath = await generateInvoice(booking, user);

    await sendEmail({
      to: user.email,
      subject: "Booking Confirmation - Bus Ticket",
      text: "Your booking is confirmed. Please find the invoice attached.",
      html: `<p>Dear ${user.email},</p>
             <p>Your booking from <b>${trip.from}</b> to <b>${trip.to}</b> is confirmed.</p>
             <p>Seats: ${seatNos.join(", ")}</p>
             <p>Total: ₹${booking.totalPrice}</p>`,
      attachments: [
        {
          content: Buffer.from(require("fs").readFileSync(filePath)).toString("base64"),
          filename: `invoice-${booking.id}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });

    res.json({ message: "Booking confirmed & email sent", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
};
