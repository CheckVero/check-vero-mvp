# ✅ Check Vero — The AI-Native Trust Layer for Digital Communication

**Check Vero** provides cryptographic verification for real-time communication — starting with **phone calls** — so banks, governments and platforms can prove authenticity **before** a conversation begins. Built on the **Internet Computer (ICP)** with sub-second verification and tamper-evident audit logs.

* **Website (live MVP):** [https://checkvero.org](https://checkvero.org)
* **Contact:** [hello@checkvero.org](mailto:hello@checkvero.org)

---

## 🚥 Status — September 2025

* **MVP live:** registry-based phone-number verification with on-chain audit proofs (ICP).
* **Pilot-ready:** web app + API/webhook pattern for CPaaS/carriers (Twilio/KPN-style).
* **Wallet:** **Oisy Wallet** for auth/identity (Plug was PoC only).
* **Privacy-first:** no call content, no PII — **E.164 → SHA-256 + pepper**, K-anonymity, Argon2id for salt management.
* **Compliance copy:** Designed to meet **SOC 2 Type II controls**. **Targeting 99.9% uptime**.

---

## 🗺️ Product Roadmap (September 2025)

**Q1 2025 — Completed · Core Platform Foundation**

* Core phone-number verification, org management & RBAC
* SHA-256 + pepper cryptographic security
* Comprehensive audit logging, rate limiting & abuse prevention

**Q2 2025 — Completed · Security & Privacy Enhancement**

* Argon2id (per-tenant salts), K-anonymity & number masking
* Salt rotation capabilities, SOC 2 Type II controls (design)
* ZK scaffolding (disabled by default)

**Q3 2025 — In Progress · SVC & Enterprise Integration**

* SVC backend with SIP integration
* Twilio/KPN-style webhooks; STIR/SHAKEN-complementary positioning
* Enhanced dashboard + bulk verification endpoints

**Q4 2025 — Planned · AI & Community Features**

* ML-based fraud detection models
* Community scam reporting with **ICP** rewards
* Advanced risk/behavioral scoring
* **VERO** token for governance & staking
* C2PA integration for content authenticity

**2026+ — Future · Enterprise Scale & Compliance**

* ZK proofs, multi-region/data-residency
* Deeper IdP integrations & custom compliance reporting
* Telecom integrations at scale

---

## 🧩 What We Verify

* **Phone calls:** “Verified by Check Vero” signal + on-chain proof
* **Next:** email, SMS, and AI-agent output (same verification pattern)

We verify the **signal**, not just the sender — a pragmatic defense against spoofing & AI-voice scams.

---

## 🔌 Integration Pattern (Carrier/CPaaS)

**SIP header hint**

```
X-CheckVero-Hint: key_id=..., ts=..., nonce=..., sig=...
```

**Webhook (example)**

```json
// POST /webhook/check
{
  "e164": "+31201234567",
  "ts": 1726501000,
  "nonce": "b3d1...",
  "sig": "ed25519:..."
}
```

**Response**

```json
{ "status": "verified", "trace_id": "cv_01H..." }
```

**Operational SLOs**

* Latency targets: **p50 < 200ms**, **p95 < 300ms**, **p99 < 400ms**
* Rate limiting: configurable defaults (**5 rps, burst 10**) with HTTP **429 backoff**

**Compliance guardrails (global wording)**

* *Designed to meet SOC 2 Type II controls.*
* *Targeting 99.9% uptime.*
* *Raw numbers are never stored (E.164 → SHA-256 + pepper).*
* *Rate limiting: configurable defaults (e.g., 5 rps, burst 10).*

---

## 🧱 Built on ICP (Tech)

* Canister architecture (Motoko), immutable audit logs
* Oisy Wallet (production), Internet Identity compatible
* Low-latency queries; no external DB required

> **Candid UI (how to open):**

```bash
# after deploying to mainnet:
CANISTER=$(dfx canister --network ic id <backend-name>)
echo "https://a4gq6-oaaaa-aaaab-qaa4q-cai.icp0.io/?id=$CANISTER"
echo "https://a4gq6-oaaaa-aaaab-qaa4q-cai.ic0.app/?id=$CANISTER"
```

*(Avoid hard-coding IDs; they change on redeploys.)*

---

## 🧪 MVP Feature Matrix

| Feature                     | Status           | Notes                                       |
| --------------------------- | ---------------- | ------------------------------------------- |
| Registry phone verification | **Live**         | Verified/Unverified + on-chain audit        |
| SVC (SIP) backend           | **In progress**  | CPaaS/webhook pattern; STIR/SHAKEN-friendly |
| Shield UI (web)             | **Live (MVP)**   | Public site + docs at checkvero.org         |
| Oisy Wallet auth            | **Live**         | Production wallet; replaces Plug PoC        |
| Risk & intent scoring (AI)  | **Planned (Q4)** | Models + behavior analysis                  |
| DAO/governance (v0.1)       | **Documented**   | Token governance framework (Q4)             |

---

## 💠 Token Model (Short)

* **\$VERO utility/governance**

  * **Stake for access** (tiers: Solo 1k · SME 5k · Enterprise 25k+ VERO)
  * **Fiat subscriptions → market-buy VERO → split:** **60% burn / 40% Foundation** (ops, security, ecosystem)
  * **User rewards are paid in ICP** (for verified scam reports)
  * VERO is **not** a payout token

* **TGE (target): Q4 2025**

  * Seed **\$0.04** · Public **\$0.10**
  * Vesting (investors): **15% @TGE + 12m linear**

*(Full details in Token Allocation & SAFT.)*

---

## 📽️ Media

Some embedded videos show an older UI. The current production flow is live at **checkvero.org**.

* Pitch / Demo / Explainer: **\[https://youtu.be/t5GM6bhTZuA?si=XMPmQIabUKDSa-ig]**

---

## 🛠️ Dev Quickstart

**Local**

```bash
dfx start --background
dfx deploy
```

**Fleek (static frontend)**

```
Branch: main
Framework: Other
Publish directory: src/check_vero_frontend
Build command: (leave empty)
```

---

## 🔗 Links

* **Website (MVP & docs):** [https://checkvero.org](https://checkvero.org)
* **GitHub org/repo:** \[add your repo link]
* **Investor Pack:** \[link to release or folder]

---

## 👥 Team & Contact

* **Marcel van den Berg** — Founder, Product
* **Julia Ninck Blok** — Strategic & Legal Advisor
* General: **[hello@checkvero.org](mailto:hello@checkvero.org)**
* Partnerships (gov/bank/telco/CPaaS): **[partners@checkvero.org](mailto:partners@checkvero.org)**

---

## ⚖️ Legal

* No U.S. persons / OFAC-sanctioned entities (token docs).
* This repository describes a verification protocol and utility/governance token. Nothing here is investment advice or a public offering.

---

## 🤝 Contributing

Issues and PRs welcome. For security disclosures: **[security@checkvero.org](mailto:security@checkvero.org)**.

---

**Check Vero runs on-chain, open & unstoppable — part of the DFINITY ecosystem.**
