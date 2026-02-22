import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "./models/Invoice.js";
import InvoiceLine from "./models/InvoiceLine.js";

dotenv.config();

const seed = async () => {
  try {
    if (
      !process.env.MONGODB_URI ||
      process.env.MONGODB_URI.includes("your_mongodb_url_here")
    ) {
      console.error(
        "❌ Error: Please update your MONGODB_URI in the .env file first!",
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB...");

    // Clear existing data (optional)
    // await Invoice.deleteMany({});
    // await InvoiceLine.deleteMany({});

    const sampleInvoice = new Invoice({
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Aswin Rajasekar",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      taxRate: 10,
      taxAmount: 180,
      total: 1980,
      balanceDue: 1980,
    });

    const savedInvoice = await sampleInvoice.save();

    const lines = [
      {
        invoiceId: savedInvoice._id,
        description: "MERN Stack Development",
        quantity: 1,
        unitPrice: 1500,
        lineTotal: 1500,
      },
      {
        invoiceId: savedInvoice._id,
        description: "UI/UX Design Consultation",
        quantity: 2,
        unitPrice: 150,
        lineTotal: 300,
      },
    ];

    await InvoiceLine.insertMany(lines);

    console.log("\n🚀 Sample Invoice Created Successfully!");
    console.log("-----------------------------------");
    console.log(`Invoice ID: ${savedInvoice._id}`);
    console.log(
      `URL to view: http://localhost:5173/invoices/${savedInvoice._id}`,
    );
    console.log("-----------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
