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
