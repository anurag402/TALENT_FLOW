# Talent Flow

Talent Flow is a mini hiring platform designed to streamline the recruitment process. It provides a comprehensive solution for managing job postings, tracking candidates, and conducting assessments.

####  Deploy link: https://talent-flow-one-azure.vercel.app/dashboard

## Features

*   **Dashboard:** A comprehensive overview of the hiring pipeline, including key metrics and recent activities.
*   **Job Management:** Create, edit, and archive job postings.
*   **Candidate Kanban Board:** A drag-and-drop interface to manage candidates through different hiring stages (Applied, Screening, Technical, Offer, Hired, Rejected).
*   **Assessments:** Create and manage assessments for specific job roles.
*   **AI-Powered Question Generation:** Automatically generate assessment questions based on the job title and description using Google's Gemini model.
*   **Candidate Timeline:** View a detailed timeline of a candidate's progress through the hiring process.
*   **Mock Backend:** The application uses Mirage.js to simulate a backend server, allowing for a fully functional frontend experience without a live backend.

## Architecture

The application is a single-page application (SPA) built with React and Vite. It follows a component-based architecture, with a clear separation of concerns between pages, components, and utilities.

*   **Frontend:**
    *   **Framework:** React with TypeScript
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS with shadcn/ui components
    *   **Routing:** React Router DOM
    *   **State Management:** Component state (`useState`, `useEffect`) and data fetching from the mock backend.
*   **Backend (Mock):**
    *   **Library:** Mirage.js
    *   **Data Persistence:** `localforage` is used to persist the mock database in the browser's IndexedDB.
    *   **API:** The mock server exposes a RESTful API for managing jobs, candidates, and assessments.
*   **AI Integration:**
    *   **Model:** Google gemini-2.0-flash
    *   **Library:** `langchain` and `@langchain/google-genai` are used to interact with the Gemini API.

## Technical Decisions

*   **Vite:** Vite was chosen for its fast development server and optimized build process.  
*   **TypeScript:** TypeScript is used to add static typing to the codebase, improving code quality and maintainability.
*   **Tailwind CSS & shadcn/ui:** This combination was chosen to enable rapid UI development with a consistent and modern design system.
*   **Mirage.js:** Mirage.js was used to create a mock backend, allowing for parallel development of the frontend and backend. It also enables the application to be used as a standalone demo without requiring a live backend. The mock backend contains all the endpoints listed in the requirements file. The controllers for the routes are listed in the Server.js file in the src/server folder.
*   **Drag-and-Drop:** The `@dnd-kit` library is used to implement the drag-and-drop functionality for the Kanban boards, providing a smooth and intuitive user experience. The HR can choose to reorder the jobs list (which is persisted in the DB), choose to update the stage of any candidate and can archive/unarchive jobs.
*   **AI-Powered Question Generation:** Google's Gemini model is used to automatically generate assessment questions. This feature is integrated using the `langchain` library, which simplifies the process of interacting with large language models. In the "Create Assessments" page you can choose to click a button called "GENERATE WITH AI" which allows you to write a prompt describing the role, no. of questions and the difficuly of questions to generate. The generated questions are automatically reflected in the UI. We used an output parser to convert the generated questions to json to show in the frontend and save in the local database. 

## Getting Started (development)

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or yarn) installed on your machine.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/anurag402/TALENT_FLOW.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Usage

1.  Start the development server
    ```sh
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173`

## Known Issues & Limitations

*   **Mock Backend:** The application currently uses a mock backend. To connect to a real backend, you will need to replace the Mirage.js implementation with actual API calls.
*   **Limited Features:** The application is a "mini" hiring platform and does not include all the features of a full-fledged applicant tracking system (ATS).
