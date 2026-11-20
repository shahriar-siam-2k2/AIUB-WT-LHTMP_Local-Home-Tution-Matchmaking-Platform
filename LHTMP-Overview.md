# Local Home Tuition Matchmaking Platform (LHTMP) - Architecture & Engineering Blueprint

This document specifies the technical design patterns, architectural standards, code patterns, and implementation guidelines for the Local Home Tuition Matchmaking Platform (LHTMP). Any developer or artificial intelligence working on this platform (including the Admin, Registration, Login, Coordinator, Student, and Tutor portals) must strictly adhere to the patterns and standards documented here.

---

## 1. Core Architectural Principles & System Rules

### 1.1 Strict Platform Constraints
1. **Zero Comments Rule**:
   - Absolute zero comments (`//`, `/* */`, `<!-- -->`) across all project files: HTML, CSS, JavaScript, and data files.
   - Code must be self-explanatory through semantic variable naming, clear function signatures, and structured formatting.

2. **Zero Occurrences of Forbidden Role Word**:
   - The platform strictly recognizes four user roles:
     - `Admin`
     - `Area Coordinator`
     - `Tutor`
     - `Student`
   - Case-insensitive search across the entire project for any unauthorized role term must yield 0 results.
   - Never use unauthorized terms in HTML, CSS properties (use `rgba(0,0,0,0)` or `none` for backgrounds), classes, or JavaScript identifiers.

3. **Separation of Concerns (Zero Inline CSS in HTML)**:
   - No CSS may be written inside HTML files (`style="..."` attributes and `<style>` blocks are strictly forbidden in HTML).
   - All styling must reside in external stylesheets:
     - `Registration/regManage.css` for registration and profile editing.
     - `Login/login.css` for authentication.
     - `Admin/admin.css` for platform administrative modules.
     - Dedicated portal stylesheets for `Coordinator/`, `Student/`, and `Tutor/`.

4. **Forbidden JavaScript Methods**:
   - To keep code simple, predictable, and compliant with academic and platform standards, the following JavaScript methods are strictly forbidden:
     - String `.replace()`
     - String `.trim()`
     - DOM `document.createElement()`
     - DOM `.appendChild()`
     - DOM `document.querySelector()`
     - DOM `document.querySelectorAll()`
     - `Blob()`
     - `URL.createObjectURL()`
   - Approved alternatives:
     - Element retrieval: `document.getElementById()`, `document.getElementsByName()`.
     - DOM mutation: innerHTML and textContent.
     - Whitespace cleaning: Character iteration loops (`cleanInputText()`).
     - Image loading: `FileReader.readAsDataURL()`.

5. **Link-Button Pattern**:
   - All navigation buttons wrapped in links must adhere strictly to this syntax:
```html
<a href="target_page.html">
  <button type="button" class="btn-primary">Button Label</button>
</a>
```

6. **Missing Values Representation**:
   - Missing text values: `"N/A"`.
   - Missing numeric/percentage values: `"0"` or `"0%"`.

7. **Standard Display Date-Time Format**:
   - All date-time displays in tables, audit logs, and previews must follow:
     `DD-MM-YYYY hh:mm AM/PM` (e.g. `14-11-2026 05:32 AM`).

8. **Standard Table Pagination**:
   - Every data table displays up to 5 rows per page.
   - Pagination controls must include: `Previous`, dynamic page numbers (`1`, `2`, `3`...), and `Next`.

---

## 2. Data Layer & Storage Architecture

### 2.1 File Storage Mechanisms
The platform operates as a lightweight client-side architecture that reads and persists records via local text files using `Helper JS/readWrite.js`.

| Data File | Location | Primary Purpose |
|---|---|---|
| `database.txt` | `Files/Data/database.txt` | Central relational text database containing sections for USERS, DISPUTES, PAYMENTS, MODERATION, ALERTS, and ANALYTICS. |
| `users.txt` | `Files/Data/users.txt` | Authentication table storing credentials and profile records. |
| `lists.txt` | `Files/Data/lists.txt` | System reference lists for geographic DIVISIONS, matching areas, and academic GRADES. |

### 2.2 Record Delimitation Pattern
Every record in `database.txt` and `users.txt` is encoded with bracketed fields separated by semicolons:
`{field1}; {field2}; {field3}; ...`

#### Users Table Record Format (`[USERS]` in `database.txt`):
`{id}; {fullName}; {email}; {phone}; {password}; {dob}; {gender}; {division}; {area}; {grade}; {role}; {status}; {date}; {image}`

