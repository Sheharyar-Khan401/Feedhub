# Feedback App

Feedhub is a modern web application designed to manage user feedback effectively. Built using React, Firebase, and Material UI, this application allows users to create, update, and manage feedback seamlessly. The project emphasizes clean architecture by separating Firebase logic into a dedicated model file.

---

## Features

- **Add Feedback**: Users can add feedback with multiple options and detailed descriptions.
- **Update Feedback**: Existing feedback can be edited and updated.
- **Delete Feedback**: Unnecessary feedback entries can be removed.
- **Feedback Listing**: Feedback is displayed in a sortable and paginated table.
- **CSV Export**: Export feedback to a CSV file.
- **Firebase Integration**: Firestore is used to store and manage feedback data.

---

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

---

# Installation

Follow these steps to set up the project locally:

1. Clone the repository:

```bash
git clone https://github.com/eminsamed/Feedhub-Final.git

```

2. Navigate to the project directory:

```bash
cd feedback-app
```

3. Install dependencies:

```bash
npm install
```

4. Set up Firebase:

   - Create a Firebase project in the Firebase Console.
   - Add your Firebase configuration to a `.env` file or the `firebaseConfig.js` file.

5. Start the development server:

```bash
npm run dev
```

6. Open the application in your browser at:

```
http://localhost:3000
```

## Firebase Setup

Make sure to configure Firebase for this project:

1. Set up Firestore:

   - Create a `feedbacks` collection in Firestore.
   - Documents should have fields like `name`, `email`, `question`, `description`, `options`, etc.

2. Update `firebaseConfig`:
   - Replace the configuration in `firebase/firebaseConfig.js` with your Firebase project's credentials.

---

## Usage

### Adding Feedback

- Navigate to the **Add Feedback** page.
- Fill in personal information and survey details.
- Submit the form to create a feedback entry.

### Updating Feedback

- Go to the **Feedbacks** page.
- Select a feedback entry and click the **Update** button.
- Edit the details and save the changes.

### Deleting Feedback

- Open the **Feedbacks** page.
- Click the **Delete** button on the respective entry.
- Confirm the deletion in the modal.

### Exporting Feedback

- Use the **Export CSV** button on the **Feedbacks** page to download all feedback data as a CSV file.

---

## Development Notes

- **Firebase Integration**:

  - All Firebase operations (CRUD) are handled in the `firebaseModel.ts` file for better separation of concerns.

- **Environment Variables**:

  - Ensure to configure Firebase credentials in the `.env.local` file for local development.

- **Styling**:
  - Material UI is used for consistent and responsive UI.
  - Additional custom styles are defined in the `theme` folder.

---

## Future Improvements

- Add user authentication using Firebase Authentication.
- Implement role-based access control.
- Add unit and integration tests.
- Enhance analytics and reporting for feedback data.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contributors

- **Emin Samed Yılmaz** - Developer & Maintainer

Feel free to contribute by submitting issues or pull requests!
