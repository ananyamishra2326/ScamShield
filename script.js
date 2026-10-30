// Auto-detect environment:
//   • file:// or 127.0.0.1 → local Flask dev server on port 5000
//   • Vercel (or any real host) → same-origin API routes (empty string)
const API_BASE_URL =
    (window.location.protocol === "file:" ||
     window.location.hostname === "127.0.0.1" ||
     window.location.hostname === "localhost")
        ? "http://127.0.0.1:5000"
        : "https://scamshield-9ghw.onrender.com";

// ======================================
// 1. SCAM MESSAGE ANALYZER
// ======================================

const analyzeBtn = document.getElementById("analyzeBtn");
const scamInput = document.getElementById("scamInput");
const scamType = document.getElementById("scamType");
const analysisResult = document.getElementById("analysisResult");
const imageGuide = document.getElementById("imageGuide");

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", function () {
        const message = scamInput.value.trim();
        const type = scamType.value;

        analysisResult.className = "result-box hidden";
        imageGuide.classList.add("hidden");

        if (type === "image") {
            imageGuide.classList.remove("hidden");

            if (message) {
                showResult(
                    "warning",
                    "Image safety guidance",
                    "The text you entered has not been used to authenticate an image.",
                    [
                        "Verify payment status directly in your banking app.",
                        "Do not trust screenshots as proof of payment.",
                        "Check links and requests shown in the image independently."
                    ]
                );
            }
            return;
        }

        if (!message) {
            showResult(
                "warning",
                "Please enter some details",
                "Enter a message or describe the suspicious call or link before checking.",
                []
            );
            return;
        }

        const text = message.toLowerCase();
        const warnings = [];

        const rules = [
            {
                pattern: /\botp\b|one.time password|verification code|security code/,
                reason: "The message mentions an OTP or verification code. Never share these codes."
            },
            {
                pattern: /\bpin\b|upi pin|atm pin|card pin/,
                reason: "The message mentions a PIN. Never disclose your PIN."
            },
            {
                pattern: /account.{0,35}(block|suspend|freeze|close)|\b(block|suspend|freeze).{0,35}account/,
                reason: "Threats about blocking or suspending an account can create panic."
            },
            {
                pattern: /urgent|immediately|within \d+ minutes|act now|last warning|final warning/,
                reason: "Urgent language can pressure you into acting without verification."
            },
            {
                pattern: /click here|verify.{0,20}(account|identity|details)|update.{0,20}(kyc|account|pan|aadhaar)/,
                reason: "Requests to click links or update sensitive information may be phishing attempts."
            },
            {
                pattern: /won a prize|claim your reward|lottery|lucky winner|free gift|cashback/,
                reason: "Unexpected prizes or rewards can be used to lure people into scams."
            },
            {
                pattern: /send money|transfer money|pay.*fee|processing fee|receive money|collect request/,
                reason: "Unexpected payment requests should be independently verified."
            },
            {
                pattern: /remote access|screen sharing|anydesk|teamviewer|install this app/,
                reason: "Remote-access apps can expose your private information."
            },
            {
                pattern: /police.{0,30}(case|arrest)|digital arrest|arrest warrant|legal action|customs.{0,20}(parcel|package)/,
                reason: "Threats of arrest or legal action may be impersonation tactics."
            },
            {
                pattern: /bit\.ly|tinyurl\.com|t\.co\/|cutt\.ly|shorturl\.at/,
                reason: "A shortened link can hide its actual destination."
            },
            {
                pattern: /password|bank details|card number|cvv|aadhaar number|pan number/,
                reason: "The message refers to sensitive personal or financial information."
            }
        ];

        rules.forEach(function (rule) {
            if (rule.pattern.test(text)) {
                warnings.push(rule.reason);
            }
        });

        if (/https?:\/\/|www\./i.test(message)) {
            const suspiciousDomain =
                /https?:\/\/[^/\s]*@|https?:\/\/\d{1,3}(?:\.\d{1,3}){3}/i;

            if (suspiciousDomain.test(message)) {
                warnings.push(
                    "The link uses a format sometimes associated with deceptive destinations."
                );
            }
        }

        if (warnings.length >= 2) {
            showResult(
                "danger",
                "High caution: multiple warning signs",
                "This content contains several common scam indicators. Treat it as suspicious until independently verified.",
                warnings
            );
        } else if (warnings.length === 1) {
            showResult(
                "warning",
                "Caution: a warning sign was found",
                "This content includes a potential scam indicator. Verify the sender independently.",
                warnings
            );
        } else {
            showResult(
                "success",
                "No common warning signs detected",
                "Our basic rules did not detect a listed warning sign. This does NOT mean the content is genuine or safe.",
                [
                    "Never share OTPs, PINs, or passwords.",
                    "Verify financial requests through official channels.",
                    "Avoid unexpected links and attachments."
                ]
            );
        }
    });
}