1. `id`: Formatted user identifier (e.g. `USR-1001`).
2. `fullName`: User full name.
3. `email`: Unique email address.
4. `phone`: Exactly 11-digit mobile phone number.
5. `password`: Account password.
6. `dob`: Date of birth (`YYYY-MM-DD`).
7. `gender`: `Male` or `Female`.
8. `division`: Administrative division (e.g. `Dhaka`, `Chittagong`, `Rajshahi`).
9. `area`: Sub-district / local matching zone.
10. `grade`: Academic level (e.g. `Graduate_BSc. CSE, DU`, `Class-10_General`, or `N/A`).
11. `role`: One of `Admin`, `Area Coordinator`, `Tutor`, `Student`.
12. `status`: `Active`, `Suspended`, or `Pending Verification`.
13. `date`: Account creation timestamp (`YYYY-MM-DD HH:MM`).
14. `image`: Relative profile image path (e.g. `../Files/Img/Profile/default.svg`).

### 2.3 Image Handling & Persistence Strategy
- Raw image binary files cannot be embedded directly into `database.txt`.
- Instead, the relative file path to the image is stored in `database.txt`:
  - `../Files/Img/Profile/default.svg` (default avatar for all users).
  - `../Files/Img/Profile/<filename>` (when an image is assigned).
- Real-time client preview and persistence:
  - When a user chooses an image via `<input type="file" id="profileImage">`, `FileReader.readAsDataURL(file)` generates a base64 Data URL.
  - The Data URL is cached in client storage:
    `localStorage.setItem("lhtmp_avatar_" + userId, dataUrl);`
  - In tables and profiles, avatars are resolved through `resolveUserAvatar(u)`:
    1. Checks `localStorage.getItem("lhtmp_avatar_" + u.id)`.
    2. If not found, falls back to `resolveImagePath(u.image)`.
    3. If empty, falls back to `../Files/Img/Profile/default.svg`.
    4. On image load failure, `onerror="this.src='../Files/Img/Profile/default.svg'"` guarantees fallback.

---

## 3. HTML Structural Design Patterns

### 3.1 Portal Page Shell
Every portal view implements a standardized structural hierarchy:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LHTMP - Module Title</title>
    <link rel="stylesheet" href="portal.css" />
  </head>
  <body>
    <header class="app-header">
      <div class="brand">
        <img src="../Files/Img/Logo/logo.svg" alt="LHTMP Logo" class="brand-logo" />
        <span class="brand-title">LHTMP Portal</span>
      </div>
      <div class="header-actions">
        <button type="button" class="btn-icon" id="btnNotification">🔔</button>
        <span class="user-greeting">Welcome, User</span>
      </div>
    </header>

    <div class="page-container">
      <div class="section-block">
        <div class="section-header">
          <h3>Section Title</h3>
          <div class="table-actions">
            <button type="button" class="btn-primary" id="btnAction">Action</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
              </tr>
            </thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>

        <div class="filter-bar filter-bar-between">
          <div>Showing records</div>
          <div class="table-actions">
            <button type="button" class="btn-secondary" id="btnPrev">Previous</button>
            <button type="button" class="btn-primary" id="btnPage1">1</button>
            <button type="button" class="btn-secondary" id="btnNext">Next</button>
          </div>
        </div>
      </div>

      <footer class="page-footer-main">
        © 2026 Local Home Tuition Matchmaking Platform. All rights reserved.
      </footer>
    </div>

    <script src="../Helper JS/readWrite.js"></script>
    <script src="portal.js"></script>
  </body>
</html>
```

### 3.2 Centered Profile Image Preview Pattern
Used in `registration.html`, `edit_profile.html`, and any future profile views:
```html
<fieldset class="form-fieldset">
  <legend>Profile Image</legend>
  <div class="avatar-preview-container">
    <img
      id="avatarPreview"
      src="../Files/Img/Profile/default.svg"
      alt="Profile Photo"
      class="avatar-preview-img"
      onerror="this.src='../Files/Img/Profile/default.svg'"
    />
    <div class="avatar-upload-wrap">
      <label for="profileImage" class="avatar-upload-label">
        Upload Profile Image File (Optional)
      </label>
      <div class="avatar-input-box">
        <input
          type="file"
          id="profileImage"
          name="profileImage"
          accept="image/*"
          class="avatar-file-input"
        />
      </div>
    </div>
  </div>
</fieldset>
```

### 3.3 Modal Dialog Structure
Standard dialog for notifications, audits, and popups:
```html
<div id="simpleModal" class="modal-overlay">
  <div class="modal-box">
    <div class="modal-header">
      <h3 id="simpleModalTitle" class="modal-title">Notification</h3>
      <button type="button" id="btnModalClose" class="modal-close-btn">✕</button>
    </div>
    <div id="simpleModalBody" class="modal-body"></div>
    <div class="modal-footer">
      <button type="button" id="btnModalOk" class="btn-primary modal-ok-btn">OK</button>
    </div>
  </div>
