// Order Tracking Agent Sandbox - Core Logic
// OrderBot: AI-Powered Order Tracking Assistant Simulator

// ═══════════════════════════════════════════════════
// INITIAL MOCK DATABASE
// ═══════════════════════════════════════════════════
const INITIAL_ORDERS = [
    {
        order_id: "1001",
        customer_name: "John Doe",
        customer_email: "john@example.com",
        customer_phone: "+1234567890",
        status: "shipped",
        carrier: "BlueDart",
        tracking_number: "BD987654",
        current_location: "Chennai Hub",
        estimated_delivery: "2026-07-07",
        promised_delivery: "2026-07-08",
        status_reason: "",
        items: [{ name: "Wireless Headphones", price: 99.99, qty: 1 }]
    },
    {
        order_id: "1002",
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "+1987654321",
        status: "delayed",
        carrier: "Delhivery",
        tracking_number: "DL12345",
        current_location: "Bengaluru Sorting Center",
        estimated_delivery: "2026-07-10",
        promised_delivery: "2026-07-04",
        status_reason: "Heavy monsoon rain flooding the sorting center.",
        items: [{ name: "Mechanical Keyboard", price: 129.99, qty: 1 }]
    },
    {
        order_id: "1003",
        customer_name: "Bob Johnson",
        customer_email: "bob@example.com",
        customer_phone: "+1555666777",
        status: "out for delivery",
        carrier: "FedEx",
        tracking_number: "FX88990",
        current_location: "Local FedEx Delivery Hub",
        estimated_delivery: "Today, by 6 PM",
        promised_delivery: "2026-07-05",
        status_reason: "",
        items: [{ name: "Smart Watch", price: 199.99, qty: 1 }]
    },
    {
        order_id: "1004",
        customer_name: "Alice Brown",
        customer_email: "alice@example.com",
        customer_phone: "+1222333444",
        status: "placed",
        carrier: "FedEx",
        tracking_number: "FX11223",
        current_location: "Warehouse Atlanta",
        estimated_delivery: "2026-07-12",
        promised_delivery: "2026-07-12",
        status_reason: "",
        items: [{ name: "Premium Yoga Mat", price: 29.99, qty: 2 }]
    },
    {
        order_id: "1005",
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "+1987654321",
        status: "packed",
        carrier: "DHL",
        tracking_number: "DH99881",
        current_location: "Warehouse Seattle",
        estimated_delivery: "2026-07-08",
        promised_delivery: "2026-07-08",
        status_reason: "",
        items: [{ name: "Ergonomic Office Chair", price: 349.99, qty: 1 }]
    }
];

// ═══════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════
let orders = [];

let escalationState = {
    active: false,
    reason: "",
    order_id: null
};

let convContext = {
    state: "GREETING",
    identifiedCustomer: null,
    selectedOrder: null,
    pendingVerificationOrderId: null,
    lastIntent: null
};

// Thoughts overlay — assigned after DOM is ready
let thoughtsOverlay = null;

// ═══════════════════════════════════════════════════
// DATABASE HELPERS
// ═══════════════════════════════════════════════════
function initDatabase(reset = false) {
    if (reset || !localStorage.getItem("orderbot_orders")) {
        orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
        saveDatabase();
    } else {
        orders = JSON.parse(localStorage.getItem("orderbot_orders"));
    }

    if (reset) {
        escalationState = { active: false, reason: "", order_id: null };
        convContext = {
            state: "GREETING",
            identifiedCustomer: null,
            selectedOrder: null,
            pendingVerificationOrderId: null,
            lastIntent: null
        };
        saveEscalationState();
    } else {
        loadEscalationState();
    }

    renderOrderList();
    renderEscalationUI();
}

function saveDatabase() {
    localStorage.setItem("orderbot_orders", JSON.stringify(orders));
}

function saveEscalationState() {
    localStorage.setItem("orderbot_escalation", JSON.stringify(escalationState));
}

function loadEscalationState() {
    const saved = localStorage.getItem("orderbot_escalation");
    if (saved) escalationState = JSON.parse(saved);
}

