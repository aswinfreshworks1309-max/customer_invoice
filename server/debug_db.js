import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "./models/Invoice.js";

dotenv.config();

const debug = async () => {
  try {
    console.log("--- Database Debugger ---");
    console.log(
      "Connecting to:",
      process.env.MONGODB_URI?.split("@")[1] || "No URI found",
    );

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connection Successful!");

    const count = await Invoice.countDocuments();
    console.log(`📊 Invoices in Database: ${count}`);

    if (count > 0) {
      const latest = await Invoice.findOne().sort({ createdAt: -1 });
      console.log("📝 Latest Invoice ID:", latest._id);
      console.log("📝 Invoice Number:", latest.invoiceNumber);
    } else {
      console.log("❌ No invoices found. Please run: npm run seed");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Debug Error:", error.message);
    process.exit(1);
  }
};

debug();