</div>
```

---

## 4. CSS Design System & Visual Guidelines

### 4.1 Color Palette & Typography
- Font Family: `'Lato', sans-serif` via `@import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap");`
- Primary Brand Navy: `#1e3a5f`
- Primary Accent Blue: `#2d5a9e` / `#3b82f6`
- Dark Background Gradient: `linear-gradient(135deg, #1a2a6c 0%, #1e3a5f 40%, #16213e 100%)`
- Neutral Surfaces: Card background `#ffffff`, Page wrapper `#f8fafc`
- Borders & Dividers: Light `#e5e7eb` / `#d1d5db`, Selected `#1e3a5f`

### 4.2 Standard Status Badge Colors
Status indicators across all modules use the `.status-badge` class with semantic modifiers:

| Status Badge Class | Used For | Background | Text Color | Dot Color |
|---|---|---|---|---|
| `.status-badge.active` | Active, Verified, Completed, Online | `#d1fae5` | `#065f46` | `#10b981` |
| `.status-badge.pending` | Pending, Review, Medium Severity | `#fef3c7` | `#92400e` | `#f59e0b` |
| `.status-badge.suspended` | Suspended, High Severity, Closed | `#fee2e2` | `#991b1b` | `#ef4444` |
| `.status-badge.urgent` | Urgent Priority Disputes | `#F55D1E` | `#ffffff` | `#ffffff` |
| `.status-badge.low`, `.status-badge.dismissed` | Low Severity, Dismissed Reports | `#e0f2fe` | `#0369a1` | `#0284c7` |

### 4.3 Standard Action Button Classes
- `.btn-primary`: Navy fill (`#1e3a5f`), white text, 8px border-radius, hover lift.
- `.btn-secondary`: Light grey fill (`#f3f4f6`), border `#d1d5db`, dark text.
- `.btn-success`: Green gradient (`#059669` to `#047857`), white text.
- `.btn-danger`: Red fill (`#dc2626`), white text.
- `.btn-clear`: Neutral clear action (`#f3f4f6`), dark text.
- `.btn-table-disabled`: Disabled table button (`opacity: 0.5; cursor: not-allowed;`).

---

## 5. JavaScript Logic & Web Logic Patterns

### 5.1 Text Sanitization Without Forbidden `.trim()`
```javascript
function cleanInputText(val) {
  if (val === null || val === undefined) return "";
  let str = "" + val;
  let start = 0;
  while (start < str.length && (str.charAt(start) == " " || str.charAt(start) == "\t" || str.charAt(start) == "\r" || str.charAt(start) == "\n")) {
    start++;
  }
  let end = str.length - 1;
  while (end >= start && (str.charAt(end) == " " || str.charAt(end) == "\t" || str.charAt(end) == "\r" || str.charAt(end) == "\n")) {
    end--;
  }
  let res = "";
  for (let i = start; i <= end; i++) {
    res += str.charAt(i);
  }
  return res;
}
```

### 5.2 Date Formatting Without Forbidden `.replace()`
Standardizes any date string into `DD-MM-YYYY hh:mm AM/PM`:
```javascript
function formatDateTime(val) {
  if (!val || val == "" || val == "N/A" || val == "undefined" || val == "null") {
    return "N/A";
  }
  let str = "" + val;
  let clean = "";
  for (let i = 0; i < str.length; i++) {
    let c = str.charAt(i);
    if (c != "{" && c != "}" && c != "\r" && c != "\n") {
      clean += c;
    }
  }
  clean = cleanInputText(clean);
  let spaceIdx = clean.indexOf(" ");
  let datePart = spaceIdx != -1 ? clean.substring(0, spaceIdx) : clean;
  let timePart = spaceIdx != -1 ? clean.substring(spaceIdx + 1) : "";

  let year = "2026";
  let month = "01";
  let day = "01";

  if (datePart.indexOf("-") != -1) {
    let parts = datePart.split("-");
    if (parts.length >= 3) {
      if (parts[0].length == 4) {
        year = parts[0];
        month = parts[1].length < 2 ? "0" + parts[1] : parts[1];
        day = parts[2].length < 2 ? "0" + parts[2] : parts[2];
      } else {
        day = parts[0].length < 2 ? "0" + parts[0] : parts[0];
        month = parts[1].length < 2 ? "0" + parts[1] : parts[1];
        year = parts[2];
      }
    }
  }

  let hours = 0;
  let mins = 0;
  if (timePart.indexOf(":") != -1) {
    let tParts = timePart.split(":");
    hours = parseInt(tParts[0], 10) || 0;
    let minStr = tParts[1] || "0";
    let pureMin = "";
    for (let i = 0; i < minStr.length; i++) {
      let code = minStr.charCodeAt(i);
      if (code >= 48 && code <= 57) pureMin += minStr.charAt(i);
    }
    mins = parseInt(pureMin, 10) || 0;
    if (timePart.toLowerCase().indexOf("pm") != -1 && hours < 12) hours += 12;
    if (timePart.toLowerCase().indexOf("am") != -1 && hours == 12) hours = 0;
  }

  let ampm = hours >= 12 ? "PM" : "AM";
  let h12 = hours % 12;
  if (h12 == 0) h12 = 12;

  let hStr = h12 < 10 ? "0" + h12 : "" + h12;
  let mStr = mins < 10 ? "0" + mins : "" + mins;

  return day + "-" + month + "-" + year + " " + hStr + ":" + mStr + " " + ampm;
}
```