// ═══════════════════════════════════════════════════
// SIMULATED BACKEND APIS (TOOLS)
// ═══════════════════════════════════════════════════
function logToolCall(toolName, params, returnedData) {
    const consoleBody = document.getElementById("console-body");
    const placeholder = consoleBody.querySelector(".console-placeholder");
    if (placeholder) placeholder.remove();

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.className = "console-entry";
    entry.innerHTML = `
        <div class="console-entry-time">[${timestamp}]</div>
        <div class="console-entry-call">⚡ Tool Call: ${toolName}(${JSON.stringify(params, null, 2)})</div>
        <div class="console-entry-return">➡️ Returns: ${JSON.stringify(returnedData, null, 2)}</div>
    `;
    consoleBody.appendChild(entry);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_order_by_id(order_id) {
    await delay(600);
    const cleanId = order_id.toString().replace("#", "").trim();
    const order = orders.find(o => o.order_id === cleanId);
    logToolCall("get_order_by_id", { order_id }, order || null);
    return order || null;
}

async function get_orders_by_customer(email_or_phone) {
    await delay(600);
    const query = email_or_phone.toLowerCase().trim();
    const customerOrders = orders.filter(o =>
        o.customer_email.toLowerCase() === query ||
        o.customer_phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );
    logToolCall("get_orders_by_customer", { email_or_phone }, customerOrders);
    return customerOrders;
}

async function get_shipment_tracking(tracking_number) {
    await delay(500);
    const order = orders.find(o => o.tracking_number === tracking_number);
    let trackingInfo = null;
    if (order) {
        trackingInfo = {
            tracking_number: order.tracking_number,
            carrier: order.carrier,
            status: order.status,
            current_location: order.current_location,
            status_reason: order.status_reason
        };
    }
    logToolCall("get_shipment_tracking", { tracking_number }, trackingInfo);
    return trackingInfo;
}

async function get_delivery_estimate(order_id) {
    await delay(500);
    const cleanId = order_id.toString().replace("#", "").trim();
    const order = orders.find(o => o.order_id === cleanId);
    let estimate = null;
    if (order) {
        estimate = {
            order_id: order.order_id,
            estimated_delivery: order.estimated_delivery,
            promised_delivery: order.promised_delivery,
            status: order.status
        };
    }
    logToolCall("get_delivery_estimate", { order_id }, estimate);
    return estimate;
}

async function escalate_to_human(reason, order_id) {
    await delay(400);
    escalationState.active = true;
    escalationState.reason = reason;
    escalationState.order_id = order_id;
    saveEscalationState();
    logToolCall("escalate_to_human", { reason, order_id }, { success: true, status: "escalated" });
    triggerEscalationInUI();
    return { success: true };
}

// ═══════════════════════════════════════════════════
// LEFT PANEL — ORDER LIST & EDITOR
// ═══════════════════════════════════════════════════
function renderOrderList() {
    const listEl = document.getElementById("order-list");
    listEl.innerHTML = "";

    orders.forEach(order => {
        const item = document.createElement("div");
        item.className = "order-item";
        item.dataset.id = order.order_id;

        const statusClass = order.status.replace(/\s+/g, '-');

        item.innerHTML = `
            <div class="order-item-header">
                <span class="order-id-label">#${order.order_id}</span>
                <span class="badge ${statusClass}">${order.status}</span>
            </div>
            <div class="order-item-body">
                <span>${order.customer_name}</span>
                <span>${order.carrier || 'N/A'}</span>
            </div>
        `;

        item.addEventListener("click", () => selectOrderForEditing(order.order_id));
        listEl.appendChild(item);
    });
}

function selectOrderForEditing(orderId) {
    document.querySelectorAll(".order-item").forEach(item => {
        item.classList.toggle("selected", item.dataset.id === orderId);
    });

    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;

    document.getElementById("edit-order-id").value = order.order_id;
    document.getElementById("edit-customer-name").value = order.customer_name;
    document.getElementById("edit-customer-email").value = order.customer_email;
    document.getElementById("edit-customer-phone").value = order.customer_phone;
    document.getElementById("edit-status").value = order.status;
    document.getElementById("edit-carrier").value = order.carrier;
    document.getElementById("edit-tracking").value = order.tracking_number;
    document.getElementById("edit-location").value = order.current_location;
    document.getElementById("edit-eta").value = order.estimated_delivery;
    document.getElementById("edit-promised").value = order.promised_delivery;
    document.getElementById("edit-reason").value = order.status_reason;
}

document.getElementById("order-editor-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const orderId = document.getElementById("edit-order-id").value;
    if (!orderId) { alert("Please select an order from the list to edit."); return; }

    const idx = orders.findIndex(o => o.order_id === orderId);
    if (idx === -1) return;

    orders[idx].customer_name     = document.getElementById("edit-customer-name").value;
    orders[idx].customer_email    = document.getElementById("edit-customer-email").value;
    orders[idx].customer_phone    = document.getElementById("edit-customer-phone").value;
    orders[idx].status            = document.getElementById("edit-status").value;
    orders[idx].carrier           = document.getElementById("edit-carrier").value;
    orders[idx].tracking_number   = document.getElementById("edit-tracking").value;
    orders[idx].current_location  = document.getElementById("edit-location").value;
    orders[idx].estimated_delivery = document.getElementById("edit-eta").value;
    orders[idx].promised_delivery = document.getElementById("edit-promised").value;
    orders[idx].status_reason     = document.getElementById("edit-reason").value;

    saveDatabase();
    renderOrderList();

    if (convContext.selectedOrder && convContext.selectedOrder.order_id === orderId) {
        convContext.selectedOrder = orders[idx];
    }

    appendSystemMessage(`Order #${orderId} database record was updated.`);
    alert(`Order #${orderId} updated successfully.`);
});

