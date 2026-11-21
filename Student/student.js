let currentDb = null;
let currentStudent = null;
let editingReviewId = null;

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

function getText(val) {
  if (val === null || val === undefined || val === "" || val === "undefined" || val === "null") {
    return "N/A";
  }
  return "" + val;
}

function getNumber(val) {
  if (val === null || val === undefined || val === "" || val === "undefined" || val === "null" || isNaN(val)) {
    return "0";
  }
  return "" + val;
}

function getQueryParam(key) {
  let search = window.location.search;
  if (!search || search.length == 0) return "";
  let target = key + "=";
  let idx = search.indexOf(target);
  if (idx == -1) return "";
  let rest = search.substring(idx + target.length);
  let amp = rest.indexOf("&");
  let val = amp != -1 ? rest.substring(0, amp) : rest;
  let clean = "";
  for (let i = 0; i < val.length; i++) {
    let c = val.charAt(i);
    if (c != "{" && c != "}" && c != "\r" && c != "\n") {
      clean += c;
    }
  }
  return decodeURIComponent(clean);
}

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
  if (clean.indexOf("AM") != -1 || clean.indexOf("PM") != -1) {
    return clean;
  }
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

function showModal(title, bodyHtml, onOk) {
  let modal = document.getElementById("simpleModal");
  let modalTitle = document.getElementById("simpleModalTitle");
  let modalBody = document.getElementById("simpleModalBody");
  let btnOk = document.getElementById("btnModalOk");

  if (!modal || !modalTitle || !modalBody) {
    alert(title + "\n\n" + bodyHtml);
    if (typeof onOk === "function") onOk();
    return;
  }

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modal.style.display = "flex";

  if (btnOk) {
    btnOk.onclick = function () {
      closeModal();
      if (typeof onOk === "function") {
        onOk();
      }
    };
  }
}

