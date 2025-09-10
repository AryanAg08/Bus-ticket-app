const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (booking, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, `../../invoices/invoice-${booking.id}.pdf`);

      // Ensure invoices folder exists
      if (!fs.existsSync(path.join(__dirname, "../../invoices"))) {
        fs.mkdirSync(path.join(__dirname, "../../invoices"));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text("Bus Ticket Invoice", { align: "center" });
      doc.moveDown();

      // User Info
      doc.fontSize(12).text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      // Trip Info
      doc.text(`Trip: ${booking.trip.from} → ${booking.trip.to}`);
      doc.text(`Departure: ${booking.trip.departureTime}`);
      doc.text(`Arrival: ${booking.trip.arrivalTime}`);
      doc.moveDown();

      // Seats Info
      doc.text("Seats Booked:");
      booking.seats.forEach((seat) => {
        doc.text(` - Seat ${seat.seatNo} : ₹${seat.price}`);
      });

      doc.moveDown();
      doc.text(`Total: ₹${booking.totalPrice}`, { align: "right" });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;