document.getElementById("btn-cancel-edit").addEventListener("click", () => {
    document.getElementById("order-editor-form").reset();
    document.getElementById("edit-order-id").value = "";
    document.querySelectorAll(".order-item").forEach(item => item.classList.remove("selected"));
});

// ═══════════════════════════════════════════════════
// ADD ORDER MODAL
// ═══════════════════════════════════════════════════
const modal = document.getElementById("add-order-modal");

document.getElementById("btn-add-order").addEventListener("click", () => {
    modal.classList.remove("hidden");
    const nextId = (Math.max(...orders.map(o => parseInt(o.order_id))) + 1).toString();
    document.getElementById("new-order-id").value = "#" + nextId;
});

function closeModal() {
    modal.classList.add("hidden");
    document.getElementById("create-order-form").reset();
}

document.getElementById("btn-close-modal").addEventListener("click", closeModal);
document.getElementById("btn-cancel-modal").addEventListener("click", closeModal);

document.getElementById("create-order-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rawId = document.getElementById("new-order-id").value;
    const cleanId = rawId.replace("#", "").trim();

    if (orders.some(o => o.order_id === cleanId)) {
        alert("An order with this ID already exists.");
        return;
    }

    const newOrder = {
        order_id:           cleanId,
        customer_name:      document.getElementById("new-customer-name").value,
        customer_email:     document.getElementById("new-customer-email").value,
        customer_phone:     document.getElementById("new-customer-phone").value,
        status:             document.getElementById("new-status").value,
        carrier:            document.getElementById("new-carrier").value,
        tracking_number:    document.getElementById("new-tracking").value,
        current_location:   document.getElementById("new-location").value,
        estimated_delivery: document.getElementById("new-eta").value,
        promised_delivery:  document.getElementById("new-promised").value,
        status_reason:      "",
        items:              [{ name: "Custom Item", price: 49.99, qty: 1 }]
    };

    orders.push(newOrder);
    saveDatabase();
    renderOrderList();
    closeModal();
    appendSystemMessage(`New order #${cleanId} was added to the database.`);
    selectOrderForEditing(cleanId);
});

// ═══════════════════════════════════════════════════
// RESET SANDBOX
// ═══════════════════════════════════════════════════
document.getElementById("btn-reset-sandbox").addEventListener("click", () => {
    if (confirm("Reset the database and clear all conversation history?")) {
        initDatabase(true);
        document.getElementById("chat-body").innerHTML = "";
        document.getElementById("console-body").innerHTML = '<div class="console-placeholder">// Real-time JSON logs of agent tool calls will stream here...</div>';
        document.getElementById("thoughts-content").innerHTML = '<div class="thought-step"><em>Waiting for customer message...</em></div>';
        sendInitialGreeting();
    }
});

