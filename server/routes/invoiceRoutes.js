import express from "express";
import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import InvoiceLine from "../models/InvoiceLine.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// 🔹 Fetch All Invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 1. Get Invoice Details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Invoice ID format" });
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const lineItems = await InvoiceLine.find({ invoiceId: invoice._id });
    const payments = await Payment.find({ invoiceId: invoice._id });

    res.json({
      ...invoice.toObject(),
      lineItems,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 2. Add Payment
router.post("/:id/payments", async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0)
    return res.status(400).json({ message: "Amount must be greater than 0" });

  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ message: "Amount exceeds balance due" });
    }

    const payment = new Payment({
      invoiceId: invoice._id,
      amount,
      paymentDate: new Date(),
    });
    await payment.save();

    invoice.amountPaid += amount;
    invoice.balanceDue -= amount;
    if (invoice.balanceDue === 0) {
      invoice.status = "PAID";
    }
    await invoice.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 3. Archive/Restore (v1 - body based)
router.post("/archive", async (req, res) => {
  const { id } = req.body;
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/restore", async (req, res) => {
  const { id } = req.body;
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true },
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 4. Archive/Restore (v2 - params based)
router.post("/:id/archive", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true },
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/restore", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isArchived: false },
      { new: true },
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Create Invoice
router.post("/", async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      dueDate,
      lineItems,
      taxRate = 0,
    } = req.body;

    let subtotal = 0;
    lineItems.forEach((item) => {
      item.lineTotal = item.quantity * (item.unitPrice || 0);
      subtotal += item.lineTotal;
    });

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      invoiceNumber,
      customerName,
      dueDate,
      taxRate,
      taxAmount,
      total,
      balanceDue: total,
    });
    const savedInvoice = await invoice.save();

    const savedLineItems = await InvoiceLine.insertMany(
      lineItems.map((item) => ({ ...item, invoiceId: savedInvoice._id })),
    );

    res
      .status(201)
      .json({ ...savedInvoice.toObject(), lineItems: savedLineItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Delete Invoice
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    await InvoiceLine.deleteMany({ invoiceId: req.params.id });
    await Payment.deleteMany({ invoiceId: req.params.id });

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
