# 🧾 Invoice Details Module (Full Stack)

A premium Full Stack (MERN) Invoice Details Module built with modern design principles, interactive animations, and robust backend logic.

![Design Inspiration](https://cdn.dribbble.com/userupload/16149453/file/original-0c0b3d8d6f519c72f5d9f0e1d8466e3b.png)

## 🚀 Features

- **Dynamic Invoice Details**: Fetch and display invoice info, line items, and payment history.
- **Premium UI**: Dark-mode interface with glassmorphism, HSL colors, and smooth animations (Framer Motion).
- **Payment Logic**: Record new payments with balance updates (prevents overpayment).
- **Archive/Restore**: Toggle invoice status between active and archived.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React, Lucide Icons, Framer Motion, Axios, Tailwind CSS.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Styling**: Vanilla CSS with Tailwind-style utility tokens.

## 📦 Getting Started

### 1. Prerequisites

- Node.js installed
- MongoDB URI (Atlas or Local)

### 2. Backend Setup

1. Open the `/server` directory.
2. Open `.env` and fill in your `MONGODB_URI`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Open the `/client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

- `GET /api/invoices/:id` - Fetch invoice details, items, and payments.
- `POST /api/invoices/:id/payments` - Record a new payment (amount > 0 and <= balance).
- `POST /api/invoices/:id/archive` - Set `isArchived` to true.
- `POST /api/invoices/:id/restore` - Set `isArchived` to false.
- `POST /api/invoices/` - Helper endpoint to seed an invoice (body example below).

### Seed Invoice Example (POST `/api/invoices/`)

```json
{
  "invoiceNumber": "INV-2024-001",
  "customerName": "Jane Doe",
  "dueDate": "2024-12-31",
  "lineItems": [
    { "description": "Web Design", "quantity": 1, "unitPrice": 1500 },
    { "description": "Hosting (1yr)", "quantity": 1, "unitPrice": 200 }
  ]
}
```

## 🧠 Business Rules Implemented

- **Line Total**: Calculated automatically as `quantity × unitPrice`.
- **Grand Total**: Sum of all line totals.
- **Balance Due**: `Grand Total - amountPaid`.
- **Overpayment Prevention**: API rejects payments greater than the remaining balance.
- **Status Auto-update**: Automatically sets status to `PAID` when balance reaches zero.
"# customer_invoice" 