// ═══════════════════════════════════════════════════
// CHAT MESSAGE RENDERING
// ═══════════════════════════════════════════════════
function appendMessage(sender, text, isBot = true, additionalHTML = "") {
    const chatBody = document.getElementById("chat-body");
    const msg = document.createElement("div");
    msg.className = `message ${isBot ? 'bot' : 'user'}`;
    msg.innerHTML = `
        <span class="message-sender">${sender}</span>
        <div class="message-bubble">
            ${text}
            ${additionalHTML}
        </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendSystemMessage(text, isResolved = false) {
    const chatBody = document.getElementById("chat-body");
    const msg = document.createElement("div");
    msg.className = `message system ${isResolved ? 'resolved' : ''}`;
    msg.innerHTML = `
        <div class="message-bubble">
            ⚙️ <strong>System:</strong> ${text}
        </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    removeTypingIndicator();
    const chatBody = document.getElementById("chat-body");
    const typing = document.createElement("div");
    typing.id = "typing-indicator";
    typing.className = "typing-indicator";
    typing.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
    const existing = document.getElementById("typing-indicator");
    if (existing) existing.remove();
}

// ═══════════════════════════════════════════════════
// AGENT THOUGHTS DRAWER
// ═══════════════════════════════════════════════════
function clearThoughts() {
    document.getElementById("thoughts-content").innerHTML = "";
}

function addThought(title, detail = "") {
    const content = document.getElementById("thoughts-content");
    const thought = document.createElement("div");
    thought.className = "thought-step";
    thought.innerHTML = `
        <div class="thought-step-title">${title}</div>
        ${detail ? `<div>${detail}</div>` : ''}
    `;
    content.appendChild(thought);
    content.scrollTop = content.scrollHeight;
    if (thoughtsOverlay) thoughtsOverlay.classList.remove("collapsed");
}

// ═══════════════════════════════════════════════════
// CONVERSATIONAL AGENT ENGINE
// ═══════════════════════════════════════════════════
function sendInitialGreeting() {
    appendMessage(
        "OrderBot",
        "Hello! I'm <strong>OrderBot</strong>, your order tracking assistant. I can help check your order status, delivery estimates, or shipment updates. <br><br>Could you please share your <strong>Order ID</strong>, or the email or phone number used at checkout?",
        true
    );
}

