# QuickShop

QuickShop is a Mobile-First Progressive Web App (PWA) designed to streamline the grocery shopping process. It addresses the common issue of forgetting regularly purchased items by utilizing a template mechanism (sets) and providing real-time synchronization of shopping lists between users.

## Project Description

QuickShop aims to provide a simple, intuitive tool that minimizes the time spent creating shopping lists and increases the completeness of purchases. The application features a minimalist design with a focus on usability.

**Key Features:**
*   **Real-time Synchronization:** Changes made by one user are instantly visible to others via WebSockets.
*   **Offline Support:** Works without an internet connection using Optimistic UI and local caching, syncing when connectivity is restored.
*   **Smart Lists:** Features like duplicate detection and drag-and-drop sorting.
*   **Templates (Sets):** Create reusable sets of products (e.g., "Breakfast", "Weekend") to quickly populate lists.
*   **History:** Archive and view past shopping trips.

## Tech Stack

**Frontend:**
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS 4
*   **Components:** Material Design principles
*   **Icons:** Lucide React

**State & Data:**
*   **State Management:** TanStack Query (with persistent cache)
*   **Routing:** TanStack Router
*   **Backend as a Service:** Supabase (PostgreSQL, Auth, Realtime)

**Development & Testing:**
*   **Language:** TypeScript
*   **Testing:** Vitest, React Testing Library
*   **Linting/Formatting:** Biome

## Getting Started Locally

To get a local copy of the project up and running, follow these steps.

### Prerequisites
*   Node.js (Latest LTS version recommended)
*   npm (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd quickshop
    ```

2.  **Navigate to the code directory:**
    The source code is located in the `code` folder.
    ```bash
    cd code
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `code` directory based on `.env.local.template` (if available). You will need to configure your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Available Scripts

All commands should be run from the `code` directory.

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the app for production (tsc + vite build).
*   `npm run preview`: Previews the production build locally.
*   `npm run test`: Runs unit tests using Vitest.
*   `npm run format`: Formats the codebase using Biome.
*   `npm run lint`: Runs the Biome linter.
*   `npm run check`: Runs Biome check (linting + formatting verification).

## Project Scope

The current MVP (Minimum Viable Product) focuses on the core shopping experience:

*   **Authentication:** Email/Password and Google OAuth.
*   **List Management:** Create, edit, archive, and share lists.
*   **Product Actions:** Add, edit, delete, mark as bought, and sort items.
*   **Sets:** Management of reusable product templates.
*   **History:** View shopping history for the last 365 days.

**Future Scope (Out of MVP):**
*   Barcode scanning
*   Recipe integration
*   Price comparison
*   Dark mode

## Project Status

**In Development**

The project is currently in the active development phase, focusing on implementing core features defined in the MVP.

## License

This project is licensed under [The Unlicense](LICENSE). See the [LICENSE](LICENSE) file for details.
