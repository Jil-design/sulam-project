/* ============================================================
   MASJID Kg. Bandulan – Administration System
   script.js
   ============================================================
   HOW THIS FILE IS ORGANISED:
   1. Constants & Defaults
   2. Login / Logout
   3. Navigation (section switching)
   4. Prayer Times
   5. Announcements
   6. Donations
   7. Dashboard Rendering
   8. Utility Helpers
   9. Initialisation (runs on page load)
   ============================================================ */


/* ----------------------------------------------------------
   1. CONSTANTS & DEFAULT DATA
   ---------------------------------------------------------- */

// Hardcoded admin credentials (frontend-only simulation)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

// localStorage keys – keeps data even after browser is closed
const STORAGE_KEYS = {
  prayer:        "masjid_prayer_times",
  announcements: "masjid_announcements",
  donations:     "masjid_donations",
  donationTotal: "masjid_donation_total",
};

// Realistic default prayer times for Sabah, Malaysia
// (24-hour format for <input type="time">)
const DEFAULT_PRAYER_TIMES = {
  fajr:    "05:18",
  dhuhr:   "12:38",
  asr:     "15:55",
  maghrib: "18:34",
  isha:    "19:46",
};

// Display names shown in the UI
const PRAYER_DISPLAY_NAMES = {
  fajr:    "Fajr (Subuh)",
  dhuhr:   "Dhuhr (Zohor)",
  asr:     "Asr (Asar)",
  maghrib: "Maghrib",
  isha:    "Isha (Isyak)",
};

function getAuthToken() {
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = '/index.html';
    return null;
  }
  return token;
}


/* ----------------------------------------------------------
   2. LOGIN / LOGOUT
   ---------------------------------------------------------- */

/**
 * handleLogin()
 * Called when the user clicks "Sign In".
 * Checks credentials against hardcoded values,
 * then shows the dashboard if they match.
 */
function handleLogin() {
  // Read form values and strip extra spaces
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl  = document.getElementById("login-error");

  // Compare against hardcoded admin account
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Correct – hide login, show main app
    errorEl.classList.add("hidden");
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    // Initialise the dashboard data
    renderDashboard();
  } else {
    // Wrong – show error message
    errorEl.classList.remove("hidden");
  }
}

/**
 * handleLogout()
 * Hides the dashboard and returns to login screen.
 * Clears the password field for security.
 */
function handleLogout() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("password").value = "";
  document.getElementById("username").value = "";
}

// Allow pressing Enter on the login form to submit
document.addEventListener("keydown", function (event) {
  // Only act if we're on the login screen and Enter is pressed
  const loginScreen = document.getElementById("login-screen");
  if (loginScreen && !loginScreen.classList.contains("hidden") && event.key === "Enter") {
    handleLogin();
  }
});


/* ----------------------------------------------------------
   3. NAVIGATION (section switching)
   ---------------------------------------------------------- */

/**
 * showSection(sectionId, clickedLink)
 * Hides all sections, then shows the selected one.
 * Also updates the sidebar active link and top-bar title.
 *
 * @param {string} sectionId   - e.g. "dashboard", "prayer", etc.
 * @param {Element} clickedLink - the <a> nav element that was clicked
 */
function showSection(sectionId, clickedLink) {
  // 1. Hide all sections
  document.querySelectorAll(".section").forEach(function (el) {
    el.classList.add("hidden");
    el.classList.remove("active");
  });

  // 2. Show the requested section
  const target = document.getElementById("section-" + sectionId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }

  // 3. Update sidebar: remove active from all links, add to clicked
  document.querySelectorAll(".nav-item").forEach(function (el) {
    el.classList.remove("active");
  });
  if (clickedLink) clickedLink.classList.add("active");

  // 4. Update top-bar heading
  const titles = {
    dashboard:     "Dashboard",
    prayer:        "Prayer Times",
    announcements: "Announcements",
    donations:     "Donations",
  };
  document.getElementById("section-title").textContent = titles[sectionId] || "Dashboard";

  // 5. Refresh the section's content
  if (sectionId === "dashboard")     renderDashboard();
  if (sectionId === "prayer")        loadPrayerForm();
  if (sectionId === "announcements") renderAdminAnnouncements();
  if (sectionId === "donations")     renderDonationHistory();

  // Prevent <a> from jumping to top of page
  return false;
}