function parseMessage(text) {
    const lower = text.toLowerCase();

    const orderIdMatch = text.match(/#?(\d{4,6})/);
    const emailMatch   = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch   = text.match(/\+?[0-9\s\-]{7,15}/);

    const isGreeting         = (/\b(hi|hello|hey|greetings|good\s+morning|good\s+afternoon)\b/i).test(lower);
    const isEscalationRequest = (/\b(human|person|agent|representative|specialist|manager|support\s+team|chat\s+with\s+someone|speak\s+to\s+a\s+human|dispute|charge|complaint)\b/i).test(lower);
    const isDamageReport     = (/\b(damage|damaged|broken|smashed|wet|torn|defective|faulty|wrong\s+item|incorrect\s+item|missing\s+item|not\s+in\s+box|missing|cracked)\b/i).test(lower);
    const isActionRequest    = (/\b(cancel|refund|return|change\s+address|edit\s+address|reroute|exchange)\b/i).test(lower);
    const isStatusQuery      = (/\b(where|status|track|tracking|eta|when|arrive|delivery|shipped|transit|sent|estimate)\b/i).test(lower);

    let cleanPhone = null;
    if (phoneMatch) {
        const digits = phoneMatch[0].replace(/\D/g, '');
        if (digits.length >= 7 && (!orderIdMatch || orderIdMatch[0] !== phoneMatch[0])) {
            cleanPhone = phoneMatch[0].trim();
        }
    }

    return {
        text, lower, isGreeting, isEscalationRequest, isDamageReport, isActionRequest, isStatusQuery,
        orderId: orderIdMatch ? orderIdMatch[1] : null,
        email:   emailMatch   ? emailMatch[0]   : null,
        phone:   cleanPhone
    };
}

async function handleBotConversation(userInput) {
    showTypingIndicator();
    clearThoughts();
    addThought("Analyzing customer input...", `"${userInput}"`);

    const parsed = parseMessage(userInput);

    // ── Immediate escalation triggers ──────────────────────────────────────
    if (parsed.isDamageReport) {
        addThought("Escalation Trigger: Damaged / missing / wrong item reported.");
        const orderId = convContext.selectedOrder ? convContext.selectedOrder.order_id : (parsed.orderId || null);
        await escalate_to_human("Customer reported a damaged, wrong, or missing item.", orderId);
        removeTypingIndicator();
        appendMessage("OrderBot", "Oh no! I'm so sorry to hear that. Let me connect you with a customer support specialist right now to arrange a replacement or refund. One moment while I transfer you...", true);
        return;
    }

    if (parsed.isActionRequest) {
        addThought("Escalation Trigger: Refund / cancel / return / address-change requested.");
        const orderId = convContext.selectedOrder ? convContext.selectedOrder.order_id : (parsed.orderId || null);
        await escalate_to_human("Customer requested a refund, cancellation, return, or address change.", orderId);
        removeTypingIndicator();
        appendMessage("OrderBot", "I can certainly help route that! Refunds, returns, cancellations, and address changes must be handled by our customer care team. Transferring you to a human agent right away.", true);
        return;
    }

    if (parsed.isEscalationRequest) {
        addThought("Escalation Trigger: Customer explicitly requested a human representative.");
        const orderId = convContext.selectedOrder ? convContext.selectedOrder.order_id : (parsed.orderId || null);
        await escalate_to_human("Customer requested to speak to a person.", orderId);
        removeTypingIndicator();
        appendMessage("OrderBot", "Absolutely! I'm transferring you to a live support specialist right now. They'll have our full chat history so you won't need to repeat anything. One moment please...", true);
        return;
    }

    // ── Contact info lookup ────────────────────────────────────────────────
    if (parsed.email || parsed.phone) {
        const lookupVal = parsed.email || parsed.phone;
        addThought("Extracting customer contact info...", parsed.email ? `Email: ${parsed.email}` : `Phone: ${parsed.phone}`);
        addThought(`Calling tool: get_orders_by_customer('${lookupVal}')`);

        const customerOrders = await get_orders_by_customer(lookupVal);

        if (customerOrders.length > 0) {
            convContext.identifiedCustomer = {
                name:  customerOrders[0].customer_name,
                email: customerOrders[0].customer_email,
                phone: customerOrders[0].customer_phone
            };
            addThought("Customer identified and verified.", `Customer: ${convContext.identifiedCustomer.name}`);

            const targetOrderId = parsed.orderId || convContext.pendingVerificationOrderId;

            if (targetOrderId) {
                const order = customerOrders.find(o => o.order_id === targetOrderId.replace("#", ""));
                if (order) {
                    convContext.selectedOrder = order;
                    convContext.pendingVerificationOrderId = null;
                    addThought(`Verification matched for Order #${order.order_id}!`);
                    await processActiveTrackingResponse();
                } else {
                    addThought(`Security check FAILED: Contact details do not match Order #${targetOrderId}.`);
                    removeTypingIndicator();
                    appendMessage("OrderBot", `Thanks for verifying. However, those contact details don't match the records for order <strong>#${targetOrderId}</strong>. Could you double-check the order number or use the email/phone from checkout?`, true);
                }
                return;
            }

            if (customerOrders.length === 1) {
                convContext.selectedOrder = customerOrders[0];
                addThought(`Found exactly 1 order (#${convContext.selectedOrder.order_id}) for customer.`);
                await processActiveTrackingResponse();
            } else {
                addThought(`Found ${customerOrders.length} orders for customer: ${customerOrders.map(o => "#" + o.order_id).join(", ")}`);
                removeTypingIndicator();
                const orderListStr = customerOrders.map(o => `<strong>#${o.order_id}</strong> (${o.status.toUpperCase()})`).join(", ");
                appendMessage("OrderBot", `Hi <strong>${convContext.identifiedCustomer.name}</strong>! I found multiple orders under your details: ${orderListStr}.<br><br>Which order number would you like to check?`, true);
                convContext.state = "AWAITING_IDENTIFICATION";
            }
        } else {
            addThought("No orders found for provided contact details.");
            removeTypingIndicator();
            appendMessage("OrderBot", `I couldn't find any orders matching <em>${lookupVal}</em>. Could you double-check, or provide a different email or Order ID?`, true);
        }
        return;
    }

    // ── Order ID lookup ────────────────────────────────────────────────────
    if (parsed.orderId) {
        addThought(`Analyzing Order ID query: #${parsed.orderId}`);
        addThought(`Calling tool: get_order_by_id('${parsed.orderId}')`);
        const order = await get_order_by_id(parsed.orderId);

        if (order) {
            const alreadyVerified =
                convContext.identifiedCustomer &&
                (convContext.identifiedCustomer.email === order.customer_email ||
                 convContext.identifiedCustomer.phone === order.customer_phone);

            if (alreadyVerified) {
                convContext.selectedOrder = order;
                addThought("Order matches verified customer session.");
                await processActiveTrackingResponse();
            } else {
                convContext.pendingVerificationOrderId = order.order_id;
                addThought("Order found. Requesting PII verification before disclosing details.");
                removeTypingIndicator();
                appendMessage("OrderBot", `I found order <strong>#${order.order_id}</strong>! To protect your privacy, could you please verify the email address or phone number used at checkout?`, true);
                convContext.state = "VERIFYING";
            }
        } else {
            addThought(`No order found with ID: #${parsed.orderId}`);
            removeTypingIndicator();
            appendMessage("OrderBot", `I'm sorry, I couldn't find any order with ID <strong>#${parsed.orderId}</strong> in our system. Please double-check the order number and try again.`, true);
        }
        return;
    }

    // ── Pending verification fallback ──────────────────────────────────────
    if (convContext.state === "VERIFYING" && convContext.pendingVerificationOrderId) {
        addThought("Expected email/phone verification — input not recognized.");
        removeTypingIndicator();
        appendMessage("OrderBot", `I couldn't verify that detail. To check order <strong>#${convContext.pendingVerificationOrderId}</strong>, please share the email or phone number associated with the purchase.`, true);
        return;
    }

    // ── Greeting ───────────────────────────────────────────────────────────
    if (parsed.isGreeting) {
        addThought("Greeting detected — prompting for tracking details.");
        removeTypingIndicator();
        sendInitialGreeting();
        return;
    }

    // ── Generic fallback ───────────────────────────────────────────────────
    addThought("Input unrecognized — requesting order identification.");
    removeTypingIndicator();
    appendMessage("OrderBot", "I can help with order status, delivery estimates, or shipment updates. Please share your <strong>Order ID</strong> or the email/phone used at checkout so I can look that up.", true);
}

// ── Status response builder ────────────────────────────────────────────────
async function processActiveTrackingResponse() {
    const order = convContext.selectedOrder;
    if (!order) return;

    addThought(`Fetching full tracking details for Order #${order.order_id}`);
    addThought(`Calling tool: get_shipment_tracking('${order.tracking_number}')`);
    await get_shipment_tracking(order.tracking_number);

    addThought(`Calling tool: get_delivery_estimate('${order.order_id}')`);
    await get_delivery_estimate(order.order_id);

    // Auto-escalate if order is stuck beyond promised window
    const today = new Date("2026-07-05");
    const promisedDate = new Date(order.promised_delivery);

    if (order.status !== "delivered" && order.status !== "cancelled" && today > promisedDate) {
        addThought("GUARDRAIL TRIGGERED: Order is past its promised delivery date.");
        await escalate_to_human(
            `Order #${order.order_id} is unresolved past promised date (${order.promised_delivery}).`,
            order.order_id
        );
        removeTypingIndicator();
        const delayReason = order.status_reason ? ` due to: <em>${order.status_reason}</em>` : "";
        appendMessage(
            "OrderBot",
            `Sorry for the delay — here's the latest. Order <strong>#${order.order_id}</strong> is currently <em>${order.status}</em> at <strong>${order.current_location}</strong>${delayReason}.<br><br>Since delivery is past the promised date of <strong>${formatFriendlyDate(order.promised_delivery)}</strong>, I'm connecting you to a human agent right now to resolve this. One moment please...`,
            true
        );
        return;
    }

    const formattedETA = formatFriendlyDate(order.estimated_delivery);
    let responseText = "";
    let trackingHTML = "";

    switch (order.status) {
        case "placed":
            responseText = `Hi <strong>${order.customer_name}</strong>, your order <strong>#${order.order_id}</strong> has been successfully placed. We are preparing it for packaging. Estimated delivery: <strong>${formattedETA}</strong>.`;
            break;

        case "confirmed":
            responseText = `Hi <strong>${order.customer_name}</strong>, your order <strong>#${order.order_id}</strong> is confirmed and being processed. It should arrive by <strong>${formattedETA}</strong>.`;
            break;

        case "packed":
            responseText = `Good news! Your order <strong>#${order.order_id}</strong> has been packed and is ready to leave our warehouse. Our carrier will collect it shortly. Expected delivery: <strong>${formattedETA}</strong>.`;
            break;

        case "shipped":
            responseText = `Your order <strong>#${order.order_id}</strong> has shipped! It is in transit via <strong>${order.carrier}</strong> and was last spotted at <strong>${order.current_location}</strong>. Estimated arrival: <strong>${formattedETA}</strong>.`;
            trackingHTML = createTrackingCardHTML(order);
            break;

        case "out for delivery":
            responseText = `Great news! 🚚 Your order <strong>#${order.order_id}</strong> is <strong>out for delivery</strong> today! A <strong>${order.carrier}</strong> courier is on the way and should arrive by <strong>${formattedETA}</strong>.`;
            trackingHTML = createTrackingCardHTML(order);
            break;

        case "delivered":
            responseText = `Your order <strong>#${order.order_id}</strong> was successfully <strong>delivered</strong> by <strong>${order.carrier}</strong>. If you haven't received it, please let me know.`;
            trackingHTML = createTrackingCardHTML(order);
            break;

        case "delayed": {
            const reason = order.status_reason ? ` due to: <em>${order.status_reason}</em>` : "";
            responseText = `Sorry for the delay — here's the latest. Your order <strong>#${order.order_id}</strong> is currently in transit through <strong>${order.current_location}</strong> but is delayed${reason}. Updated estimated delivery: <strong>${formattedETA}</strong>.`;
            trackingHTML = createTrackingCardHTML(order);
            break;
        }

        case "cancelled": {
            const cancelReason = order.status_reason ? ` (Reason: ${order.status_reason})` : "";
            responseText = `Your order <strong>#${order.order_id}</strong> has been <strong>cancelled</strong>${cancelReason}. If you believe this is an error or want to dispute it, I can connect you with a support specialist.`;
            break;
        }

        case "returned":
            responseText = `We've received your returned item(s) for order <strong>#${order.order_id}</strong> at our sorting center. Your return is being processed.`;
            break;

        default:
            responseText = `Here is the latest update for order <strong>#${order.order_id}</strong>: Status is <em>${order.status}</em> at <strong>${order.current_location}</strong>. Estimated delivery: <strong>${formattedETA}</strong>.`;
    }

    removeTypingIndicator();
    appendMessage("OrderBot", `${responseText}<br><br>Is there anything else I can help you with?`, true, trackingHTML);
}

function formatFriendlyDate(dateStr) {
    if (!dateStr) return "N/A";
    const lower = dateStr.toLowerCase();
    if (lower.includes("today") || lower.includes("pm") || lower.includes("am")) return dateStr;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch (e) {
        return dateStr;
    }
}

function createTrackingCardHTML(order) {
    const statusClass = order.status.replace(/\s+/g, '-');
    return `
        <div class="tracking-card">
            <div class="tracking-card-header">
                <span>Carrier: <strong>${order.carrier}</strong></span>
                <span class="badge ${statusClass}">${order.status}</span>
            </div>
            <div class="tracking-step">
                <span>📍</span>
                <div>
                    <strong>Location:</strong> ${order.current_location || 'Warehouse'}<br>
                    <strong>Tracking No:</strong> <code style="font-family:var(--font-mono);font-size:11px;">${order.tracking_number}</code>
                </div>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════
// ESCALATION UI
// ═══════════════════════════════════════════════════
function triggerEscalationInUI() {
    // Header badge
    const badge = document.getElementById("agent-status-badge");
    badge.className = "agent-status-badge escalated";
    document.getElementById("agent-status-text").textContent = "OrderBot: Escalated";

    // Chat sub-status
    const subStatus = document.querySelector(".chat-status-sub");
    subStatus.textContent = "Escalated to Support Specialist";
    subStatus.className = "chat-status-sub text-danger";

    // Escalation panel
    document.getElementById("escalation-header-bar").className = "panel-header escalation-header active";
    document.getElementById("escalation-indicator").textContent = "ACTIVE";
    document.getElementById("escalation-inactive-state").classList.add("hidden");
    document.getElementById("escalation-active-state").classList.remove("hidden");

    document.getElementById("escalation-reason-text").textContent = escalationState.reason;
    document.getElementById("escalation-order-id").textContent =
        escalationState.order_id ? `#${escalationState.order_id}` : "None";

    document.getElementById("chat-user-input").placeholder = "Chatting with human support agent...";

    appendSystemMessage(`Chat escalated to human agent. Reason: ${escalationState.reason}`);
}

function renderEscalationUI() {
    if (escalationState.active) {
        triggerEscalationInUI();
    } else {
        const badge = document.getElementById("agent-status-badge");
        badge.className = "agent-status-badge";
        document.getElementById("agent-status-text").textContent = "OrderBot: Online";

        const subStatus = document.querySelector(".chat-status-sub");
        subStatus.textContent = "Active & Ready";
        subStatus.className = "chat-status-sub text-success";

        document.getElementById("escalation-header-bar").className = "panel-header escalation-header inactive";
        document.getElementById("escalation-indicator").textContent = "INACTIVE";
        document.getElementById("escalation-inactive-state").classList.remove("hidden");
        document.getElementById("escalation-active-state").classList.add("hidden");

        document.getElementById("chat-user-input").placeholder = "Type a message... (e.g., 'where is my order #1001?')";
    }
}

// Force escalate button
document.getElementById("btn-trigger-escalation-manual").addEventListener("click", () => {
    const orderId = convContext.selectedOrder ? convContext.selectedOrder.order_id : null;
    escalate_to_human("Manual force escalation by developer.", orderId);
});

// Human agent sends message to customer
document.getElementById("human-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const msgInput = document.getElementById("human-message");
    const text = msgInput.value.trim();
    if (!text) return;
    appendMessage("Support Specialist (Human)", text, true);
    msgInput.value = "";
});

