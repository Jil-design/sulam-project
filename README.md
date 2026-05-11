# Masjid Admin System

A static web-based administration system for managing mosque operations including prayer times, announcements, and donations.

## Features

- **Multi-page Interface**: Separate pages for Dashboard, Prayer Times, Announcements, and Donations
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- A web browser

### Frontend Setup

The frontend files are static HTML/CSS/JS. You can serve them using any web server or open the files directly in a browser.

For development, you can use a simple HTTP server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (install http-server globally)
npx http-server -p 3000
```

Then open http://localhost:3000 in your browser.

## Usage

1. Open `index.html` (login page)
2. Login with username: `admin`, password: `1234`
3. Navigate between pages using the sidebar

## Project Structure

```
/
├── index.html              # Login page
├── admin/
│   ├── admin_dashboard.html    # Admin dashboard
│   ├── prayer.html             # Prayer times management
│   ├── announcements.html      # Announcements management
│   └── donations.html          # Donations tracking
├── users/
│   ├── register.html           # User registration
│   ├── dashboard.html          # User dashboard
│   ├── announcements.html      # User announcements view
│   └── donations.html          # User donations view
├── css/
│   └── style.css           # Stylesheets
└── js/
    └── script.js           # Frontend logic
```
    ├── server.js           # Express server
    ├── package.json        # Backend dependencies
    └── .env                # Environment variables
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: Supabase
- **Styling**: Custom CSS with CSS Variables</content>
<parameter name="filePath">c:\Users\user\Downloads\SULAM project\README.md