// Display analyzer result
function showResult(level, heading, description, warnings) {
    analysisResult.className = "result-box " + level;

    const title = document.createElement("h3");
    title.textContent = heading;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    analysisResult.replaceChildren(title, paragraph);

    if (warnings.length > 0) {
        const list = document.createElement("ul");

        warnings.forEach(function (warning) {
            const item = document.createElement("li");
            item.textContent = warning;
            list.appendChild(item);
        });

        analysisResult.appendChild(list);
    }

    analysisResult.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// ======================================
// 2. SCAM ALERT CENTER
// ======================================

const scamAlerts = [
    {
        title: "Fake Bank KYC Messages",
        category: "Banking Fraud",
        description: "Fraudsters send fake messages claiming that your bank account will be blocked unless you update your KYC details.",
        safety: "Never open unknown KYC links. Contact your bank through its official website or app."
    },
    {
        title: "UPI Payment Scams",
        category: "UPI Fraud",
        description: "Scammers may send fake payment screenshots or trick people into approving UPI collect requests.",
        safety: "Never enter your UPI PIN to receive money. Check transactions in your own banking app."
    },
    {
        title: "Fraudulent Phone Calls",
        category: "Phone Scam",
        description: "Scammers impersonate bank officials, police officers, or government employees to threaten or deceive people.",
        safety: "Do not share OTPs, PINs, or banking details. Disconnect and verify independently."
    },
    {
        title: "Fake Job and Lottery Offers",
        category: "Online Fraud",
        description: "Fraudsters promise prizes, jobs, or rewards and then demand registration or processing fees.",
        safety: "Verify the organization and never pay unexpected fees to claim a prize."
    },
    {
        title: "Remote Access App Scams",
        category: "Digital Fraud",
        description: "Scammers ask victims to install remote-access applications or share their screens.",
        safety: "Never install remote-access apps at the request of an unknown caller."
    }
];

function loadScamAlerts() {
    const alertContainer = document.getElementById("scamAlerts");

    if (!alertContainer) return;

    alertContainer.innerHTML = scamAlerts.map(function (alert) {
        return `
            <div class="alert-card">
                <span class="alert-category">
                    ${escapeHTML(alert.category)}
                </span>
                <h3>${escapeHTML(alert.title)}</h3>
                <p>${escapeHTML(alert.description)}</p>
                <p><strong>Safety Tip:</strong>
                ${escapeHTML(alert.safety)}</p>
            </div>
        `;
    }).join("");
}


// Escape text before inserting alert content into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}


// ======================================
// 3. INCIDENT REPORT FORM
// ======================================

const reportForm = document.getElementById("reportForm");
const reportResult = document.getElementById("reportResult");

if (reportForm) {
    reportForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const type = document.getElementById("reportType").value;
        const date = document.getElementById("reportDate").value;
        const details = document.getElementById("reportDetails").value.trim();

        if (!type || !date || !details) {
            reportResult.textContent = "Please fill in all fields.";
            return;
        }

        const submitButton = reportForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        incident_type: type,
                        incident_date: date,
                        description: details
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Report submission failed.");
            }

            reportResult.className = "result-box success";
            reportResult.replaceChildren();

            const heading = document.createElement("h3");
            heading.textContent = "Report saved successfully!";

            const paragraph = document.createElement("p");
            paragraph.textContent =
                "Your incident summary has been saved in the Scam Shield database. You can also submit an official complaint.";

            const portalLink = document.createElement("a");
            portalLink.href = "https://cybercrime.gov.in/";
            portalLink.target = "_blank";
            portalLink.rel = "noopener noreferrer";
            portalLink.className = "primary-button";
            portalLink.textContent = "Open Official Cybercrime Portal ↗";

            reportResult.append(heading, paragraph, portalLink);

            reportForm.reset();
            setDefaultDate();

        } catch (error) {
            reportResult.className = "result-box warning";
            reportResult.textContent =
                "Error saving report: " + error.message;

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Report";
            }
        }

        reportResult.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    });
}


// ======================================
// 4. SET DEFAULT INCIDENT DATE
// ======================================

function setDefaultDate() {
    const reportDate = document.getElementById("reportDate");

    if (!reportDate) return;

    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    reportDate.max = localDate;

    if (!reportDate.value) {
        reportDate.value = localDate;
    }
}


// ======================================
// 5. START APPLICATION
// ======================================

loadScamAlerts();
setDefaultDate();
