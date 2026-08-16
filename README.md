# vault-health-care

Build a modern, minimal demo app called HealthVault — a secure digital health record vault.

Goal: Allow hospitals to upload patient medical records (PDFs, prescriptions, reports) and patients to view, manage, and share them securely from anywhere.

Main Screens:

Login / Signup (with role selection: Patient, Hospital, Doctor)

Dashboard:

For patients: list of uploaded records (cards showing date, type, hospital name).

For hospitals: option to upload a new record for a patient.

Record Upload Page: hospital enters patient ID, record title, description, and uploads a file.

Record Detail Page: shows file preview, metadata, and “Share” button.

Share Page: generates a temporary share link or QR code for a doctor.

Design Style: Clean, modern, hospital-grade interface — white background, soft blues and greens, rounded cards, subtle shadows, simple icons. Use a top navigation bar and responsive layout.

Bonus Features:

Search bar to filter records

Simple notification toast after upload/share

Light mode only

Focus on creating a functional prototype, not production-ready backend — just use local mock data or JSON placeholders. system architecture is also attached

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00f031af-1345-40a7-89d0-d20bc6cfa2c1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## DevOps and deployment

### Local Docker

Build the production container image:

```sh
docker build -t vault-health .
```

Run it locally:

```sh
docker run -d -p 8080:80 --name vault-health vault-health
```

### Docker Compose

This project also supports a simple local compose deployment using the same production Docker image:

```sh
docker compose up --build -d
```

The Compose service maps port `8080` to the Nginx container port `80` and keeps the deployment focused on the frontend image only. It does not create a separate PostgreSQL service because Supabase is used for persistence and auth.

### Jenkins CI/CD

The repository is intended to run through a standard Jenkins pipeline:

```text
GitHub
  ↓
Jenkins
  ↓
Checkout
  ↓
Install
  ↓
Test
  ↓
Build
  ↓
Docker Build
  ↓
Deploy
  ↓
Health Verification
```

The Jenkins agent needs:

- Node.js
- npm
- Docker
- Git
- curl

The agent must also have permission to run Docker commands for image build and container lifecycle management.

The pipeline should use Jenkins environment variables or Jenkins credentials for the public browser config values required by Vite:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

These are public frontend values only. They should be configured in Jenkins and not committed to source control or placed in the repository. Never use a Supabase service-role key in the frontend or in the Jenkins pipeline.

### GitHub webhook setup

A Jenkins job can be triggered by GitHub in either of these ways:

- GitHub webhook trigger on push or pull request events
- SCM polling from the GitHub repository

For a straightforward CI/CD workflow, GitHub webhook trigger is preferred because it responds immediately to code changes and keeps deployment automation more timely.

The Jenkins project should be configured to check out the repository, run `npm ci`, `npm test`, `npm run build`, build the Docker image, deploy it, and confirm the app responds over HTTP on port `8080`.

## Security notes

- `.env` remains ignored and must not be committed.
- Supabase service-role keys are never used in the frontend or Docker build.
- Secrets are managed outside the repository, typically through Jenkins credentials or a trusted deployment environment.
- The Docker build does not copy `.env` into the image.
