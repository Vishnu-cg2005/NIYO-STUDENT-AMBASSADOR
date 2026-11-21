# 🎓 Niyo Campus Student Ambassador Portal

A web-based portal designed to support the Niyo Campus Student Ambassador program. It provides a public program website, a student application flow, an ambassador portal, Admin task management, and an AI Growth Assistant powered by NVIDIA NIM.

The project aims to make it easier for students to learn about the program, apply to become ambassadors, and access relevant program information after approval.

> 🚧 **Project Status:** Under development. Features and integrations are subject to testing and verification.

---

## ✨ Key Features

### 🌐 Public Website
- 🏠 Homepage introducing the Niyo Campus Student Ambassador program
- 📘 Program information and “How It Works” section
- ❓ Frequently Asked Questions (FAQs)
- 📝 Application entry point for interested students
- 📱 Responsive layouts for desktop and mobile screens

### 🧑‍🎓 Student Application & Portal
- 🔐 Student login and application flow
- 📋 Application status view
- 👤 Ambassador profile section
- 📊 Student dashboard
- 🎯 Program tasks and campaign-related sections
- 💬 AI Growth Assistant for ambassador-related support

**Data accuracy:** Student-specific information should come from the application or program data source. If data is unavailable, the portal should show an honest empty state rather than invented referrals, earnings, task completion, or activity records.

### 🛠️ Admin Portal
- 🗂️ Admin area for managing the existing program tasks and workflows
- 📌 Task management for the ambassador program
- 🔒 Admin-only pages and controls

The existing Admin task-management workflow should be preserved when updating the student-facing portal or responsive layouts.

### 🤖 AI Growth Assistant
The portal includes an AI assistant integrated with the NVIDIA NIM API through a server-side endpoint.

The assistant is intended to help ambassadors with:
- 💡 Campus outreach ideas
- 🎤 Event and booth planning
- ✍️ Promotional copy and social media content
- ❓ Questions related to Niyo Campus and ambassador activities
- 🗃️ Feedback categorization

The assistant should use verified project information for Niyo-specific claims. If a product detail or program policy cannot be confirmed, it should say so instead of guessing.

---

## 🧰 Tech Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Development & Build Tool | Vite |
| UI Styling | CSS, Bootstrap |
| AI Integration | NVIDIA NIM API |
| Local API Integration | Vite server middleware |
| Production API Integration | Netlify Functions |
| Deployment | Netlify-compatible setup |

---

## 📁 Project Structure

The following shows the main application and AI-related files:

```text
.
├── netlify/
│   └── functions/
│       └── ai-assistant.mjs
├── server/
│   └── aiHandler.js
├── src/
│   ├── aiService.js
│   ├── AmbassadorPortal.jsx
│   ├── styles.css
│   └── ...
├── netlify.toml
├── vite.config.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- npm, which is included with Node.js
- NVIDIA NIM API credentials, if you want to test the AI features

### 2. Clone the Repository

```bash
git clone <your-github-repository-url>
cd <project-folder>
```

Replace the placeholders with your actual GitHub repository URL and project folder name.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add the required server-side NVIDIA NIM settings:

```env
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

Use your own API key. Do not copy real credentials into this README or commit them to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

### 6. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `NVIDIA_API_KEY` | Server-side NVIDIA NIM API key |
| `NVIDIA_MODEL` | NVIDIA NIM model identifier |
| `NVIDIA_BASE_URL` | NVIDIA NIM API base URL |

### 🔐 API Key Security
- Keep `NVIDIA_API_KEY` on the server side only.
- Do not prefix the key with `VITE_`.
- Do not expose it in frontend code, browser storage, or client-side requests.
- Do not commit `.env` to GitHub.
- Use `.env.example` with placeholder values to document required variables.

---

## 🌍 Deployment

The frontend can be deployed to a static hosting platform such as Netlify. The AI endpoint must also be deployed as a server-side function.

For production deployment:

1. Configure the required environment variables in the hosting platform.
2. Deploy the frontend and server-side function.
3. Test the deployed AI endpoint separately from the frontend build.
4. Verify the student application and Admin workflows in the deployed environment.
5. Confirm that Admin-only information is restricted to authorized Admin users.

> A successful frontend build does not by itself confirm that the production AI endpoint, authentication, database persistence, or cross-user application status updates are working.

---

## 🛡️ Privacy & Data Handling

- 🔑 Keep API credentials and secrets server-side.
- 🚫 Do not send passwords, session tokens, or unnecessary student personal information to the AI model.
- 👤 Restrict student-specific data to the correct student account.
- 🔒 Keep Admin-only pages, tasks, and information protected.
- 📭 Show honest empty states when real student data is unavailable.
- 🧾 Use verified information for Niyo-specific product claims and program policies.

---

## 🧪 Testing Checklist

Before considering a feature complete, test it in the target environment:

- [ ] Homepage and navigation
- [ ] Student login and application flow
- [ ] Application status and Admin approval flow
- [ ] Admin task-management workflow
- [ ] Student dashboard and empty states
- [ ] AI assistant responses and error handling
- [ ] AI API key is not exposed to the frontend
- [ ] Mobile layout and desktop layout
- [ ] Production build
- [ ] Deployed application and server-side endpoint

---

## 🗺️ Development Roadmap

- [ ] Complete and verify the student application and approval flow
- [ ] Ensure student-facing details use real data or clear empty states
- [ ] Verify the AI assistant against approved Niyo Campus information
- [ ] Complete mobile responsiveness while preserving the desktop design
- [ ] Test the deployed application and server-side integrations

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome. Before making changes, please preserve existing Admin workflows and avoid introducing unverified program details or fabricated student data.

---

## 📄 License

No license has been specified yet. Add a license file if the project is released for public reuse.
