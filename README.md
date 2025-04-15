# Feedhub - Feedback Management System

Feedhub is a modern web application designed to streamline the feedback collection and management process. It provides organizations with a powerful tool to gather, analyze, and act upon user feedback effectively. Built with a focus on user experience and data management, Feedhub helps businesses make data-driven decisions based on customer insights.

## Project Purpose

Feedhub aims to:
- Simplify the feedback collection process
- Provide real-time feedback management
- Enable data-driven decision making
- Offer comprehensive feedback analytics
- Facilitate team collaboration on feedback items

## Features

- **Add Feedback**: Users can add feedback with multiple options and detailed descriptions.
- **Update Feedback**: Existing feedback can be edited and updated.
- **Delete Feedback**: Unnecessary feedback entries can be removed.
- **Feedback Listing**: Feedback is displayed in a sortable and paginated table.
- **CSV Export**: Export feedback to a CSV file.
- **Firebase Integration**: Firestore is used to store and manage feedback data.

## Tech Stack

- **Frontend**:
  - React (with Hooks)
  - Material UI (for UI components)
  - React-Quill (for rich text editing)
- **Backend**:
  - Firebase Firestore
  - Firebase Authentication (if enabled in future development)
- **Other Tools**:
  - React Toastify (for notifications)
  - React CSV (for CSV export)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account

### Step-by-Step Setup

1. Clone the repository:
```bash
git clone https://github.com/eminsamed/Feedhub-Final.git
cd Feedhub-Final
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a new web app in your Firebase project
   - Copy the Firebase configuration

4. Set up environment variables:
   Create a `.env.local` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### For Administrators

1. **Dashboard Overview**
   - Access real-time feedback statistics
   - View feedback trends and patterns
   - Monitor response rates

2. **Feedback Management**
   - Create and customize feedback forms
   - Set up feedback categories
   - Configure notification settings
   - Manage user permissions

3. **Data Analysis**
   - Export feedback data to CSV
   - Generate feedback reports
   - Analyze feedback trends

### For Users

1. **Submitting Feedback**
   - Navigate to the feedback form
   - Select appropriate category
   - Provide detailed feedback
   - Submit the form

2. **Viewing Responses**
   - Access your feedback history
   - Track feedback status
   - View responses to your feedback

## Testing

### Unit Testing

Run unit tests using:
```bash
npm test
```

### Integration Testing

Run integration tests using:
```bash
npm run test:integration
```

### End-to-End Testing

Run E2E tests using:
```bash
npm run test:e2e
```

### Test Coverage

Generate test coverage report:
```bash
npm run test:coverage
```

### Testing Guidelines

1. **Unit Tests**
   - Test individual components in isolation
   - Mock external dependencies
   - Focus on component behavior
   - Maintain minimum 80% coverage

2. **Integration Tests**
   - Test component interactions
   - Verify data flow
   - Test API integrations
   - Validate state management

3. **E2E Tests**
   - Test complete user flows
   - Verify critical paths
   - Test error scenarios
   - Validate UI/UX requirements

## Development Notes

- **Firebase Integration**:

  - All Firebase operations (CRUD) are handled in the `firebaseModel.ts` file for better separation of concerns.

- **Environment Variables**:

  - Ensure to configure Firebase credentials in the `.env.local` file for local development.

- **Styling**:
  - Material UI is used for consistent and responsive UI.
  - Additional custom styles are defined in the `theme` folder.

## Future Improvements

- Add user authentication using Firebase Authentication.
- Implement role-based access control.
- Add unit and integration tests.
- Enhance analytics and reporting for feedback data.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributors

- **Emin Samed Yılmaz** - Developer & Maintainer

Feel free to contribute by submitting issues or pull requests!