// Resolve escalation → return to bot
document.getElementById("btn-resolve-escalation").addEventListener("click", () => {
    escalationState.active   = false;
    escalationState.reason   = "";
    escalationState.order_id = null;
    saveEscalationState();
    renderEscalationUI();
    convContext.state = "GREETING";
    appendSystemMessage("Support session resolved. OrderBot is back online.", true);

    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        appendMessage("OrderBot", "I'm back online! Let me know if you need any other order tracking help.", true);
    }, 1000);
});

// ═══════════════════════════════════════════════════
// CHAT INPUT HANDLERS
// ═══════════════════════════════════════════════════
document.getElementById("chat-input-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const chatInput = document.getElementById("chat-user-input");
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage("Customer", text, false);
    chatInput.value = "";

    if (escalationState.active) {
        addThought("Chat is escalated — message routed to Human Escalation Desk.");
        const textarea = document.getElementById("human-message");
        textarea.placeholder = "Customer sent a message! Type your response here...";
        textarea.focus();
    } else {
        handleBotConversation(text);
    }
});

document.getElementById("btn-clear-chat").addEventListener("click", () => {
    document.getElementById("chat-body").innerHTML = "";
    sendInitialGreeting();
});

document.getElementById("btn-clear-console").addEventListener("click", () => {
    document.getElementById("console-body").innerHTML =
        '<div class="console-placeholder">// Real-time JSON logs of agent tool calls will stream here...</div>';
});

// ═══════════════════════════════════════════════════
// STARTUP BOOTSTRAP
// ═══════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
    // Wire up thoughts overlay toggle
    thoughtsOverlay = document.getElementById("thoughts-overlay");
    document.getElementById("thoughts-toggle").addEventListener("click", () => {
        thoughtsOverlay.classList.toggle("collapsed");
    });

    initDatabase();
    sendInitialGreeting();

    if (orders.length > 0) {
        selectOrderForEditing(orders[0].order_id);
    }
});
