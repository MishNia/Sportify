# Backend Development Documentation

## Project Overview
This project is focused on building the backend for Sportify, a platform to connect individuals through sports events and activities. We are using **Go** for backend development and **PostgreSQL** as the database. The backend will manage various features such as user profiles, event management, and communication between users.

## Project timeline and Progress
You can track the status on our project page: [GitHub Project Board]( https://github.com/users/MishNia/projects/1/views/1).

---

## Folder Structure

```
backend/
    bin/                # Contains files required by air for live reloading
    cmd/
        api/                # All API implementation code
        migrate/            # Database migrations

    internal/
        db/                 # Database connection and configurations
        env/                # Environment configuration management
        store/              # CRUD and other DB operations

    Makefile               # Handles migration and other commands
    .envrc                 # Environment variable loader for direnv
```

### Folder Descriptions

1. **bin/**: This folder contains files necessary for **air** to perform its live reloading functionality.

2. **cmd/**: This folder contains the core application code. Subfolders include:
   - `api/`: Implements the API endpoints.
   - `migrate/`: Contains database migration scripts.

3. **internal/**: Houses internal application logic that is isolated from the external API. Subfolders include:
   - `db/`: Manages the database connection and related tasks.
   - `env/`: Manages loading and handling environment variables.
   - `store/`: Implements CRUD operations and other database queries.

---

## Tools and Packages

Here are the primary tools and packages we use to streamline development and maintain code quality:

1. **go-chi**  
   - **Description:** Lightweight and idiomatic HTTP router for Go.
   - **Purpose:** Used for routing and middleware management.
   - **URL:** [go-chi/chi](https://github.com/go-chi/chi)

2. **air**  
   - **Description:** Live server reloading tool.
   - **Purpose:** Automatically reloads the server when changes are detected.
   - **URL:** [air](https://github.com/air-verse/air)

3. **go-validator**  
   - **Description:** A powerful request validation package for Go.
   - **Purpose:** Used to validate incoming request fields.
   - **URL:** [go-playground/validator](https://github.com/go-playground/validator)

4. **direnv**  
   - **Description:** Environment variable manager that loads variables from `.envrc` files.
   - **Purpose:** Simplifies the loading and handling of environment variables.
   - **URL:** [direnv](https://direnv.net/)

5. **TablePlus**  
   - **Description:** Database management tool.
   - **Purpose:** Allows easy creation of tables and insertion of dummy data for development.
   - **URL:** [TablePlus](https://tableplus.com/)

6. **Docker**  
   - **Description:** Containerization platform.
   - **Purpose:** Used to run PostgreSQL locally during development.

---

## Environment Setup

### 1. Install Required Tools
Ensure the following are installed on your machine:
- [Go](https://golang.org/)
- [Docker](https://www.docker.com/)
- [direnv](https://direnv.net/)
- [TablePlus](https://tableplus.com/)

### 2. Set Up `.envrc` File
Create an `.envrc` file in the root directory with the necessary environment variables. Example:
```env
POSTGRES_USER=your_db_username
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_database_name
APP_PORT=8080
```
Run `direnv allow` to load the environment variables automatically.

### 3. Start Docker Container
Run the following command to start the PostgreSQL container:
```sh
docker compose up --build
```

### 4. Install Go Dependencies
Use the following command to install project dependencies:
```sh
go mod tidy
```

### 5. Run the Application
For live reloading, use the **air** tool:
```sh
air
```
If you don't have air installed, use:
```sh
go run cmd/api/main.go
```

---

## Makefile Commands

The `Makefile` provides common commands to simplify development tasks.

- **Create Migrations:**
  ```sh
  make migration some_file_name
  ```

- **Run Migrations:**
  ```sh
  make migrate-up
  ```

- **Rollback Migrations:**
  ```sh
  make migrate-down
  ```

Feel free to add more commands as needed.

---

## Development Workflow

1. Clone the repository and set up your environment using the steps outlined above.
2. Use **air** for live reloading or **go run** for manual server restarts.
3. Implement features in the appropriate folders under `internal/` and `cmd/`.
4. Validate API requests using **go-validator**.
5. Connect to the database using **TablePlus** to inspect and manage data.
6. Use **Makefile** commands to handle database migrations.

---

## Contribution Guidelines

1. **Coding Standards:** Follow Go's idiomatic best practices.
2. **Branching:** Use feature branches for new work.
3. **Commit Messages:** Write clear, concise commit messages.
4. **Pull Requests:** Ensure all pull requests are reviewed before merging.
5. **Testing:** Write unit tests for all new features and bug fixes.

---

## Contact & Support
If you have any questions or run into issues, please create an issue and track the status on our GitHub project page: [GitHub Project Board]( https://github.com/users/MishNia/projects/1/views/1).

Happy coding!
