# Dibrownie Virtual Assistant - Project Documentation

## Overview

The **Dibrownie Virtual Assistant** is a web application designed to automate customer interactions for the Dibrownie business. It allows the bot to initiate conversations, handle customer responses, process orders, and provide support. The application includes features such as viewing conversation histories, generating interaction reports, and analyzing customer engagement.

This documentation provides a comprehensive overview of the project's structure, explaining the purpose and functionality of each folder and file within the project.

---

## Table of Contents

- [Project Structure](#project-structure)
  - [Controllers](#controllers)
  - [Models](#models)
  - [Routes](#routes)
  - [Services](#services)
  - [Public](#public)
    - [HTML Files](#html-files)
    - [CSS Files](#css-files)
    - [JavaScript Files](#javascript-files)
    - [Assets](#assets)
- [Configuration Files](#configuration-files)
- [Server Entry Point](#server-entry-point)
- [Database](#database)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## Project Structure

The project follows a standard Node.js and Express.js architecture, organized into several key directories and files.

### Controllers

**Directory:** `controllers/`

This directory contains controller files responsible for handling incoming HTTP requests, interacting with models and services, and sending responses back to the client.

- **`MessageController.js`**

  Handles operations related to messages, such as receiving webhook events, saving messages to the database, and processing message-related requests.

### Models

**Directory:** `models/`

This directory contains Sequelize models that represent the database tables.

- **`Message.js`**

  Defines the `Message` model, which represents messages exchanged between the bot and clients. Fields include:

  - `id`: Primary key.
  - `tipo`: Type of message (`sent` or `received`).
  - `conteudo`: Content of the message.
  - `quem_enviou`: Sender's identifier.
  - `quem_recebeu`: Receiver's identifier.
  - `data`: Timestamp of the message.
  - `profile_whats_client`: Client's WhatsApp profile information.

### Routes

**Directory:** `routes/`

This directory contains route definitions that map URLs to controller functions.

- **`messageRoutes.js`**

  Defines routes for handling messages, including receiving webhooks and fetching message data.

- **`report.js`**

  Contains API endpoints related to generating reports and retrieving conversation data. Includes routes like `/api/reports/data` and `/api/reports/conversations`.

### Services

**Directory:** `services/`

This directory contains service files with business logic, interacting with models and performing computations.

- **`reportService.js`**

  Contains functions for generating statistics and retrieving detailed conversation data for reports. Functions include:

  - `getBotStartedConversations()`
  - `getClientsWhoReplied()`
  - `getTotalOrders()`
  - `getClientsWhoRefused()`
  - `getClientsWhoClickedSupport()`
  - `getUnprocessedOrders()`
  - Detailed versions that return conversation details, such as `getBotStartedConversationsDetails()`, etc.

### Public

**Directory:** `public/`

This directory contains all the static assets served to the client, including HTML, CSS, JavaScript files, and other assets like images.

#### HTML Files

- **`index.html`**

  The main landing page displaying contact cards for each conversation. It includes a search bar for filtering contacts and links to other pages.

- **`reports.html`**

  The reports page displaying interactive charts of interactions. Users can filter data and view detailed conversations by clicking on chart elements.

- **`chat.html`**

  The chat view page, displaying the conversation between the bot and a specific client.

- **`login.html`**

  The login page for administrators to access the system.

#### CSS Files

- **`styles.css`**

  The main stylesheet for the application, styling the index page and shared components like headers and footers.

- **`report.css`**

  Styles specific to the reports page, including charts and conversation cards.

#### JavaScript Files

- **`script.js`**

  Contains client-side logic for the index page, handling contact card display, search functionality, and navigation to the chat view.

- **`reports.js`**

  Manages client-side logic for the reports page, including fetching report data, rendering charts using Chart.js, handling date filters, and displaying contact cards when interacting with the chart.

- **`chat.js`**

  Manages the chat view, loading and displaying messages between the bot and a specific client.

- **`login.js`**

  Handles login functionality for administrators.

#### Assets

- **Images**

  - **`home_icon.png`**

    An icon used for navigation to the home page.

  - **`icone_grafico.png`**

    An icon representing graphs or reports, used in the header.

---

## Configuration Files

- **`.env`**

  Contains environment variables for configuring the application, such as database connection strings and API keys. **Note:** This file should be kept secure and not committed to version control.

- **`package.json`**

  Contains project metadata, scripts, and dependencies.

- **`package-lock.json`**

  Locks the versions of dependencies installed, ensuring consistent installations across environments.

---

## Server Entry Point

- **`server.js`**

  The main entry point of the application. It sets up the Express.js server, connects to the database, configures middleware, and registers routes.

---

## Database

The application uses a **PostgreSQL** database to store messages and other data.

- **Sequelize ORM**

  Used for interacting with the database in an object-relational mapping fashion.

- **Models**

  Defined in the `models/` directory, representing the database tables.

---

## Installation and Setup

To set up the project locally, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/dibrownie-virtual-assistant.git
   cd dibrownie-virtual-assistant
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   - Create a `.env` file in the root directory.
   - Add the necessary environment variables, such as database connection details.

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/dibrownie_db
   ```

4. **Set Up the Database**

   - Ensure PostgreSQL is installed and running.
   - Create the database and run migrations if necessary.

5. **Start the Server**

   ```bash
   npm start
   ```

6. **Access the Application**

   - Open your browser and navigate to `http://localhost:3000` to access the application.

---

## Usage

- **Index Page (`/`)**

  Displays a grid of contact cards representing conversations with clients. Allows searching and navigating to individual chat views.

- **Chat View (`/chat?contato=...`)**

  Displays the conversation between the bot and a specific client.

- **Reports Page (`/reports.html`)**

  Shows interactive charts summarizing interactions. Users can filter data by time ranges and click on chart elements to view detailed conversations represented as contact cards.

- **Login Page (`/login.html`)**

  Allows administrators to log in to the system.

---

## Dependencies

Key dependencies used in the project:

- **Express.js**

  Web framework for Node.js, used to build the server and handle routing.

- **Sequelize**

  Promise-based Node.js ORM for PostgreSQL, used for database interactions.

- **PostgreSQL**

  Relational database used to store messages and other data.

- **Chart.js**

  JavaScript library for creating charts, used on the reports page.

- **Body-parser**

  Middleware for parsing incoming request bodies.

- **Nodemon**

  Development tool that automatically restarts the server when file changes are detected.

---

## Contributing

Contributions to the project are welcome. Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add new feature"
   ```

4. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.


---

## Acknowledgments

- **OpenAI's ChatGPT**

  Assistance in generating code and documentation.