### 5.3 User Avatar Resolution
```javascript
function resolveImagePath(imgPath) {
  if (!imgPath || imgPath == "" || imgPath == "N/A" || imgPath == "undefined" || imgPath == "null") {
    return "../Files/Img/Profile/default.svg";
  }
  let p = cleanInputText("" + imgPath);
  if (p.length == 0) return "../Files/Img/Profile/default.svg";
  if (p.indexOf("../Files/") == 0) return p;
  if (p.indexOf("./Files/") == 0) return "." + p;
  if (p.indexOf("Files/") == 0) return "../" + p;
  if (p.indexOf("../") == 0 || p.indexOf("/") == 0 || p.indexOf("http") == 0) return p;
  return "../Files/Img/Profile/" + p;
}

function resolveUserAvatar(u) {
  if (!u) return "../Files/Img/Profile/default.svg";
  let cached = null;
  if (u.id) cached = localStorage.getItem("lhtmp_avatar_" + u.id);
  if (!cached && u.email) cached = localStorage.getItem("lhtmp_avatar_" + u.email);
  if (cached && cached.length > 0) return cached;
  return resolveImagePath(u.image);
}
```

### 5.4 Standard 5-Row Table Pagination Logic
```javascript
function updateTablePagination(prefix, currentPage, totalPages, onPageChange) {
  let prevBtn = document.getElementById("btnPrev" + prefix);
  let nextBtn = document.getElementById("btnNext" + prefix);
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = function () {
      if (currentPage > 1) onPageChange(currentPage - 1);
    };
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = function () {
      if (currentPage < totalPages) onPageChange(currentPage + 1);
    };
  }

  for (let p = 1; p <= 5; p++) {
    let pageBtn = document.getElementById("btnPage" + p + prefix);
    if (pageBtn) {
      if (p <= totalPages) {
        pageBtn.style.display = "inline-block";
        pageBtn.textContent = "" + p;
        if (p == currentPage) {
          pageBtn.className = "btn-primary";
        } else {
          pageBtn.className = "btn-secondary";
        }
        pageBtn.onclick = function () {
          onPageChange(p);
        };
      } else {
        pageBtn.style.display = "none";
      }
    }
  }
}
```

### 5.5 Database Update & Persistence Flow
When performing any state modification (activating/suspending users, recording dispute rulings, removing content, or dispatching alerts):
```javascript
targetRecord.status = newStatus;

if (typeof writeDatabase === "function") {
  writeDatabase(currentDb, function () {
    renderCurrentModule();
    alert("Record updated successfully!");
  });
} else {
  renderCurrentModule();
  alert("Record updated successfully!");
}
```

---

## 6. Implementation Blueprint for Future Modules

When developing or extending modules in `Coordinator/`, `Student/`, and `Tutor/`, apply these identical conventions:

1. **Authentication & Session Management**:
   - Access the authenticated user record from `sessionStorage.getItem("lhtmp_current_user")`.
   - Verify that `user.userType` or `user.role` matches the expected portal role. If not, redirect to `../Login/login.html`.

2. **Data Binding**:
   - Always load dynamic records through `readDatabase()` and `readUser()`.
   - Never hardcode user names, inquiry counts, tuition amounts, or IDs into HTML or JavaScript.

3. **Form Submissions & Updates**:
   - Validate all mandatory fields before modifying data.
   - For new tuition requests, applications, or reviews, generate standardized IDs (e.g. `REQ-`, `APP-`, `REV-`).
   - Append to the appropriate array in `currentDb` and persist via `writeDatabase(currentDb)`.

4. **Styling & Assets**:
   - Place all CSS into dedicated stylesheet files (e.g. `coordinator.css`, `student.css`, `tutor.css`).
   - Use `../Files/Img/Logo/` for platform branding and gateway emblems.
   - Use `../Files/Img/Profile/` for avatar paths and fallback to `default.svg`.

By preserving this architecture, the entire platform remains unified, predictable, robust, and maintainable across all operational roles.
