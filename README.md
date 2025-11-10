# Clarity

A minimalist, drag-and-drop todo application with categories and a beautiful, clean interface.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/khoshimov2018/clarity)

Clarity is a visually stunning, minimalist todo application designed for focus and organization. It allows users to manage their tasks within customizable categories. The core feature is an intuitive drag-and-drop interface for reordering tasks both within and between categories. The application features a serene, clean aesthetic with polished micro-interactions, seamless theme switching between light and dark modes, and a responsive layout that works beautifully across all devices. The goal is to provide a delightful and frictionless task management experience.

## ✨ Key Features

-   **Intuitive Drag & Drop:** Easily reorder tasks within and between categories.
-   **Task Categories:** Organize your tasks into customizable columns.
-   **Light & Dark Modes:** Seamlessly switch between themes for your comfort.
-   **Minimalist UI:** A clean, beautiful, and distraction-free interface.
-   **Responsive Design:** Flawless experience on desktop, tablet, and mobile.
-   **Persistent Storage:** Your tasks are saved automatically using Cloudflare Durable Objects.
-   **Built for Performance:** Fast and fluid interactions powered by a modern stack.

## 🚀 Technology Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
-   **State Management:** Zustand
-   **Drag & Drop:** @dnd-kit
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Tooling:** Bun, Wrangler CLI

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for deployment.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/clarity_todo_app.git
    cd clarity_todo_app
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running Locally

To start the development server, which includes both the Vite frontend and the Hono backend worker, run:

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

-   `src/`: Contains the React frontend application code.
    -   `pages/`: Main application views.
    -   `components/`: Reusable UI components.
    -   `lib/`: Utility functions and API client.
    -   `hooks/`: Custom React hooks.
-   `worker/`: Contains the Hono backend code running on Cloudflare Workers.
    -   `index.ts`: The worker entrypoint.
    -   `user-routes.ts`: API route definitions.
    -   `entities.ts`: Durable Object entity definitions.
-   `shared/`: TypeScript types shared between the frontend and backend.

## 🔧 Development

### Frontend

The frontend is a standard Vite + React application. Modify files within the `src` directory. Changes will be hot-reloaded by the development server.

### Backend

The backend is built with Hono and runs on Cloudflare Workers. To add or modify API endpoints, edit the `worker/user-routes.ts` file. The application uses a single Durable Object class (`GlobalDurableObject`) to provide persistent storage for different data entities.

## ☁️ Deployment

This project is configured for one-click deployment to Cloudflare Workers.

1.  **Login to Wrangler:**
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    ```bash
    bun deploy
    ```

This command will build the frontend application, bundle the worker code, and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/khoshimov2018/clarity)

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.