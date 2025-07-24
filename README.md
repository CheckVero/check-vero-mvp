# ✅ Check Vero – The AI-native Trust Layer for Digital Communication

![Built on ICP](https://img.shields.io/badge/Built_on-ICP-blueviolet)
![Hackathon Submission](https://img.shields.io/badge/DoraHacks_x_DFINITY-orange)
![Live on Fleek](https://img.shields.io/badge/Live_on-Fleek-brightgreen)

**Check Vero** is a decentralized verification protocol for real-time communication – starting with phone calls.

In a world of AI voice scams and deepfake messages, Check Vero verifies the **signal**, not just the sender.

---

## 🔍 Use Case

– Real-time caller verification (banks, governments, platforms)  
– AI-assisted risk & intent analysis  
– Signal-staking via the $VERO token  
– Originally submitted as a 15K DFINITY grant proposal (not awarded)  
– Now reapplying for 25K with improved MVP and real-world validation  
– Pilot commitment secured with Dutch bank (Australia branch): customers will receive email invitation to test the app  
– Public subsidy in preparation via awareness programs in both the Netherlands 🇳🇱 and Australia 🇦🇺

---

## 🧱 Built on Internet Computer (ICP)

– ✅ Modular canister-based architecture  
– ✅ Plug Wallet integration (used in early PoC)  
– ✅ Oisy Wallet integration planned for production  
– ✅ Internet Identity compatible  
– ✅ Fully open-source and trustless by design

---

## 📦 MVP Features (Hackathon Scope)

| Feature                        | Status         | Notes                                                                 |
|-------------------------------|----------------|-----------------------------------------------------------------------|
| Caller ID Canister (Motoko)   | ✅ Previously tested | Built & tested in early version; re-deploying in Q3               |
| Plug Wallet Auth              | 🧪 Demo ready   | Functional in mockup (PoC); production version will use Oisy Wallet |
| Shield UI (Web)               | 🧪 Designed     | Front-end mockup complete (v0.1)                                     |
| Reputation Logic              | 🔜 Planned      | Trust scoring based on signal context & caller type                 |
| DAO Architecture (v0.1)       | ✅ Documented   | Legal & governance structure defined (see PDF)                       |
| AI-Intent Scoring (Demo)      | 🔜 Planned      | Early-phase intent detection concept via metadata                    |

---

## 📜 Background

A previous DFINITY grant application (15K tier) was submitted with a full milestone plan.  
Although not selected (likely due to tier fit), we’ve since refined the project and are reapplying for the **25K tier** with a sharper technical focus.

This submission represents a mission-driven prototype — combining:

– Clear technical architecture  
– A working brand + ecosystem vision  
– Real-world pilot alignment

---

## 📽️ Demo

🎬 [Watch our 1-min explainer video](https://youtu.be/t5GM6bhTZuA)

---

## 🧪 Tech Stack

– Motoko / ICP Canisters  
– Plug Wallet (early PoC)  
– Oisy Wallet (planned)  
– Web (Shield UI)  
– Figma (UX/UI)  
– GitHub Pages / Webhash (frontend)

---

## 🌐 Links

– Mission: [https://checkvero.org](https://checkvero.org)  
– Business Tools: [https://checkvero.com](https://checkvero.com)

---

## 🔗 Live Demo

🎥 [Try the live ICP demo here](https://www.checkvero.com)

This project runs live on ICP with a functional demo for verifying trusted caller signals.

---

## 👥 Team

- **Marceo** – Founder, Product Lead  
- **Julia** – Strategic & Legal Advisor  
📬 Reach us at: [hello@checkvero.org](mailto:hello@checkvero.org)

---

## 🧪 Local Dev

You can run this project locally with the ICP SDK:

```bash
dfx start --background
dfx deploy

---

## ✅ ICP Demo MVP (Hackathon Submission)

This is a minimal Motoko-based demo of the Check Vero verification system.

### 📦 Features

- Real-time phone number verification via Motoko backend  
- Hardcoded responses for demo numbers  
- Simple HTML/JS frontend  
- ICP-native: deployable via Fleek or DFX

---

### 📱 Test Numbers

| Phone Number     | Result            |
|------------------|-------------------|
| `+31612345678`   | ✅ Acme Bank       |
| `+61298765432`   | ✅ Gov Australia   |
| _Any other_      | ❌ Not registered |

---

### 🚀 Deploy Instructions

To deploy this MVP via [Fleek](https://fleek.xyz):

1. Upload this repo to GitHub (or fork it)
2. Connect the repo to Fleek
3. Use the following deploy settings:

| Setting            | Value                    |
|--------------------|--------------------------|
| **Branch**         | `main`                   |
| **Framework**      | `Other`                  |
| **Publish directory** | `src/check_vero_frontend` |
| **Build command**  | *(leave empty)*          |

---

Once deployed, your dApp will run live on ICP.

---