function closeModal() {
  let modal = document.getElementById("simpleModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function setupModal() {
  let btnClose = document.getElementById("btnModalClose");
  let btnOk = document.getElementById("btnModalOk");
  let modal = document.getElementById("simpleModal");

  if (btnClose) {
    btnClose.onclick = closeModal;
  }
  if (btnOk && !btnOk.onclick) {
    btnOk.onclick = closeModal;
  }
  if (modal) {
    modal.onclick = function (e) {
      if (e.target === modal) {
        closeModal();
      }
    };
  }
}

function getCurrentStudent(db) {
  let found = null;
  try {
    let sessionData = sessionStorage.getItem("lhtmp_current_user");
    if (sessionData) {
      let parsed = JSON.parse(sessionData);
      if (parsed && (parsed.id || parsed.email)) {
        for (let i = 0; i < db.users.length; i++) {
          let u = db.users[i];
          if (u.id == parsed.id || (u.email && u.email.toLowerCase() == parsed.email.toLowerCase())) {
            found = u;
            break;
          }
        }
        if (!found && (parsed.userType == "Student" || parsed.role == "Student")) {
          found = parsed;
        }
      }
    }
  } catch (e) {}

  if (!found && db.users) {
    for (let i = 0; i < db.users.length; i++) {
      if (db.users[i].role == "Student" && db.users[i].status == "Active") {
        found = db.users[i];
        break;
      }
    }
  }

  if (!found && db.users && db.users.length > 0) {
    for (let i = 0; i < db.users.length; i++) {
      if (db.users[i].role == "Student") {
        found = db.users[i];
        break;
      }
    }
  }

  if (found) {
    sessionStorage.setItem("lhtmp_current_user", JSON.stringify(found));
  }

  return found;
}

function setupHeaderAndNav(db, student) {
  let headerTitle = document.getElementById("headerGreeting");
  let headerUserAvatar = document.getElementById("headerAvatar");
  let headerUserName = document.getElementById("headerUserName");
  let headerUserMeta = document.getElementById("headerUserMeta");
  let btnNotif = document.getElementById("btnNotification");
  let notifBadge = document.getElementById("notifBadge");
  let btnLogout = document.getElementById("btnLogout");

  let fullName = student ? student.fullName : "Student";
  let firstName = fullName;
  let spIdx = fullName.indexOf(" ");
  if (spIdx != -1) {
    firstName = fullName.substring(0, spIdx);
  }

  if (headerTitle) {
    headerTitle.textContent = "Welcome back, " + firstName + "!";
  }

  if (headerUserName) {
    headerUserName.textContent = firstName;
  }

  if (headerUserMeta) {
    let gr = student && student.grade ? student.grade : "Grade 10";
    let under = gr.indexOf("_");
    if (under != -1) gr = gr.substring(0, under);
    let div = student && student.division ? student.division : "Dhaka";
    headerUserMeta.textContent = gr + " • " + div;
  }

  if (headerUserAvatar) {
    let avatarUrl = resolveUserAvatar(student);
    headerUserAvatar.innerHTML = '<img src="' + avatarUrl + '" alt="Avatar" class="header-user-img" onerror="this.src=\'../Files/Img/Profile/student.svg\'">';
  }

  let activeAlerts = [];
  if (db.alerts) {
    for (let i = 0; i < db.alerts.length; i++) {
      let a = db.alerts[i];
      if (a.status == "Active" && (a.target == "All Users" || a.target == "Students & Tutors" || a.category == "Global" || a.category == "Academic")) {
        activeAlerts.push(a);
      }
    }
  }

  if (notifBadge) {
    notifBadge.textContent = "" + activeAlerts.length;
    if (activeAlerts.length == 0) {
      notifBadge.style.display = "none";
    } else {
      notifBadge.style.display = "flex";
    }
  }

  if (btnNotif) {
    btnNotif.onclick = function () {
      let content = "";
      if (activeAlerts.length > 0) {
        for (let i = 0; i < activeAlerts.length; i++) {
          let al = activeAlerts[i];
          content += '<div class="modal-notif-item">';
          content += '<div class="modal-notif-header">';
          content += '<strong>' + getText(al.title) + '</strong>';
          content += '<span class="badge">' + getText(al.category) + '</span>';
          content += '</div>';
          content += '<p class="modal-notif-meta">Target: ' + getText(al.target) + ' | Date: ' + formatDateTime(al.date) + '</p>';
          content += '</div>';
        }
      } else {
        content = '<p class="modal-notif-empty">No active notifications at this time.</p>';
      }
      showModal("Student Notifications (" + activeAlerts.length + ")", content);
    };
  }

  if (btnLogout) {
    btnLogout.onclick = function () {
      sessionStorage.removeItem("lhtmp_current_user");
      window.location.href = "../Login/login.html";
    };
  }
}

function initDashboard(db, student) {
  let upcomingCountEl = document.getElementById("statUpcomingSessions");
  let activeTutorsCountEl = document.getElementById("statActiveTutors");
  let materialsCountEl = document.getElementById("statStudyMaterials");
  let avgRatingEl = document.getElementById("statAvgRating");

  let studentId = student ? student.id : "";
  let studentSessions = [];
  if (db.sessions) {
    for (let i = 0; i < db.sessions.length; i++) {
      let s = db.sessions[i];
      if (!studentId || s.studentId == studentId || s.studentId == "USR-1005") {
        studentSessions.push(s);
      }
    }
  }

  let upcomingSessions = [];
  let pastSessions = [];
  let tutorsSet = [];

  for (let i = 0; i < studentSessions.length; i++) {
    let s = studentSessions[i];
    if (s.status == "Confirmed" || s.status == "Pending") {
      upcomingSessions.push(s);
    } else {
      pastSessions.push(s);
    }
    if (s.tutorName && tutorsSet.indexOf(s.tutorName) == -1) {
      tutorsSet.push(s.tutorName);
    }
  }

  if (upcomingCountEl) {
    upcomingCountEl.textContent = "" + upcomingSessions.length;
  }
  if (activeTutorsCountEl) {
    activeTutorsCountEl.textContent = "" + tutorsSet.length;
  }
  if (materialsCountEl) {
    let matCount = db.studyMaterials ? db.studyMaterials.length : 0;
    materialsCountEl.textContent = "" + matCount;
  }
  if (avgRatingEl) {
    let totalRate = 0;
    let rateCount = 0;
    if (db.reviews) {
      for (let i = 0; i < db.reviews.length; i++) {
        let r = db.reviews[i];
        if (!studentId || r.studentId == studentId || r.studentId == "USR-1005") {
          let num = parseFloat(r.rating) || 5.0;
          totalRate += num;
          rateCount++;
        }
      }
    }
    let avg = rateCount > 0 ? (totalRate / rateCount).toFixed(1) : "5.0";
    avgRatingEl.textContent = avg + "⭐";
  }

  let dashSessionsTbody = document.getElementById("dashUpcomingSessionsBody");
  if (dashSessionsTbody) {
    let html = "";
    let displayList = upcomingSessions.slice(0, 5);
    if (displayList.length == 0) {
      html = '<tr><td colspan="6" class="text-center">No upcoming sessions scheduled. Book a new session below.</td></tr>';
    } else {
      for (let i = 0; i < displayList.length; i++) {
        let s = displayList[i];
        let badgeClass = s.status == "Confirmed" ? "confirmed" : "pending";
        html += '<tr>';
        html += '<td><span class="subject-chip">' + getText(s.subject) + '</span></td>';
        html += '<td>' + getText(s.tutorName) + '</td>';
        html += '<td>' + getText(s.date) + '</td>';
        html += '<td>' + getText(s.time) + '</td>';
        html += '<td><span class="status-badge ' + badgeClass + '">' + getText(s.status) + '</span></td>';
        html += '<td>';
        if (s.status == "Confirmed") {
          html += '<button type="button" class="btn-table-join" data-id="' + s.id + '" data-tutor="' + s.tutorName + '" data-subject="' + s.subject + '">Join</button>';
        } else {
          html += '<button type="button" class="btn-table-cancel" data-id="' + s.id + '" data-tutor="' + s.tutorName + '">Cancel</button>';
        }
        html += '</td>';
        html += '</tr>';
      }
    }
    dashSessionsTbody.innerHTML = html;

    let joinBtns = dashSessionsTbody.getElementsByClassName("btn-table-join");
    for (let i = 0; i < joinBtns.length; i++) {
      let btn = joinBtns[i];
      btn.onclick = function () {
        let tName = btn.getAttribute("data-tutor");
        let subj = btn.getAttribute("data-subject");
        showModal("Virtual Classroom Connection", "<p>Connecting to virtual classroom with <strong>" + tName + "</strong> for <strong>" + subj + "</strong>...</p><p>Audio and video feeds initializing.</p>");
      };
    }

    let cancelBtns = dashSessionsTbody.getElementsByClassName("btn-table-cancel");
    for (let i = 0; i < cancelBtns.length; i++) {
      let btn = cancelBtns[i];
      btn.onclick = function () {
        let sid = btn.getAttribute("data-id");
        let tName = btn.getAttribute("data-tutor");
        for (let k = 0; k < db.sessions.length; k++) {
          if (db.sessions[k].id == sid) {
            db.sessions[k].status = "Cancelled";
            break;
          }
        }
        writeDatabase(db, function () {
          initDashboard(db, student);
          showModal("Session Cancelled", "<p>Your session with <strong>" + tName + "</strong> has been cancelled successfully.</p>");
        });
      };
    }
  }

  let dashFeaturedTutorsGrid = document.getElementById("dashFeaturedTutorsGrid");
  if (dashFeaturedTutorsGrid) {
    let tList = db.tutorProfiles ? db.tutorProfiles.slice(0, 3) : [];
    let html = "";
    for (let i = 0; i < tList.length; i++) {
      let tp = tList[i];
      let avatarLetter = tp.name.length > 0 ? tp.name.charAt(0) : "T";
      html += '<div class="tutor-card">';
      html += '<div class="tutor-avatar-row">';
      html += '<div class="tutor-avatar">' + avatarLetter + '</div>';
      html += '<div>';
      html += '<div class="tutor-name">' + getText(tp.name) + '</div>';
      html += '<div class="tutor-subject">' + getText(tp.subjects) + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div>';
      html += '<span class="tutor-stars">⭐⭐⭐⭐⭐</span>';
      html += '<span class="tutor-rating-text">' + getText(tp.rating) + ' (' + getText(tp.reviewCount) + ' reviews)</span>';
      html += '</div>';
      html += '<div class="tutor-meta">';
      html += '<div class="tutor-meta-item">💰 <span class="tutor-rate">৳' + getText(tp.rate) + '/hr</span></div>';
      html += '<div class="tutor-meta-item">📍 ' + getText(tp.location) + '</div>';
      html += '<div class="tutor-meta-item">📚 ' + getText(tp.experience) + '</div>';
      html += '</div>';
      html += '<button type="button" class="btn-book" data-tutor="' + tp.name + '" data-subject="' + tp.subjects + '">Book Session</button>';
      html += '</div>';
    }
    dashFeaturedTutorsGrid.innerHTML = html;

    let bookBtns = dashFeaturedTutorsGrid.getElementsByClassName("btn-book");
    for (let i = 0; i < bookBtns.length; i++) {
      let btn = bookBtns[i];
      btn.onclick = function () {
        let tName = btn.getAttribute("data-tutor");
        let tSubj = btn.getAttribute("data-subject");
        openBookingModal(db, student, tName, tSubj);
      };
    }
  }

  let dashStudyMaterialsBody = document.getElementById("dashStudyMaterialsBody");
  if (dashStudyMaterialsBody) {
    let mList = db.studyMaterials ? db.studyMaterials.slice(0, 3) : [];
    let html = "";
    for (let i = 0; i < mList.length; i++) {
      let sm = mList[i];
      html += '<tr>';
      html += '<td>📄 ' + getText(sm.title) + '</td>';
      html += '<td><span class="subject-chip">' + getText(sm.subject) + '</span></td>';
      html += '<td>' + getText(sm.tutorName) + '</td>';
      html += '<td>' + getText(sm.date) + '</td>';
      html += '<td><button type="button" class="btn-download" data-file="' + sm.fileName + '" data-title="' + sm.title + '">Download</button></td>';
      html += '</tr>';
    }
    dashStudyMaterialsBody.innerHTML = html;

    let dlBtns = dashStudyMaterialsBody.getElementsByClassName("btn-download");
    for (let i = 0; i < dlBtns.length; i++) {
      let btn = dlBtns[i];
      btn.onclick = function () {
        let fTitle = btn.getAttribute("data-title");
        let fName = btn.getAttribute("data-file");
        showModal("Download Started", "<p>Downloading <strong>" + fTitle + "</strong> (" + fName + ")...</p><p>File saved to your downloads folder.</p>");
      };
    }
  }
}

function openBookingModal(db, student, tutorName, defaultSubject) {
  let sId = student ? student.id : "USR-1005";
  let content = '';
  content += '<div class="modal-form-group">';
  content += '<label>Selected Tutor</label>';
  content += '<input type="text" id="modalBookingTutor" value="' + tutorName + '" readonly disabled class="input-readonly">';
  content += '</div>';
  content += '<div class="modal-form-group">';
  content += '<label>Subject</label>';
  content += '<input type="text" id="modalBookingSubject" value="' + (defaultSubject || "Mathematics") + '">';
  content += '</div>';
  content += '<div class="modal-form-group">';
  content += '<label>Session Date</label>';
  content += '<input type="date" id="modalBookingDate" value="2026-11-25">';
  content += '</div>';
  content += '<div class="modal-form-group">';
  content += '<label>Preferred Timing</label>';
  content += '<select id="modalBookingTime">';
  content += '<option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>';
  content += '<option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM</option>';
  content += '<option value="04:00 PM - 05:30 PM" selected>04:00 PM - 05:30 PM</option>';
  content += '<option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>';
  content += '<option value="06:00 PM - 07:30 PM">06:00 PM - 07:30 PM</option>';
  content += '</select>';
  content += '</div>';
  content += '<div class="modal-form-group">';
  content += '<label>Class Mode</label>';
  content += '<select id="modalBookingMode">';
  content += '<option value="Online Video" selected>Online Video</option>';
  content += '<option value="Home Visit">Home Visit</option>';
  content += '</select>';
  content += '</div>';

  showModal("Book Tuition Session with " + tutorName, content, function () {
    let subjInput = document.getElementById("modalBookingSubject");
    let dateInput = document.getElementById("modalBookingDate");
    let timeInput = document.getElementById("modalBookingTime");
    let modeInput = document.getElementById("modalBookingMode");

    let subj = subjInput ? cleanInputText(subjInput.value) : "General Studies";
    let dateVal = dateInput && dateInput.value ? dateInput.value : "2026-11-25";
    let timeVal = timeInput ? timeInput.value : "4:00 PM - 5:30 PM";
    let modeVal = modeInput ? modeInput.value : "Online Video";

    let newId = "SES-" + (100 + (db.sessions ? db.sessions.length : 0) + 1);
    let newSession = {
      id: newId,
      studentId: sId,
      subject: subj,
      tutorName: tutorName,
      date: dateVal,
      time: timeVal,
      mode: modeVal,
      status: "Confirmed",
      duration: "1.5 hrs"
    };

    if (!db.sessions) db.sessions = [];
    db.sessions.push(newSession);

    writeDatabase(db, function () {
      showModal("Booking Confirmed!", "<p>Your session with <strong>" + tutorName + "</strong> for <strong>" + subj + "</strong> has been confirmed for " + dateVal + " at " + timeVal + ".</p>");
      initDashboard(db, student);
      initMySessions(db, student);
    });
  });
}

function initFindTutors(db, student) {
  let grid = document.getElementById("findTutorsGrid");
  let searchInput = document.getElementById("searchTutorInput");
  let selectSubject = document.getElementById("filterSubjectSelect");
  let selectRate = document.getElementById("filterRateSelect");
  let btnSearch = document.getElementById("btnSearchTutors");
  let badgeCount = document.getElementById("tutorsCountBadge");

  if (!grid) return;

  let allTutors = db.tutorProfiles || [];

  function render(list) {
    let html = "";
    if (list.length == 0) {
      html = '<div class="tutor-card full-width text-center"><p>No tutors matched your filter criteria. Try clearing filters.</p></div>';
    } else {
      for (let i = 0; i < list.length; i++) {
        let tp = list[i];
        let avatarLetter = tp.name && tp.name.length > 0 ? tp.name.charAt(0) : "T";
        html += '<div class="tutor-card">';
        html += '<div class="tutor-avatar-row">';
        html += '<div class="tutor-avatar">' + avatarLetter + '</div>';
        html += '<div>';
        html += '<div class="tutor-name">' + getText(tp.name) + '</div>';
        html += '<div class="tutor-subject">' + getText(tp.subjects) + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div>';
        html += '<span class="tutor-stars">⭐⭐⭐⭐⭐</span>';
        html += '<span class="tutor-rating-text">' + getText(tp.rating) + ' (' + getText(tp.reviewCount) + ' reviews)</span>';
        html += '</div>';
        html += '<div class="tutor-meta">';
        html += '<div class="tutor-meta-item">💰 <span class="tutor-rate">৳' + getText(tp.rate) + '/hr</span></div>';
        html += '<div class="tutor-meta-item">📍 ' + getText(tp.location) + '</div>';
        html += '<div class="tutor-meta-item">📚 ' + getText(tp.experience) + '</div>';
        html += '</div>';
        html += '<button type="button" class="btn-book" data-tutor="' + tp.name + '" data-subject="' + tp.subjects + '">Book Session</button>';
        html += '</div>';
      }
    }
    grid.innerHTML = html;

    if (badgeCount) {
      badgeCount.textContent = list.length + " Tutors Available";
    }

    let bookBtns = grid.getElementsByClassName("btn-book");
    for (let i = 0; i < bookBtns.length; i++) {
      let btn = bookBtns[i];
      btn.onclick = function () {
        let tName = btn.getAttribute("data-tutor");
        let tSubj = btn.getAttribute("data-subject");
        openBookingModal(db, student, tName, tSubj);
      };
    }
  }

  function applyFilter() {
    let q = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";
    let sSubj = selectSubject ? selectSubject.value.toLowerCase() : "";
    let sRate = selectRate ? selectRate.value : "";

    let result = [];
    for (let i = 0; i < allTutors.length; i++) {
      let tp = allTutors[i];
      let matchesQ = true;
      if (q.length > 0) {
        let matchName = tp.name.toLowerCase().indexOf(q) != -1;
        let matchSubj = tp.subjects.toLowerCase().indexOf(q) != -1;
        let matchLoc = tp.location.toLowerCase().indexOf(q) != -1;
        matchesQ = matchName || matchSubj || matchLoc;
      }

      let matchesSubj = true;
      if (sSubj.length > 0) {
        matchesSubj = tp.subjects.toLowerCase().indexOf(sSubj) != -1;
      }

      let matchesRate = true;
      let rNum = parseInt(tp.rate, 10) || 500;
      if (sRate == "low") {
        matchesRate = rNum < 400;
      } else if (sRate == "mid") {
        matchesRate = rNum >= 400 && rNum <= 500;
      } else if (sRate == "high") {
        matchesRate = rNum > 500;
      }

      if (matchesQ && matchesSubj && matchesRate) {
        result.push(tp);
      }
    }

    render(result);
  }

  if (btnSearch) {
    btnSearch.onclick = applyFilter;
  }
  if (searchInput) {
    searchInput.onkeyup = applyFilter;
  }
  if (selectSubject) {
    selectSubject.onchange = applyFilter;
  }
  if (selectRate) {
    selectRate.onchange = applyFilter;
  }

  render(allTutors);
}

function initMySessions(db, student) {
  let upcomingTbody = document.getElementById("upcomingSessionsBody");
  let pastTbody = document.getElementById("pastSessionsBody");

  if (!upcomingTbody && !pastTbody) return;

  let sId = student ? student.id : "USR-1005";
  let allSessions = db.sessions || [];

  let upcoming = [];
  let past = [];

  for (let i = 0; i < allSessions.length; i++) {
    let s = allSessions[i];
    if (s.studentId == sId || s.studentId == "USR-1005") {
      if (s.status == "Confirmed" || s.status == "Pending") {
        upcoming.push(s);
      } else {
        past.push(s);
      }
    }
  }

  if (upcomingTbody) {
    let html = "";
    if (upcoming.length == 0) {
      html = '<tr><td colspan="7" class="text-center">No upcoming sessions. Click + Book New Session to schedule one.</td></tr>';
    } else {
      for (let i = 0; i < upcoming.length; i++) {
        let s = upcoming[i];
        let badgeClass = s.status == "Confirmed" ? "confirmed" : "pending";
        html += '<tr>';
        html += '<td><span class="subject-chip">' + getText(s.subject) + '</span></td>';
        html += '<td>' + getText(s.tutorName) + '</td>';
        html += '<td>' + getText(s.date) + '</td>';
        html += '<td>' + getText(s.time) + '</td>';
        html += '<td>' + getText(s.mode) + '</td>';
        html += '<td><span class="status-badge ' + badgeClass + '">' + getText(s.status) + '</span></td>';
        html += '<td>';
        html += '<div class="table-action-group">';
        if (s.status == "Confirmed") {
          html += '<button type="button" class="btn-table-join" data-id="' + s.id + '" data-tutor="' + s.tutorName + '" data-subject="' + s.subject + '">Join</button>';
        }
        html += '<button type="button" class="btn-table-reschedule" data-id="' + s.id + '" data-tutor="' + s.tutorName + '">Reschedule</button>';
        html += '<button type="button" class="btn-table-cancel" data-id="' + s.id + '" data-tutor="' + s.tutorName + '">Cancel</button>';
        html += '</div>';
        html += '</td>';
        html += '</tr>';
      }
    }
    upcomingTbody.innerHTML = html;

    let joinBtns = upcomingTbody.getElementsByClassName("btn-table-join");
    for (let i = 0; i < joinBtns.length; i++) {
      let btn = joinBtns[i];
      btn.onclick = function () {
        let tName = btn.getAttribute("data-tutor");
        let subj = btn.getAttribute("data-subject");
        showModal("Virtual Classroom", "<p>Connecting to classroom with <strong>" + tName + "</strong> for <strong>" + subj + "</strong>.</p>");
      };
    }

    let reschedBtns = upcomingTbody.getElementsByClassName("btn-table-reschedule");
    for (let i = 0; i < reschedBtns.length; i++) {
      let btn = reschedBtns[i];
      btn.onclick = function () {
        let sid = btn.getAttribute("data-id");
        let tName = btn.getAttribute("data-tutor");
        let content = '';
        content += '<div class="modal-form-group">';
        content += '<label>Tutor</label>';
        content += '<input type="text" value="' + tName + '" readonly disabled class="input-readonly">';
        content += '</div>';
        content += '<div class="modal-form-group">';
        content += '<label>New Session Date</label>';
        content += '<input type="date" id="modalReschedDate" value="2026-11-28">';
        content += '</div>';
        content += '<div class="modal-form-group">';
        content += '<label>New Time Slot</label>';
        content += '<select id="modalReschedTime">';
        content += '<option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM</option>';
        content += '<option value="04:00 PM - 05:30 PM" selected>04:00 PM - 05:30 PM</option>';
        content += '<option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>';
        content += '<option value="06:00 PM - 07:30 PM">06:00 PM - 07:30 PM</option>';
        content += '</select>';
        content += '</div>';

        showModal("Reschedule Session", content, function () {
          let dInput = document.getElementById("modalReschedDate");
          let tInput = document.getElementById("modalReschedTime");
          let nDate = dInput && dInput.value ? dInput.value : "2026-11-28";
          let nTime = tInput ? tInput.value : "4:00 PM - 5:30 PM";

          for (let k = 0; k < db.sessions.length; k++) {
            if (db.sessions[k].id == sid) {
              db.sessions[k].date = nDate;
              db.sessions[k].time = nTime;
              break;
            }
          }
          writeDatabase(db, function () {
            initMySessions(db, student);
            showModal("Session Rescheduled", "<p>Your session with <strong>" + tName + "</strong> has been rescheduled to " + nDate + " at " + nTime + ".</p>");
          });
        });
      };
    }

    let cancelBtns = upcomingTbody.getElementsByClassName("btn-table-cancel");
    for (let i = 0; i < cancelBtns.length; i++) {
      let btn = cancelBtns[i];
      btn.onclick = function () {
        let sid = btn.getAttribute("data-id");
        let tName = btn.getAttribute("data-tutor");
        for (let k = 0; k < db.sessions.length; k++) {
          if (db.sessions[k].id == sid) {
            db.sessions[k].status = "Cancelled";
            break;
          }
        }
        writeDatabase(db, function () {
          initMySessions(db, student);
          showModal("Session Cancelled", "<p>Your session with <strong>" + tName + "</strong> was cancelled.</p>");
        });
      };
    }
  }

  if (pastTbody) {
    let html = "";
    if (past.length == 0) {
      html = '<tr><td colspan="7" class="text-center">No past session history recorded.</td></tr>';
    } else {
      for (let i = 0; i < past.length; i++) {
        let s = past[i];
        let badgeClass = s.status == "Completed" ? "completed" : "cancelled";
        html += '<tr>';
        html += '<td><span class="subject-chip">' + getText(s.subject) + '</span></td>';
        html += '<td>' + getText(s.tutorName) + '</td>';
        html += '<td>' + getText(s.date) + '</td>';
        html += '<td>' + getText(s.duration) + '</td>';
        html += '<td>' + getText(s.mode) + '</td>';
        html += '<td><span class="status-badge ' + badgeClass + '">' + getText(s.status) + '</span></td>';
        html += '<td>';
        if (s.status == "Completed") {
          html += '<button type="button" class="btn-secondary btn-review-tutor" data-tutor="' + s.tutorName + '" data-subject="' + s.subject + '">Review Tutor</button>';
        } else {
          html += '<button type="button" class="btn-secondary btn-rebook-tutor" data-tutor="' + s.tutorName + '" data-subject="' + s.subject + '">Rebook</button>';
        }
        html += '</td>';
        html += '</tr>';
      }
    }
    pastTbody.innerHTML = html;

    let reviewBtns = pastTbody.getElementsByClassName("btn-review-tutor");
    for (let i = 0; i < reviewBtns.length; i++) {
      let btn = reviewBtns[i];
      btn.onclick = function () {
        let t = btn.getAttribute("data-tutor");
        let sub = btn.getAttribute("data-subject");
        window.location.href = "reviews.html?tutor=" + encodeURIComponent(t) + "&subject=" + encodeURIComponent(sub);
      };
    }

    let rebookBtns = pastTbody.getElementsByClassName("btn-rebook-tutor");
    for (let i = 0; i < rebookBtns.length; i++) {
      let btn = rebookBtns[i];
      btn.onclick = function () {
        let t = btn.getAttribute("data-tutor");
        let sub = btn.getAttribute("data-subject");
        openBookingModal(db, student, t, sub);
      };
    }
  }
}

function initStudyMaterials(db, student) {
  let tbody = document.getElementById("studyMaterialsBody");
  let searchInput = document.getElementById("searchMaterialsInput");
  let selectSubject = document.getElementById("filterMaterialsSubject");
  let btnSearch = document.getElementById("btnSearchMaterials");
  let badgeCount = document.getElementById("materialsCountBadge");
  let btnRequestNotes = document.getElementById("btnRequestNotes");

  if (!tbody) return;

  let allMaterials = db.studyMaterials || [];

  function render(list) {
    let html = "";
    if (list.length == 0) {
      html = '<tr><td colspan="6" class="text-center">No study materials found matching your search.</td></tr>';
    } else {
      for (let i = 0; i < list.length; i++) {
        let sm = list[i];
        html += '<tr>';
        html += '<td>📄 ' + getText(sm.title) + '</td>';
        html += '<td><span class="subject-chip">' + getText(sm.subject) + '</span></td>';
        html += '<td>' + getText(sm.tutorName) + '</td>';
        html += '<td>' + getText(sm.fileType) + ' (' + getText(sm.fileSize) + ')</td>';
        html += '<td>' + getText(sm.date) + '</td>';
        html += '<td><button type="button" class="btn-download" data-file="' + sm.fileName + '" data-title="' + sm.title + '">Download</button></td>';
        html += '</tr>';
      }
    }
    tbody.innerHTML = html;

    if (badgeCount) {
      badgeCount.textContent = list.length + " Materials Available";
    }

    let dlBtns = tbody.getElementsByClassName("btn-download");
    for (let i = 0; i < dlBtns.length; i++) {
      let btn = dlBtns[i];
      btn.onclick = function () {
        let fTitle = btn.getAttribute("data-title");
        let fName = btn.getAttribute("data-file");
        showModal("Download Started", "<p>Downloading <strong>" + fTitle + "</strong> (" + fName + ")...</p><p>Document successfully saved to your downloads folder.</p>");
      };
    }
  }

  function applyFilter() {
    let q = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";
    let sSubj = selectSubject ? selectSubject.value.toLowerCase() : "";

    let result = [];
    for (let i = 0; i < allMaterials.length; i++) {
      let sm = allMaterials[i];
      let matchesQ = true;
      if (q.length > 0) {
        let matchTitle = sm.title.toLowerCase().indexOf(q) != -1;
        let matchSubj = sm.subject.toLowerCase().indexOf(q) != -1;
        let matchTutor = sm.tutorName.toLowerCase().indexOf(q) != -1;
        matchesQ = matchTitle || matchSubj || matchTutor;
      }

      let matchesSubj = true;
      if (sSubj.length > 0) {
        matchesSubj = sm.subject.toLowerCase().indexOf(sSubj) != -1;
      }

      if (matchesQ && matchesSubj) {
        result.push(sm);
      }
    }
    render(result);
  }

  if (btnSearch) {
    btnSearch.onclick = applyFilter;
  }
  if (searchInput) {
    searchInput.onkeyup = applyFilter;
  }
  if (selectSubject) {
    selectSubject.onchange = applyFilter;
  }

  if (btnRequestNotes) {
    btnRequestNotes.onclick = function () {
      let tutorsOptions = '';
      if (db.tutorProfiles) {
        for (let i = 0; i < db.tutorProfiles.length; i++) {
          tutorsOptions += '<option value="' + db.tutorProfiles[i].name + '">' + db.tutorProfiles[i].name + ' (' + db.tutorProfiles[i].subjects + ')</option>';
        }
      }
      let content = '';
      content += '<div class="modal-form-group">';
      content += '<label>Select Tutor</label>';
      content += '<select id="reqNotesTutor">' + tutorsOptions + '</select>';
      content += '</div>';
      content += '<div class="modal-form-group">';
      content += '<label>Subject & Chapter</label>';
      content += '<input type="text" id="reqNotesTopic" placeholder="e.g. Higher Math Chapter 5 Practice Worksheets">';
      content += '</div>';
      content += '<div class="modal-form-group">';
      content += '<label>Additional Instructions (Optional)</label>';
      content += '<textarea id="reqNotesDetails" rows="3" placeholder="Specify any particular derivations, formula sheets, or board question sets needed..."></textarea>';
      content += '</div>';

      showModal("Request Notes from Tutor", content, function () {
        let tSelect = document.getElementById("reqNotesTutor");
        let topInput = document.getElementById("reqNotesTopic");
        let tName = tSelect ? tSelect.value : "Tutor";
        let topic = topInput ? cleanInputText(topInput.value) : "Study Materials";
        showModal("Request Submitted", "<p>Your note request for <strong>" + topic + "</strong> has been submitted to <strong>" + tName + "</strong>.</p><p>You will be notified once the materials are uploaded.</p>");
      });
    };
  }

  render(allMaterials);
}

function initMySchedule(db, student) {
  let container = document.getElementById("scheduleGridContainer");
  let btnPrint = document.getElementById("btnPrintRoutine");

  if (btnPrint) {
    btnPrint.onclick = function () {
      window.print();
    };
  }

  if (!container) return;

  let sId = student ? student.id : "USR-1005";
  let userSchedule = [];
  if (db.schedule) {
    for (let i = 0; i < db.schedule.length; i++) {
      let sc = db.schedule[i];
      if (sc.studentId == sId || sc.studentId == "USR-1005") {
        userSchedule.push(sc);
      }
    }
  }

  let days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let daySlots = {};
  for (let i = 0; i < days.length; i++) {
    daySlots[days[i]] = [];
  }

  for (let i = 0; i < userSchedule.length; i++) {
    let sc = userSchedule[i];
    let d = sc.day;
    if (daySlots[d]) {
      daySlots[d].push(sc);
    }
  }

  let html = "";
  for (let i = 0; i < days.length; i++) {
    let dayName = days[i];
    let slots = daySlots[dayName];
    let isToday = dayName == "Sunday";
    let headerLabel = isToday ? dayName + " (Today)" : dayName;

    html += '<div class="schedule-day-column">';
    html += '<div class="schedule-day-header">' + headerLabel + '</div>';

    if (slots.length == 0) {
      html += '<div class="schedule-slot-card free-slot">';
      html += '<div class="schedule-slot-time">No Classes</div>';
      html += '<div class="schedule-slot-subj">Free Day</div>';
      html += '<a href="find_tutors.html"><button type="button" class="btn-secondary schedule-btn-mini">+ Add Class</button></a>';
      html += '</div>';
    } else {
      for (let s = 0; s < slots.length; s++) {
        let slot = slots[s];
        html += '<div class="schedule-slot-card slot-green">';
        html += '<div class="schedule-slot-time">' + getText(slot.time) + '</div>';
        html += '<div class="schedule-slot-subj">';
        html += '<strong>' + getText(slot.subject) + '</strong><br>';
        html += 'Tutor: ' + getText(slot.tutorName) + '<br>';
        html += 'Mode: ' + getText(slot.mode);
        html += '</div>';
        if (isToday) {
          html += '<button type="button" class="btn-table-join schedule-btn-mini btn-join-slot" data-tutor="' + slot.tutorName + '" data-subj="' + slot.subject + '">Join Class</button>';
        } else {
          html += '<button type="button" class="btn-secondary schedule-btn-mini btn-details-slot" data-tutor="' + slot.tutorName + '" data-subj="' + slot.subject + '" data-time="' + slot.time + '" data-mode="' + slot.mode + '">Details</button>';
        }
        html += '</div>';
      }
    }
    html += '</div>';
  }

  container.innerHTML = html;

  let joinBtns = container.getElementsByClassName("btn-join-slot");
  for (let i = 0; i < joinBtns.length; i++) {
    let btn = joinBtns[i];
    btn.onclick = function () {
      let t = btn.getAttribute("data-tutor");
      let s = btn.getAttribute("data-subj");
      showModal("Connecting to Classroom", "<p>Connecting to virtual classroom with <strong>" + t + "</strong> for <strong>" + s + "</strong>.</p>");
    };
  }

  let detailsBtns = container.getElementsByClassName("btn-details-slot");
  for (let i = 0; i < detailsBtns.length; i++) {
    let btn = detailsBtns[i];
    btn.onclick = function () {
      let t = btn.getAttribute("data-tutor");
      let s = btn.getAttribute("data-subj");
      let tm = btn.getAttribute("data-time");
      let m = btn.getAttribute("data-mode");
      showModal("Session Routine Details", "<p><strong>Subject:</strong> " + s + "</p><p><strong>Tutor:</strong> " + t + "</p><p><strong>Time:</strong> " + tm + "</p><p><strong>Mode:</strong> " + m + "</p>");
    };
  }
}

function initReviews(db, student) {
  let selectTutor = document.getElementById("selectTutor");
  let ratingStars = document.getElementById("ratingStars");
  let reviewTitle = document.getElementById("reviewTitle");
  let reviewComments = document.getElementById("reviewComments");
  let formReview = document.getElementById("formReview");
  let reviewList = document.getElementById("reviewList");
  let reviewsCountBadge = document.getElementById("reviewsCountBadge");
  let btnSubmitReview = document.getElementById("btnSubmitReview");

  if (!reviewList) return;

  let sId = student ? student.id : "USR-1005";

  if (selectTutor) {
    let html = '<option value="">-- Choose Tutor --</option>';
    let seenTutors = [];
    if (db.tutorProfiles) {
      for (let i = 0; i < db.tutorProfiles.length; i++) {
        let tp = db.tutorProfiles[i];
        if (seenTutors.indexOf(tp.name) == -1) {
          seenTutors.push(tp.name);
          html += '<option value="' + tp.name + '">' + tp.name + ' (' + tp.subjects + ')</option>';
        }
      }
    }
    selectTutor.innerHTML = html;

    let paramTutor = getQueryParam("tutor");
    if (paramTutor && paramTutor.length > 0) {
      for (let i = 0; i < selectTutor.options.length; i++) {
        if (selectTutor.options[i].value.toLowerCase().indexOf(paramTutor.toLowerCase()) != -1) {
          selectTutor.selectedIndex = i;
          break;
        }
      }
    }
  }

  let paramSubj = getQueryParam("subject");
  if (paramSubj && paramSubj.length > 0 && reviewTitle && reviewTitle.value.length == 0) {
    reviewTitle.value = "Great experience in " + paramSubj + "!";
  }

  function render() {
    let allReviews = db.reviews || [];
    let myReviews = [];
    for (let i = 0; i < allReviews.length; i++) {
      let r = allReviews[i];
      if (r.studentId == sId || r.studentId == "USR-1005") {
        myReviews.push(r);
      }
    }

    if (reviewsCountBadge) {
      reviewsCountBadge.textContent = myReviews.length + " Reviews";
    }

    let html = "";
    if (myReviews.length == 0) {
      html = '<div class="review-item text-center"><p>You have not submitted any reviews yet.</p></div>';
    } else {
      for (let i = 0; i < myReviews.length; i++) {
        let r = myReviews[i];
        let rNum = parseFloat(r.rating) || 5.0;
        let starStr = rNum >= 4.5 ? "⭐⭐⭐⭐⭐" : (rNum >= 3.5 ? "⭐⭐⭐⭐☆" : "⭐⭐⭐☆☆");
        html += '<div class="review-item">';
        html += '<div class="review-item-header">';
        html += '<div>';
        html += '<span class="review-tutor-name">' + getText(r.tutorName) + '</span>';
        html += '<span class="review-subject-tag">(' + getText(r.subject) + ')</span>';
        html += '</div>';
        html += '<div class="review-rating-star">';
        html += starStr + ' <strong class="review-rating-val">' + rNum.toFixed(1) + '</strong>';
        html += '</div>';
        html += '</div>';
        html += '<div class="review-item-headline">' + getText(r.headline) + '</div>';
        html += '<p class="review-text">' + getText(r.feedback) + '</p>';
        html += '<div class="review-item-footer">';
        html += '<span class="review-item-date">Posted on ' + getText(r.date) + '</span>';
        html += '<div class="review-item-btns">';
        html += '<button type="button" class="btn-secondary btn-edit-review" data-id="' + r.id + '">Edit</button>';
        html += '<button type="button" class="btn-danger btn-delete-review" data-id="' + r.id + '">Delete</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      }
    }
    reviewList.innerHTML = html;

    let editBtns = reviewList.getElementsByClassName("btn-edit-review");
    for (let i = 0; i < editBtns.length; i++) {
      let btn = editBtns[i];
      btn.onclick = function () {
        let rid = btn.getAttribute("data-id");
        for (let k = 0; k < db.reviews.length; k++) {
          if (db.reviews[k].id == rid) {
            let tr = db.reviews[k];
            editingReviewId = rid;
            if (selectTutor) selectTutor.value = tr.tutorName;
            if (reviewTitle) reviewTitle.value = tr.headline;
            if (reviewComments) reviewComments.value = tr.feedback;
            if (ratingStars) {
              let rInt = Math.round(parseFloat(tr.rating) || 5);
              ratingStars.value = "" + rInt;
            }
            if (btnSubmitReview) {
              btnSubmitReview.textContent = "Update Review";
            }
            if (formReview) {
              formReview.scrollIntoView({ behavior: "smooth" });
            }
            break;
          }
        }
      };
    }

    let deleteBtns = reviewList.getElementsByClassName("btn-delete-review");
    for (let i = 0; i < deleteBtns.length; i++) {
      let btn = deleteBtns[i];
      btn.onclick = function () {
        let rid = btn.getAttribute("data-id");
        let updatedList = [];
        for (let k = 0; k < db.reviews.length; k++) {
          if (db.reviews[k].id != rid) {
            updatedList.push(db.reviews[k]);
          }
        }
        db.reviews = updatedList;
        writeDatabase(db, function () {
          render();
          showModal("Review Removed", "<p>Your review has been successfully removed.</p>");
        });
      };
    }
  }

  if (formReview) {
    formReview.onsubmit = function (e) {
      e.preventDefault();

      let tName = selectTutor ? selectTutor.value : "";
      let rStars = ratingStars ? ratingStars.value : "5";
      let hLine = reviewTitle ? cleanInputText(reviewTitle.value) : "";
      let fBack = reviewComments ? cleanInputText(reviewComments.value) : "";

      if (tName == "" || hLine == "" || fBack == "") {
        showModal("Incomplete Form", "<p>Please select a tutor, rating, headline, and detailed feedback.</p>");
        return;
      }

      let subName = "Tuition Course";
      if (db.tutorProfiles) {
        for (let i = 0; i < db.tutorProfiles.length; i++) {
          if (db.tutorProfiles[i].name == tName) {
            subName = db.tutorProfiles[i].subjects;
            break;
          }
        }
      }

      if (editingReviewId) {
        for (let i = 0; i < db.reviews.length; i++) {
          if (db.reviews[i].id == editingReviewId) {
            db.reviews[i].tutorName = tName;
            db.reviews[i].subject = subName;
            db.reviews[i].rating = rStars + ".0";
            db.reviews[i].headline = hLine;
            db.reviews[i].feedback = fBack;
            break;
          }
        }
        editingReviewId = null;
        if (btnSubmitReview) btnSubmitReview.textContent = "Submit Review";
      } else {
        let newId = "REV-" + (300 + (db.reviews ? db.reviews.length : 0) + 1);
        let newRev = {
          id: newId,
          studentId: sId,
          tutorName: tName,
          subject: subName,
          rating: rStars + ".0",
          headline: hLine,
          feedback: fBack,
          date: "Today, 26 Oct 2026"
        };
        if (!db.reviews) db.reviews = [];
        db.reviews.unshift(newRev);
      }

      writeDatabase(db, function () {
        formReview.reset();
        render();
        showModal("Review Submitted!", "<p>Thank you for submitting your feedback for <strong>" + tName + "</strong>.</p>");
      });
    };
  }

  render();
}

function initProfile(db, student) {
  let profileContainer = document.getElementById("profileDetailsContainer");
  if (!profileContainer) return;

  if (!student) {
    student = {
      id: "USR-1005",
      fullName: "Siam Rahman",
      email: "siam.rahman@gmail.com",
      phone: "01711223344",
      dob: "2006-08-15",
      gender: "Male",
      division: "Dhaka",
      area: "Mirpur",
      grade: "Class 10_General",
      role: "Student",
      status: "Active",
      date: "2025-01-15 10:00",
      image: "../Files/Img/Profile/student.svg"
    };
  }

  let avatarUrl = resolveUserAvatar(student);

  let rawGrade = student.grade || "Class 10_General";
  let gradeDisplay = rawGrade;
  let underIdx = rawGrade.indexOf("_");
  if (underIdx != -1) {
    let mainG = rawGrade.substring(0, underIdx);
    let detailG = rawGrade.substring(underIdx + 1);
    gradeDisplay = mainG + " (" + detailG + ")";
  }

  let html = '';
  html += '<div class="profile-card-layout">';
  html += '<div class="profile-summary-box">';
  html += '<div class="profile-summary-avatar">';
  html += '<img src="' + avatarUrl + '" alt="Avatar" class="profile-avatar-img" onerror="this.src=\'../Files/Img/Profile/student.svg\'">';
  html += '</div>';
  html += '<div class="profile-summary-name" id="dispSummaryName">' + getText(student.fullName) + '</div>';
  html += '<p class="profile-summary-id" id="dispSummaryId">Student ID: ' + getText(student.id) + '</p>';
  html += '<span class="status-badge active">' + getText(student.status) + ' Student</span>';
  html += '<div class="profile-summary-meta">';
  html += '<div>📍 <strong>Location:</strong> ' + getText(student.area) + ', ' + getText(student.division) + '</div>';
  html += '<div>🎓 <strong>Level:</strong> ' + gradeDisplay + '</div>';
  html += '<div>👤 <strong>Role:</strong> ' + getText(student.role) + '</div>';
  html += '<div>📅 <strong>Enrolled:</strong> ' + getText(student.date) + '</div>';
  html += '</div>';

  html += '<div class="profile-actions-bar">';
  html += '<a href="../Registration/edit_profile.html?id=' + encodeURIComponent(student.id) + '&from=student" id="linkEditProfile" class="w-full">';
  html += '<button type="button" class="btn-primary w-full" id="btnEditProfile">Edit Profile</button>';
  html += '</a>';
  html += '</div>';

  html += '</div>';

  html += '<div class="profile-view-grid">';
  html += '<div class="profile-detail-card">';
  html += '<div class="profile-card-title">Academic & Institutional Information</div>';
  html += '<div class="profile-fields-grid">';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Student ID</span>';
  html += '<div class="profile-field-value">' + getText(student.id) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Full Name</span>';
  html += '<div class="profile-field-value">' + getText(student.fullName) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Grade / Class</span>';
  html += '<div class="profile-field-value">' + gradeDisplay + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Account Role</span>';
  html += '<div class="profile-field-value">' + getText(student.role) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Division</span>';
  html += '<div class="profile-field-value">' + getText(student.division) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Local Area</span>';
  html += '<div class="profile-field-value">' + getText(student.area) + '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  html += '<div class="profile-detail-card">';
  html += '<div class="profile-card-title">Personal & Contact Details</div>';
  html += '<div class="profile-fields-grid">';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Email Address</span>';
  html += '<div class="profile-field-value">' + getText(student.email) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Mobile Phone</span>';
  html += '<div class="profile-field-value">' + getText(student.phone) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Date of Birth</span>';
  html += '<div class="profile-field-value">' + getText(student.dob) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row">';
  html += '<span class="profile-field-label">Gender</span>';
  html += '<div class="profile-field-value">' + getText(student.gender) + '</div>';
  html += '</div>';

  html += '<div class="profile-field-row full-width">';
  html += '<span class="profile-field-label">Account Registration Date</span>';
  html += '<div class="profile-field-value">' + formatDateTime(student.date) + '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  profileContainer.innerHTML = html;

  let btnEdit = document.getElementById("btnEditProfile");
  if (btnEdit) {
    btnEdit.onclick = function () {
      window.location.href = "../Registration/edit_profile.html?id=" + encodeURIComponent(student.id) + "&from=student";
    };
  }
}

async function initStudentPortal() {
  setupModal();

  if (typeof readDatabase === "function") {
    currentDb = await readDatabase();
  }

  if (!currentDb) {
    currentDb = {
      users: [],
      sessions: [],
      studyMaterials: [],
      reviews: [],
      schedule: [],
      tutorProfiles: [],
      alerts: []
    };
  }

  currentStudent = getCurrentStudent(currentDb);

  setupHeaderAndNav(currentDb, currentStudent);
  initDashboard(currentDb, currentStudent);
  initFindTutors(currentDb, currentStudent);
  initMySessions(currentDb, currentStudent);
  initStudyMaterials(currentDb, currentStudent);
  initMySchedule(currentDb, currentStudent);
  initReviews(currentDb, currentStudent);
  initProfile(currentDb, currentStudent);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudentPortal);
} else {
  initStudentPortal();
}