/* ----------------------------------------------------------
   4. PRAYER TIMES
   ---------------------------------------------------------- */

/**
 * getPrayerTimes()
 * Fetches prayer times from the API.
 * Returns the default times if API fails.
 */
async function getPrayerTimes() {
  try {
    const response = await fetch('http://localhost:5000/api/prayer-times');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return {
      fajr: data.fajr,
      dhuhr: data.dhuhr,
      asr: data.asr,
      maghrib: data.maghrib,
      isha: data.isha,
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return DEFAULT_PRAYER_TIMES;
  }
}

/**
 * loadPrayerForm()
 * Populates the time inputs in the Prayer Management section
 * with the currently saved times.
 */
async function loadPrayerForm() {
  const times = await getPrayerTimes();

  const fajrEl = document.getElementById("time-fajr");
  const dhuhrEl = document.getElementById("time-dhuhr");
  const asrEl = document.getElementById("time-asr");
  const maghribEl = document.getElementById("time-maghrib");
  const ishaEl = document.getElementById("time-isha");

  if (fajrEl) fajrEl.value = times.fajr;
  if (dhuhrEl) dhuhrEl.value = times.dhuhr;
  if (asrEl) asrEl.value = times.asr;
  if (maghribEl) maghribEl.value = times.maghrib;
  if (ishaEl) ishaEl.value = times.isha;
}

/**
 * savePrayerTimes()
 * Reads all five time inputs, saves them to the API,
 * and shows a brief confirmation message.
 */
async function savePrayerTimes() {
  // Build an object from the form
  const times = {
    fajr:    document.getElementById("time-fajr").value,
    dhuhr:   document.getElementById("time-dhuhr").value,
    asr:     document.getElementById("time-asr").value,
    maghrib: document.getElementById("time-maghrib").value,
    isha:    document.getElementById("time-isha").value,
  };

  // Validate: all fields must be filled
  const allFilled = Object.values(times).every(function (t) { return t !== ""; });
  if (!allFilled) {
    alert("Please fill in all prayer times before saving.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/prayer-times', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(times),
    });
    if (!response.ok) throw new Error('Failed to save');
    
    // Show success message for 2 seconds
    flashMessage("prayer-saved-msg");
  } catch (error) {
    console.error('Error saving prayer times:', error);
    alert('Failed to save prayer times. Please try again.');
  }
}

/**
 * renderPrayerList(containerId)
 * Renders the prayer times as a styled list inside the given container.
 *
 * @param {string} containerId - the element id to render into
 */
async function renderPrayerList(containerId) {
  const times     = await getPrayerTimes();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear previous content
  container.innerHTML = "";

  // Loop through each prayer and build a row
  Object.keys(times).forEach(function (key) {
    const row = document.createElement("div");
    row.className = "prayer-row";

    // Convert 24h to 12h for display (e.g. "05:18" → "5:18 AM")
    const displayTime = formatTime12h(times[key]);

    row.innerHTML =
      '<span class="prayer-name">' + PRAYER_DISPLAY_NAMES[key] + '</span>' +
      '<span class="prayer-time">' + displayTime + '</span>';

    container.appendChild(row);
  });
}


/* ----------------------------------------------------------
   5. ANNOUNCEMENTS
   ---------------------------------------------------------- */

/**
 * getAnnouncements()
 * Fetches announcements from the API.
 */
async function getAnnouncements() {
  try {
    const response = await fetch('http://localhost:5000/api/announcements');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

/**
 * saveAnnouncements(list)
 * Writes the announcements array back to localStorage.
 */
function saveAnnouncements(list) {
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(list));
}

/**
 * addAnnouncement()
 * Reads the title + body inputs, validates them,
 * posts to the API, and refreshes the list.
 */
async function addAnnouncement() {
  const title = document.getElementById("ann-title").value.trim();
  const body  = document.getElementById("ann-body").value.trim();

  // Both fields are required
  if (!title || !body) {
    alert("Please enter both a title and a message for the announcement.");
    return;
  }

  // Create a new announcement object
  const newItem = {
    title: title,
    body:  body,
  };

  try {
    const response = await fetch('http://localhost:5000/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(newItem),
    });
    if (!response.ok) throw new Error('Failed to add');

    // Clear the form inputs
    document.getElementById("ann-title").value = "";
    document.getElementById("ann-body").value  = "";

    // Refresh the admin list view and show success
    await renderAdminAnnouncements();
    flashMessage("ann-saved-msg");
  } catch (error) {
    console.error('Error adding announcement:', error);
    alert('Failed to add announcement. Please try again.');
  }
}

