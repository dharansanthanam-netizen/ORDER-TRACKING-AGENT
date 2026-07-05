# 📦 OrderBot — Order Tracking Agent Sandbox

An interactive, single-page web application that simulates an AI-powered order tracking chatbot (OrderBot). Built for testing and demonstrating the system prompt behaviour described in the `OrderBot` specification.

---

## 🚀 How to Run

**Option A — Direct file open (simplest):**
Double-click `index.html` to open it in your browser. All features work locally.

**Option B — Local HTTP server (recommended):**
Run the included PowerShell server script, then open `http://localhost:3000/`

```powershell
python -m http.server 3000
# or use the scratch server script if Python is unavailable
```

---

## 🖥️ App Layout

| Panel | Description |
|-------|-------------|
| **Left — Mock Database** | View, edit, and create mock orders in real time |
| **Center — Chat Window** | Talk to OrderBot; includes Agent Reasoning drawer |
| **Right — Dev Console + Human Desk** | Live tool call logs + human agent escalation workspace |

---

## 🧪 Test Scenarios

| What to type | Expected behaviour |
|---|---|
| `where is order #1001?` → verify `john@example.com` | Shipped order tracking card (BlueDart, Chennai Hub) |
| `where is order #1002?` → verify `jane@example.com` | Delayed order — **auto-escalates** (past promised date) |
| `where is order #1003?` → verify `bob@example.com` | Out for delivery today via FedEx |
| `jane@example.com` | Multiple orders found (#1002 + #1005) — bot asks which to check |
| `order #1001` → verify `jane@example.com` | **Security block** — wrong email, data withheld |
| `my package screen is cracked` | **Instant escalation** — damaged item reported |
| `I want a refund` | **Instant escalation** — routed to human agent |
| `speak to a human` | **Instant escalation** — customer-requested handoff |

---

## 📋 Mock Orders

| Order | Customer | Status |
|-------|---------|--------|
| #1001 | John Doe (john@example.com) | Shipped |
| #1002 | Jane Smith (jane@example.com) | Delayed *(past promise date — triggers escalation)* |
| #1003 | Bob Johnson (bob@example.com) | Out for Delivery |
| #1004 | Alice Brown (alice@example.com) | Placed |
| #1005 | Jane Smith (jane@example.com) | Packed |

---

## 🔧 Tools Simulated

- `get_order_by_id(order_id)`
- `get_orders_by_customer(email_or_phone)`
- `get_shipment_tracking(tracking_number)`
- `get_delivery_estimate(order_id)`
- `escalate_to_human(reason, order_id)`

All tool calls appear live in the **Dev Console** panel with JSON request/response payloads.

---

## 📁 Files

```
orederTrackingAgent/
├── index.html     ← App layout and HTML structure
├── style.css      ← Premium dark-theme design system
├── app.js         ← Agent logic, mock APIs, all event handlers
├── package.json   ← Project metadata
└── README.md      ← This file
```
