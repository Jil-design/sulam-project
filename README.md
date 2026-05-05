# Masjid Admin System

A web-based administration system for managing mosque operations including prayer times, announcements, and donations.

## Features

- **Multi-page Interface**: Separate pages for Dashboard, Prayer Times, Announcements, and Donations
- **Database Backend**: MongoDB for persistent data storage
- **Real-time Updates**: Data syncs across all pages
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB:**
   - For local MongoDB: Install MongoDB and start the service
   - For MongoDB Atlas: Create a cluster and get the connection string

4. **Configure environment variables:**
   Edit `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/masjid-admin
   # Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/masjid-admin
   PORT=5000
   ```

5. **Start the backend server:**
   ```bash
   npm start
   # Or for development: npm run dev
   ```

   The server will run on http://localhost:5000

### Frontend Setup

The frontend files are in the root directory. Since it's static HTML/CSS/JS, you can serve it using any web server or open the files directly in a browser.

For development, you can use a simple HTTP server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (install http-server globally)
npx http-server -p 3000
```

Then open http://localhost:3000 in your browser.

## API Endpoints

- `GET /api/prayer-times` - Get prayer times
- `PUT /api/prayer-times` - Update prayer times
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Add new announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `GET /api/donations` - Get donation history and total
- `POST /api/donations` - Add new donation
- `DELETE /api/donations` - Reset all donations

## Usage

1. Open `index.html` (login page)
2. Login with username: `admin`, password: `1234`
3. Navigate between pages using the sidebar
4. All data is automatically saved to the database

## Project Structure

```
/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── prayer.html             # Prayer times management
├── announcements.html      # Announcements management
├── donations.html          # Donations tracking
├── css/
│   └── style.css           # Stylesheets
├── js/
│   └── script.js           # Frontend logic
└── backend/
    ├── server.js           # Express server
    ├── package.json        # Backend dependencies
    └── .env                # Environment variables
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS with CSS Variables</content>
<parameter name="filePath">c:\Users\user\Downloads\SULAM project\README.md