/**
 * deleteAnnouncement(id)
 * Deletes the announcement with the matching id from the API.
 *
 * @param {string} id - the announcement's id
 */
async function deleteAnnouncement(id) {
  try {
    const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete');
    
    await renderAdminAnnouncements();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    alert('Failed to delete announcement. Please try again.');
  }
}

/**
 * renderDashboardAnnouncements()
 * Shows a read-only, compact list of announcements on the dashboard.
 */
async function renderDashboardAnnouncements() {
  const container = document.getElementById("dashboard-announcements");
  if (!container) return;

  const list = await getAnnouncements();
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = '<p class="ann-no-items">No announcements at this time.</p>';
    return;
  }

  // Show up to 5 most recent announcements on the dashboard
  const recent = list.slice(0, 5);
  recent.forEach(function (item) {
    const div = document.createElement("div");
    div.className = "ann-item-dash";
    div.innerHTML =
      '<p class="ann-title-dash">' + escapeHtml(item.title) + '</p>' +
      '<p class="ann-body-dash">'  + escapeHtml(item.body)  + '</p>';
    container.appendChild(div);
  });
}

/**
 * renderAdminAnnouncements()
 * Shows the full list with delete buttons in the Announcements section.
 */
async function renderAdminAnnouncements() {
  const container = document.getElementById("admin-announcements-list");
  if (!container) return;

  const list = await getAnnouncements();
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = '<p class="ann-no-items">No announcements yet. Add one above.</p>';
    return;
  }

  list.forEach(function (item) {
    const div = document.createElement("div");
    div.className = "ann-admin-item";

    const dateStr = new Date(item.created_at).toLocaleDateString();

    div.innerHTML =
      '<div class="ann-admin-text">' +
        '<p class="ann-admin-title">' + escapeHtml(item.title) + '</p>' +
        '<p class="ann-admin-body">'  + escapeHtml(item.body)  + '</p>' +
        '<p style="font-size:0.75rem;color:var(--text-light);margin-top:0.3rem;">' + dateStr + '</p>' +
      '</div>' +
      '<button class="ann-delete-btn" onclick="deleteAnnouncement(\'' + item.id + '\')">Delete</button>';

    container.appendChild(div);
  });
}


/* ----------------------------------------------------------
   6. DONATIONS
   ---------------------------------------------------------- */

/**
 * getDonations()
 * Fetches donation history and total from the API.
 */
async function getDonations() {
  try {
    const response = await fetch('http://localhost:5000/api/donations');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching donations:', error);
    return { history: [], total: 0 };
  }
}

/**
 * getDonationTotal()
 * Returns the running total (for compatibility).
 */
async function getDonationTotal() {
  const data = await getDonations();
  return data.total;
}

/**
 * getDonationHistory()
 * Returns the array of individual donation records.
 */
async function getDonationHistory() {
  const data = await getDonations();
  return data.history;
}

/**
 * addDonation()
 * Reads the amount input, posts to the API.
 */
async function addDonation() {
  const amountInput = document.getElementById("donation-amount").value;
  const note        = document.getElementById("donation-note").value.trim();
  const amount      = parseFloat(amountInput);

  // Validate: must be a positive number
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid donation amount greater than 0.");
    return;
  }

  const donation = {
    amount: amount,
    note: note || "General donation",
  };

  try {
    const response = await fetch('http://localhost:5000/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(donation),
    });
    if (!response.ok) throw new Error('Failed to add');

    // Clear inputs
    document.getElementById("donation-amount").value = "";
    document.getElementById("donation-note").value   = "";

    // Refresh the view and show success
    await renderDonationHistory();
    flashMessage("donation-saved-msg");
  } catch (error) {
    console.error('Error adding donation:', error);
    alert('Failed to add donation. Please try again.');
  }
}

/**
 * resetDonations()
 * Clears all donation data after user confirms.
 */
