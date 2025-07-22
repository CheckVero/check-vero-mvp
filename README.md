# ✅ Check Vero – The AI-native Trust Layer for Digital Communication

**Check Vero** is a decentralized verification protocol for real-time communication – starting with phone calls.

In a world of AI voice scams and deepfake messages, Check Vero verifies the **signal**, not just the sender.

---

## 🔍 Use Case

– Real-time caller verification (banks, governments, platforms)  
– AI-assisted risk & intent analysis  
– Signal-staking via the $VERO token  
– Evolved from a grant-backed MVP proposal  
– Pilot traction with a Dutch bank (Australia)

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

⚙️ Dev Setup Notes
This MVP was manually structured using the DFINITY SDK (dfx) via terminal setup — no GUI templates or prebuilt generators were used.
Each canister was initialized and configured with:

dfx.json defined by hand

Custom backend actor (main.mo)

Frontend placeholder manually created (index.html)

Local testing done via dfx start, dfx deploy, and dfx canister call

This approach ensures full ownership of the build process and lays the foundation for deeper canister logic in Q3.

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
```

## 📄 License  
MIT © 2025 Check Vero  
Feel free to fork and build on this — attribution appreciated.

---

## 🤝 Contributing  
We welcome contributions from the community.  
Submit a PR or contact us via [hello@checkvero.org](mailto:hello@checkvero.org).  
We’re especially open to help with:

- 🔐 Auth & wallet integrations  
- 🤖 AI-agent logic & detection  
- 🧠 On-chain trust & scoring
