import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy Data for Fallback (Stateful for seamless testing)
let dummyInvoices = [
  {
    _id: "65d3a1b2c3d4e5f6a7b8c9d0",
    invoiceNumber: "INV-2024-MOCK",
    customerName: "Sample Customer (Offline Mode)",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "DRAFT",
    total: 2500,
    amountPaid: 500,
    balanceDue: 2000,
    taxRate: 10,
    taxAmount: 250,
    isArchived: false,
    lineItems: [
      {
        description: "Development Work",
        quantity: 1,
        unitPrice: 2000,
        lineTotal: 2000,
      },
      {
        description: "Consulting",
        quantity: 2,
        unitPrice: 250,
        lineTotal: 500,
      },
    ],
    payments: [{ amount: 500, paymentDate: new Date() }],
  },
];

// Routes
app.use(
  "/api/invoices",
  (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      console.log(`⚡ Mock Mode: ${req.method} ${req.path}`);

      // Handle GET List
      if (req.method === "GET" && req.path === "/")
        return res.json(dummyInvoices);

      // Handle POST Actions
      if (req.method === "POST") {
        if (req.path.includes("payments")) {
          const id = req.path.split("/")[1];
          const inv = dummyInvoices.find((i) => i._id === id);
          if (inv) {
            inv.amountPaid += req.body.amount;
            inv.balanceDue -= req.body.amount;
            if (inv.balanceDue <= 0) inv.status = "PAID";
          }
          return res
            .status(201)
            .json({ amount: req.body.amount, paymentDate: new Date() });
        }

        if (req.path === "/") {
          const id = new mongoose.Types.ObjectId().toString();
          const items = (req.body.lineItems || []).map((item) => ({
            ...item,
            lineTotal: (item.quantity || 1) * (item.unitPrice || 0),
          }));
          const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
          const tax = (subtotal * (req.body.taxRate || 0)) / 100;
          const total = subtotal + tax;

          const newInv = {
            ...req.body,
            lineItems: items,
            _id: id,
            status: "DRAFT",
            amountPaid: 0,
            total,
            balanceDue: total,
            taxAmount: tax,
            issueDate: new Date(),
            payments: [],
            isArchived: false,
          };
          dummyInvoices.unshift(newInv);
          return res.status(201).json(newInv);
        }
      }

      // Handle DELETE
      if (req.method === "DELETE") {
        const id = req.path.split("/").filter(Boolean)[0];
        dummyInvoices = dummyInvoices.filter((inv) => inv._id !== id);
        return res.json({ message: "Deleted (Mock Mode)" });
      }

      // Handle GET Details
      if (req.method === "GET") {
        const id = req.path.split("/").filter(Boolean)[0];
        const invoice =
          dummyInvoices.find((inv) => inv._id === id) || dummyInvoices[0];
        return res.json(invoice);
      }
    }
    next();
  },
  invoiceRoutes,
);

// Database Connection
const mongoURI = process.env.MONGODB_URI;

if (mongoURI) {
  mongoose
    .connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
} else {
  console.log(
    "⚠️ MONGODB_URI not found in .env. Please add it to connect to the database.",
  );
}

app.get("/", (req, res) => {
  res.send("Invoice Management API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