async function resetDonations() {
  const confirmed = confirm("Are you sure you want to reset all donation records? This cannot be undone.");
  if (!confirmed) return;

  try {
    const response = await fetch('http://localhost:5000/api/donations', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reset');
    
    await renderDonationHistory();
  } catch (error) {
    console.error('Error resetting donations:', error);
    alert('Failed to reset donations. Please try again.');
  }
}

/**
 * renderDonationHistory()
 * Updates both the total display and the history list
 * in the Donations section.
 */
async function renderDonationHistory() {
  const data = await getDonations();
  const total = data.total;
  const history = data.history;

  // Update the big total number
  const displayEl = document.getElementById("donation-display");
  if (displayEl) {
    displayEl.textContent = "RM " + total.toFixed(2);
  }

  // Update history list
  const container = document.getElementById("donation-history");
  if (!container) return;

  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = '<p class="ann-no-items">No donation records yet.</p>';
    return;
  }

  history.forEach(function (record) {
    const div = document.createElement("div");
    div.className = "donation-history-item";
    const dateStr = new Date(record.created_at).toLocaleDateString();
    div.innerHTML =
      '<div>' +
        '<span class="donation-amount-pos">+ RM ' + record.amount.toFixed(2) + '</span>' +
        '<span class="donation-note-txt"> – ' + escapeHtml(record.note) + '</span>' +
      '</div>' +
      '<span class="donation-date">' + dateStr + '</span>';
    container.appendChild(div);
  });
}


/* ----------------------------------------------------------
   7. DASHBOARD RENDERING
   Pulls everything together for the main overview page
   ---------------------------------------------------------- */

/**
 * renderDashboard()
 * Called whenever the dashboard section is shown.
 * Updates all three widgets: prayer times, announcements, stats.
 */
async function renderDashboard() {
  // Prayer times card
  await renderPrayerList("dashboard-prayer-list");

  // Announcements card
  await renderDashboardAnnouncements();

  // Stats bar
  const announcements = await getAnnouncements();
  const total         = await getDonationTotal();

  const statAnn = document.getElementById("stat-announcements");
  const statDon = document.getElementById("stat-donations");
  if (statAnn) statAnn.textContent = announcements.length;
  if (statDon) statDon.textContent = "RM " + total.toFixed(2);

  // Also update the donation display on the donations page (if rendered)
  const displayEl = document.getElementById("donation-display");
  if (displayEl) displayEl.textContent = "RM " + total.toFixed(2);
}


/* ----------------------------------------------------------
   8. UTILITY HELPERS
   ---------------------------------------------------------- */

/**
 * formatTime12h(time24)
 * Converts "HH:MM" (24-hour) to "H:MM AM/PM" (12-hour).
 *
 * @param  {string} time24 - e.g. "13:45"
 * @return {string}        - e.g. "1:45 PM"
 */
function formatTime12h(time24) {
  if (!time24) return "--:--";
  const parts  = time24.split(":");
  let   hours  = parseInt(parts[0], 10);
  const mins   = parts[1];
  const ampm   = hours >= 12 ? "PM" : "AM";
  hours        = hours % 12 || 12;   // 0 → 12 for midnight
  return hours + ":" + mins + " " + ampm;
}

/**
 * todayString()
 * Returns today's date as a readable string, e.g. "5 May 2025".
 */
function todayString() {
  const now     = new Date();
  const months  = ["Jan","Feb","Mar","Apr","May","Jun",
                   "Jul","Aug","Sep","Oct","Nov","Dec"];
  return now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();
}

/**
 * flashMessage(elementId)
 * Shows a success message element for 2.5 seconds, then hides it.
 *
 * @param {string} elementId - the id of the <p class="success-msg"> element
 */
function flashMessage(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove("hidden");
  setTimeout(function () {
    el.classList.add("hidden");
  }, 2500);
}

/**
 * escapeHtml(text)
 * Prevents XSS by replacing dangerous characters before inserting
 * user-supplied text into innerHTML.
 *
 * @param  {string} text
 * @return {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/**
 * updateCurrentDate()
 * Writes today's date into the top-bar date element.
 */
function updateCurrentDate() {
  const el = document.getElementById("current-date");
  if (el) el.textContent = todayString();
}


/* ----------------------------------------------------------
   9. INITIALISATION
   Runs once when the page finishes loading
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async function () {
  // Require valid auth token for admin pages
  requireAuth();

  // Show today's date in the top bar
  updateCurrentDate();

  // Pre-load prayer form values (so inputs are ready when section opens)
  await loadPrayerForm();
});

