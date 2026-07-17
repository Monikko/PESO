# Project PESO - Public Employment Service Office

A modern web application for managing employment applicant registrations built with React and Vite.

## Features

- 11-step applicant registration form
- Real-time form validation
- Data persistence with Supabase
- Photo upload functionality
- Progress tracking with visual stepper
- Responsive design

## Tech Stack

- **Frontend**: React 19.2.7
- **Build Tool**: Vite 8.1.1
- **Database**: Supabase
- **Linter**: Oxlint
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Project PESO"
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a `.env` file with your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run Oxlint

## Project Structure

```
Project PESO/
├── src/
│   ├── applicants/       # Form components (Step1-Step11)
│   ├── admin/            # Admin dashboard components
│   ├── assets/           # Images and static files
│   ├── data/             # JSON data files (locations, occupations, etc.)
│   ├── hooks/            # Custom React hooks (useSupabase)
│   ├── lib/              # Utility functions and Supabase client
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Public assets
├── supabase-schema.sql   # Database schema
├── SUPABASE_SETUP.md     # Detailed Supabase setup guide
└── .env.example          # Environment variables template
```

## Form Steps

1. **Personal Information** - Basic applicant details
2. **Employment Status** - Current employment situation
3. **Applicant Classification** - 4Ps beneficiary status
4. **Job Preferences** - Desired occupation and location
5. **Language/Dialects** - Language proficiency
6. **Educational Background** - Education history
7. **Certification/Training** - Vocational courses
8. **Eligibility/License** - Professional licenses
9. **Work Experience** - Employment history
10. **Other Skills** - Additional skills and competencies
11. **Registration Details** - Final submission

## Database Integration

This project uses Supabase for:
- **Data Storage**: All applicant information
- **File Storage**: Photo uploads
- **Real-time Updates**: Live data synchronization
- **Row Level Security**: Data protection

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

## Development

### Adding New Features

The project follows a modular structure:
- Add new form steps in `src/applicants/`
- Create admin features in `src/admin/`
- Add database operations in `src/hooks/useSupabase.js`
- Update schema in `supabase-schema.sql`

### Custom Hooks

- `useSupabase()` - Database operations
  - `submitApplicant(data)`
  - `getApplicants()`
  - `updateApplicant(id, updates)`
  - `deleteApplicant(id)`
  - `uploadFile(file, bucket)`

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Set environment variables on your hosting platform

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Linting

This project uses Oxlint for fast JavaScript linting. Configuration is in `.oxlintrc.json`.

To expand the Oxlint configuration or integrate TypeScript, check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).

## License

[Your License Here]

## Support

For issues or questions, please open an issue on the repository.
