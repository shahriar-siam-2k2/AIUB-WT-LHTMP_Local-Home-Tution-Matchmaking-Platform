let currentDb = null;
let currentLists = null;
let activeTutor = null;
let pageBooking = 1;
let pageProgress = 1;
let pageMaterials = 1;
let filterBooking = "All";
let searchBooking = "";
let filterReview = "All";
let sortReviewNewest = true;
let tempAvatarDataUrl = "";
let tempAvatarFileName = "";

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
  if (clean.length == 0) return "N/A";
  if (clean.indexOf("AM") != -1 || clean.indexOf("PM") != -1) {
    return clean;
  }
  let spaceIdx = clean.indexOf(" ");
  let datePart = spaceIdx != -1 ? clean.substring(0, spaceIdx) : clean;
  let timePart = spaceIdx != -1 ? clean.substring(spaceIdx + 1) : "";

  let year = "2026";
  let month = "11";
  let day = "14";

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

function getStatusBadge(status) {
  if (!status || status == "") {
    return '<span class="status-badge">N/A</span>';
  }
  let s = ("" + status).toLowerCase();
  if (s == "confirmed" || s == "active" || s == "completed" || s == "available for payout" || s == "verified") {
    return '<span class="status-badge active">' + status + '</span>';
  } else if (s.indexOf("pending") != -1 || s == "review") {
    return '<span class="status-badge pending">' + status + '</span>';
  } else if (s == "declined" || s == "cancelled" || s.indexOf("suspended") != -1) {
    return '<span class="status-badge suspended">' + status + '</span>';
  } else {
    return '<span class="status-badge">' + status + '</span>';
  }
}

function showModal(title, contentHtml) {
  let modal = document.getElementById("simpleModal");
  let mTitle = document.getElementById("simpleModalTitle");
  let mBody = document.getElementById("simpleModalBody");
  if (!modal || !mTitle || !mBody) return;
  mTitle.innerHTML = title;
  mBody.innerHTML = contentHtml;
  modal.style.display = "flex";
}

function hideModal() {
  let modal = document.getElementById("simpleModal");
  if (modal) modal.style.display = "none";
}

function setupModalButtons() {
  let closeBtn = document.getElementById("btnModalClose");
  let okBtn = document.getElementById("btnModalOk");
  let modal = document.getElementById("simpleModal");

  if (closeBtn) {
    closeBtn.onclick = hideModal;
  }
  if (okBtn) {
    okBtn.onclick = hideModal;
  }
  if (modal) {
    modal.onclick = function (e) {
      if (e.target === modal) hideModal();
    };
  }
}

function setupLogoutButtons() {
  let btns = document.getElementsByClassName("btn-logout");
  for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function () {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("lhtmp_current_user");
      }
      window.location.href = "../Login/login.html";
    };
  }
}

function setupNotificationButton() {
  let btns = document.getElementsByClassName("notif-btn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function () {
      let content = "<div>";
      let activeAlerts = [];
      if (currentDb && currentDb.alerts) {
        for (let j = 0; j < currentDb.alerts.length; j++) {
          let a = currentDb.alerts[j];
          let cat = (a.target || "").toLowerCase();
          if (a.status && a.status.toLowerCase() == "active") {
            if (cat.indexOf("all") != -1 || cat.indexOf("tutor") != -1) {
              activeAlerts.push(a);
            }
          }
        }
      }

      let pendingReqCount = 0;
      if (currentDb && currentDb.bookingRequests) {
        for (let j = 0; j < currentDb.bookingRequests.length; j++) {
          let b = currentDb.bookingRequests[j];
          if ((b.status || "").toLowerCase() == "pending") {
            pendingReqCount++;
          }
        }
      }

      if (pendingReqCount > 0) {
        content += "<div class='modal-notif-item'>";
        content += "<div class='modal-notif-header'>";
        content += "<strong>Incoming Booking Inquiries (" + pendingReqCount + ")</strong>";
        content += "<span class='badge'>Action Required</span>";
        content += "</div>";
        content += "<p class='modal-notif-meta'>You have " + pendingReqCount + " pending tuition booking requests awaiting your review.</p>";
        content += "</div>";
      }

      if (activeAlerts.length > 0) {
        for (let k = 0; k < activeAlerts.length; k++) {
          let a = activeAlerts[k];
          content += "<div class='modal-notif-item'>";
          content += "<div class='modal-notif-header'>";
          content += "<strong>" + getText(a.title) + "</strong>";
          content += "<span class='badge'>" + getText(a.category) + "</span>";
          content += "</div>";
          content += "<p class='modal-notif-meta'>Target: " + getText(a.target) + " | Date: " + formatDateTime(a.date) + "</p>";
          content += "</div>";
        }
      }

      if (pendingReqCount == 0 && activeAlerts.length == 0) {
        content += "<p class='modal-notif-empty'>No active broadcast alerts or system notifications.</p>";
      }
      content += "</div>";
      showModal("Tutor Notifications", content);
    };
  }
}

function getCurrentTutor() {
  let loggedIn = null;
  try {
    let s = sessionStorage.getItem("lhtmp_current_user");
    if (s) loggedIn = JSON.parse(s);
  } catch (e) {}

  if (loggedIn && currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.id == loggedIn.id || (u.email && u.email.toLowerCase() == (loggedIn.email || "").toLowerCase())) {
        return u;
      }
    }
  }

  if (currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if ((u.role || "").toLowerCase() == "tutor") {
        return u;
      }
    }
  }

  return {
    id: "USR-1003",
    fullName: "Nowrrin Kabir",
    email: "jerin@gmail.com",
    phone: "01957495765",
    password: "jerin",
    dob: "2003-06-03",
    gender: "Female",
    division: "Barishal",
    area: "Bhola",
    grade: "Graduate_BSc. EEE, BUET",
    role: "Tutor",
    status: "Active",
    date: "2025-01-12 14:15",
    image: "../Files/Img/Profile/tutor.svg"
  };
}

function updateHeaderAndUserInfo() {
  if (!activeTutor) return;
  let userAvatarEls = document.getElementsByClassName("user-avatar");
  for (let i = 0; i < userAvatarEls.length; i++) {
    let avatarSrc = resolveUserAvatar(activeTutor);
    userAvatarEls[i].innerHTML = '<img src="' + avatarSrc + '" alt="Avatar" class="avatar-preview-img" onerror="this.src=\'../Files/Img/Profile/default.svg\'">';
  }

  let userInfoEls = document.getElementsByClassName("user-info");
  for (let i = 0; i < userInfoEls.length; i++) {
    let spans = userInfoEls[i].getElementsByTagName("span");
    if (spans.length >= 2) {
      spans[0].textContent = activeTutor.fullName;
      spans[1].textContent = activeTutor.role + " Account";
    }
  }

  let notifBadges = document.getElementsByClassName("notif-badge");
  let pendingCount = 0;
  if (currentDb && currentDb.bookingRequests) {
    for (let j = 0; j < currentDb.bookingRequests.length; j++) {
      if ((currentDb.bookingRequests[j].status || "").toLowerCase() == "pending") {
        pendingCount++;
      }
    }
  }
  for (let i = 0; i < notifBadges.length; i++) {
    notifBadges[i].textContent = "" + pendingCount;
  }
}

function updateTablePagination(prefix, currentPage, totalPages, onPageChange) {
  let prevBtn = document.getElementById("btnPrev" + prefix);
  let nextBtn = document.getElementById("btnNext" + prefix);
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    if (currentPage <= 1) {
      prevBtn.className = "btn-secondary btn-table-disabled";
    } else {
      prevBtn.className = "btn-secondary";
    }
    prevBtn.onclick = function () {
      if (currentPage > 1) onPageChange(currentPage - 1);
    };
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    if (currentPage >= totalPages) {
      nextBtn.className = "btn-secondary btn-table-disabled";
    } else {
      nextBtn.className = "btn-secondary";
    }
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

function initDashboardPage() {
  let requestsTbody = document.getElementById("dashBookingTbody");
  if (!requestsTbody) return;

  let allRequests = (currentDb && currentDb.bookingRequests) ? currentDb.bookingRequests : [];
  let pendingList = [];
  for (let i = 0; i < allRequests.length; i++) {
    if ((allRequests[i].status || "").toLowerCase() == "pending") {
      pendingList.push(allRequests[i]);
    }
  }

  let enrolledLearners = (currentDb && currentDb.studentProgress) ? currentDb.studentProgress.length : 6;
  let earningsMonth = "৳18,495";
  if (currentDb && currentDb.tutorEarnings && currentDb.tutorEarnings.length > 0) {
    earningsMonth = currentDb.tutorEarnings[0].net || "৳18,495";
  }

  let avgRatingVal = "4.9";
  let revCount = 42;
  if (currentDb && currentDb.tutorReviews && currentDb.tutorReviews.length > 0) {
    let sum = 0;
    revCount = currentDb.tutorReviews.length;
    for (let r = 0; r < revCount; r++) {
      sum += parseFloat(currentDb.tutorReviews[r].rating) || 5;
    }
    avgRatingVal = (sum / revCount).toFixed(1);
  }

  let statCards = document.getElementsByClassName("stat-card");
  if (statCards.length >= 4) {
    let val0 = statCards[0].getElementsByClassName("stat-value");
    if (val0.length > 0) val0[0].textContent = "" + enrolledLearners;
    let val1 = statCards[1].getElementsByClassName("stat-value");
    if (val1.length > 0) val1[0].textContent = "" + pendingList.length;
    let val2 = statCards[2].getElementsByClassName("stat-value");
    if (val2.length > 0) val2[0].textContent = earningsMonth;
    let val3 = statCards[3].getElementsByClassName("stat-value");
    if (val3.length > 0) val3[0].textContent = avgRatingVal;
  }

  let html = "";
  if (pendingList.length == 0) {
    html = "<tr><td colspan='7' class='text-meta-small'>No pending booking requests.</td></tr>";
  } else {
    let maxRows = pendingList.length < 5 ? pendingList.length : 5;
    for (let i = 0; i < maxRows; i++) {
      let b = pendingList[i];
      html += "<tr>";
      html += "<td><strong>" + getText(b.studentName) + "</strong></td>";
      html += "<td><span class='subject-chip'>" + getText(b.subject) + "</span></td>";
      html += "<td>" + getText(b.grade) + "</td>";
      html += "<td>" + getText(b.dateTime) + "</td>";
      html += "<td>" + getText(b.mode) + "</td>";
      html += "<td>" + getStatusBadge(b.status) + "</td>";
      html += "<td>";
      html += "<button type='button' class='btn-success btn-action-sm' data-id='" + b.id + "' data-act='accept'>Accept</button> ";
      html += "<button type='button' class='btn-danger btn-action-sm' data-id='" + b.id + "' data-act='decline'>Decline</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  requestsTbody.innerHTML = html;

  let btns = requestsTbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let bid = btn.getAttribute("data-id");
    let act = btn.getAttribute("data-act");
    btn.onclick = function () {
      for (let j = 0; j < currentDb.bookingRequests.length; j++) {
        if (currentDb.bookingRequests[j].id == bid) {
          if (act == "accept") {
            currentDb.bookingRequests[j].status = "Confirmed";
            writeDatabase(currentDb, function () {
              showModal("Booking Confirmed", "<p>Tuition request from <strong>" + currentDb.bookingRequests[j].studentName + "</strong> has been confirmed.</p>");
              initDashboardPage();
              updateHeaderAndUserInfo();
            });
          } else {
            currentDb.bookingRequests[j].status = "Declined";
            writeDatabase(currentDb, function () {
              showModal("Booking Declined", "<p>Tuition request from <strong>" + currentDb.bookingRequests[j].studentName + "</strong> has been declined.</p>");
              initDashboardPage();
              updateHeaderAndUserInfo();
            });
          }
          break;
        }
      }
    };
  }

  let earningsTbody = document.getElementById("dashEarningsTbody");
  if (earningsTbody && currentDb && currentDb.tutorEarnings) {
    let eHtml = "";
    let eMax = currentDb.tutorEarnings.length < 3 ? currentDb.tutorEarnings.length : 3;
    for (let k = 0; k < eMax; k++) {
      let e = currentDb.tutorEarnings[k];
      eHtml += "<tr>";
      eHtml += "<td><strong>" + getText(e.month) + "</strong></td>";
      eHtml += "<td>" + getText(e.sessions) + "</td>";
      eHtml += "<td>" + getText(e.gross) + "</td>";
      eHtml += "<td>" + getText(e.commission) + "</td>";
      eHtml += "<td><strong>" + getText(e.net) + "</strong></td>";
      eHtml += "<td>" + getStatusBadge(e.status) + "</td>";
      eHtml += "</tr>";
    }
    earningsTbody.innerHTML = eHtml;
  }
}

function initProfilePage() {
  let profileBox = document.getElementById("tutorProfileInfoSection");
  if (!profileBox || !activeTutor) return;

  let profSummaryAvatar = document.getElementById("profileSummaryAvatar");
  let profSummaryName = document.getElementById("profileSummaryName");
  let profSummaryTitle = document.getElementById("profileSummaryTitle");
  let profSummaryBadge = document.getElementById("profileSummaryBadge");

  if (profSummaryAvatar) {
    let imgPath = resolveUserAvatar(activeTutor);
    profSummaryAvatar.innerHTML = '<img src="' + imgPath + '" alt="Avatar" class="avatar-preview-img" onerror="this.src=\'../Files/Img/Profile/default.svg\'">';
  }
  if (profSummaryName) {
    profSummaryName.textContent = activeTutor.fullName;
  }
  if (profSummaryTitle) {
    profSummaryTitle.textContent = activeTutor.grade != "N/A" ? activeTutor.grade : "Professional Tutor";
  }
  if (profSummaryBadge) {
    profSummaryBadge.textContent = activeTutor.status == "Active" ? "Verified Super Tutor" : activeTutor.status;
  }

  let infoHtml = "<div class='profile-info-grid'>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>User ID</span><span class='profile-info-value'>" + getText(activeTutor.id) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Account Role</span><span class='profile-info-value'>" + getText(activeTutor.role) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Full Name</span><span class='profile-info-value'>" + getText(activeTutor.fullName) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Email Address</span><span class='profile-info-value'>" + getText(activeTutor.email) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Contact Number</span><span class='profile-info-value'>" + getText(activeTutor.phone) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Date of Birth</span><span class='profile-info-value'>" + getText(activeTutor.dob) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Gender</span><span class='profile-info-value'>" + getText(activeTutor.gender) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Division & Area</span><span class='profile-info-value'>" + getText(activeTutor.area) + ", " + getText(activeTutor.division) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Academic Qualification</span><span class='profile-info-value'>" + getText(activeTutor.grade) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Account Status</span><span class='profile-info-value'>" + getStatusBadge(activeTutor.status) + "</span></div>";
  infoHtml += "<div class='profile-info-item'><span class='profile-info-label'>Member Since</span><span class='profile-info-value'>" + formatDateTime(activeTutor.date) + "</span></div>";
  infoHtml += "</div>";

  infoHtml += "<div class='profile-actions-bar'>";
  infoHtml += "<a href='edit_profile.html'>";
  infoHtml += "<button type='button' class='btn-primary' id='btnEditProfile'>Edit Profile</button>";
  infoHtml += "</a>";
  infoHtml += "</div>";

  profileBox.innerHTML = infoHtml;

  renderProfileSubjectsTable();
  setupAddSubjectForm();
}

function renderProfileSubjectsTable() {
  let tbody = document.getElementById("profileSubjectsTbody");
  if (!tbody || !currentDb || !currentDb.tutorSubjects) return;

  let html = "";
  if (currentDb.tutorSubjects.length == 0) {
    html = "<tr><td colspan='7' class='text-meta-small'>No subjects offered yet.</td></tr>";
  } else {
    for (let i = 0; i < currentDb.tutorSubjects.length; i++) {
      let s = currentDb.tutorSubjects[i];
      html += "<tr>";
      html += "<td><strong>" + getText(s.name) + "</strong></td>";
      html += "<td>" + getText(s.level) + "</td>";
      html += "<td>" + getText(s.curriculum) + "</td>";
      html += "<td><strong>" + getText(s.rate) + "</strong></td>";
      html += "<td>" + getText(s.mode) + "</td>";
      html += "<td>" + getStatusBadge(s.status) + "</td>";
      html += "<td>";
      html += "<button type='button' class='btn-secondary btn-action-sm' data-sid='" + s.id + "' data-act='edit'>Edit</button> ";
      html += "<button type='button' class='btn-danger btn-action-sm' data-sid='" + s.id + "' data-act='delete'>Remove</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tbody.innerHTML = html;

  let btns = tbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let sid = btn.getAttribute("data-sid");
    let act = btn.getAttribute("data-act");

    btn.onclick = function () {
      if (act == "delete") {
        let newList = [];
        for (let j = 0; j < currentDb.tutorSubjects.length; j++) {
          if (currentDb.tutorSubjects[j].id != sid) {
            newList.push(currentDb.tutorSubjects[j]);
          }
        }
        currentDb.tutorSubjects = newList;
        writeDatabase(currentDb, function () {
          showModal("Subject Removed", "<p>Subject offering removed successfully.</p>");
          renderProfileSubjectsTable();
        });
      } else if (act == "edit") {
        for (let j = 0; j < currentDb.tutorSubjects.length; j++) {
          let s = currentDb.tutorSubjects[j];
          if (s.id == sid) {
            let nameInput = document.getElementById("sub-name");
            let levelSelect = document.getElementById("sub-level");
            let currSelect = document.getElementById("sub-curr");
            let rateInput = document.getElementById("sub-rate");
            let modeSelect = document.getElementById("sub-mode");
            let maxInput = document.getElementById("sub-max");
            let descInput = document.getElementById("sub-desc");
            let form = document.getElementById("subjectOfferingForm");

            if (nameInput) nameInput.value = s.name;
            if (levelSelect) levelSelect.value = s.level;
            if (currSelect) currSelect.value = s.curriculum;
            let pureRate = "";
            for (let r = 0; r < s.rate.length; r++) {
              let c = s.rate.charCodeAt(r);
              if (c >= 48 && c <= 57) pureRate += s.rate.charAt(r);
            }
            if (rateInput) rateInput.value = pureRate;
            if (modeSelect) modeSelect.value = s.mode;
            if (maxInput) maxInput.value = s.maxStudents || "1";
            if (descInput) descInput.value = s.description != "N/A" ? s.description : "";

            if (form) {
              form.setAttribute("data-edit-id", sid);
              let submitBtn = document.getElementById("btnSaveSubject");
              if (submitBtn) submitBtn.textContent = "Update Subject Offering";
              form.scrollIntoView({ behavior: "smooth" });
            }
            break;
          }
        }
      }
    };
  }
}

function setupAddSubjectForm() {
  let form = document.getElementById("subjectOfferingForm");
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();
    let nameInput = document.getElementById("sub-name");
    let levelSelect = document.getElementById("sub-level");
    let currSelect = document.getElementById("sub-curr");
    let rateInput = document.getElementById("sub-rate");
    let modeSelect = document.getElementById("sub-mode");
    let maxInput = document.getElementById("sub-max");
    let descInput = document.getElementById("sub-desc");

    let subName = cleanInputText(nameInput.value);
    let subLevel = levelSelect.value;
    let subCurr = currSelect.value;
    let subRate = "৳" + cleanInputText(rateInput.value) + "/hr";
    let subMode = modeSelect.value;
    let subMax = cleanInputText(maxInput.value);
    let subDesc = cleanInputText(descInput.value);

    if (subName == "" || subLevel == "" || subCurr == "" || rateInput.value == "" || subMode == "") {
      showModal("Validation Error", "<p>Please fill in all mandatory subject fields.</p>");
      return;
    }

    let editId = form.getAttribute("data-edit-id");
    if (editId && editId.length > 0) {
      for (let i = 0; i < currentDb.tutorSubjects.length; i++) {
        if (currentDb.tutorSubjects[i].id == editId) {
          currentDb.tutorSubjects[i].name = subName;
          currentDb.tutorSubjects[i].level = subLevel;
          currentDb.tutorSubjects[i].curriculum = subCurr;
          currentDb.tutorSubjects[i].rate = subRate;
          currentDb.tutorSubjects[i].mode = subMode;
          currentDb.tutorSubjects[i].maxStudents = subMax;
          currentDb.tutorSubjects[i].description = subDesc.length > 0 ? subDesc : "N/A";
          break;
        }
      }
      form.removeAttribute("data-edit-id");
      let submitBtn = document.getElementById("btnSaveSubject");
      if (submitBtn) submitBtn.textContent = "Save Subject Offering";
    } else {
      let newId = "SUB-" + (101 + currentDb.tutorSubjects.length);
      currentDb.tutorSubjects.push({
        id: newId,
        tutorId: activeTutor ? activeTutor.id : "USR-1003",
        name: subName,
        level: subLevel,
        curriculum: subCurr,
        rate: subRate,
        mode: subMode,
        maxStudents: subMax,
        status: "Active",
        description: subDesc.length > 0 ? subDesc : "N/A"
      });
    }

    writeDatabase(currentDb, function () {
      showModal("Subject Saved", "<p>Subject offering <strong>" + subName + "</strong> has been saved.</p>");
      form.reset();
      renderProfileSubjectsTable();
    });
  };

  let resetBtn = document.getElementById("btnResetSubject");
  if (resetBtn) {
    resetBtn.onclick = function () {
      form.removeAttribute("data-edit-id");
      let submitBtn = document.getElementById("btnSaveSubject");
      if (submitBtn) submitBtn.textContent = "Save Subject Offering";
      form.reset();
    };
  }

  let scrollToBtn = document.getElementById("btnScrollToAddSubject");
  if (scrollToBtn) {
    scrollToBtn.onclick = function () {
      form.scrollIntoView({ behavior: "smooth" });
    };
  }
}

async function populateDivisionsAndAreas(divSelectId, areaSelectId, curDiv, curArea) {
  let divSelect = document.getElementById(divSelectId);
  let areaSelect = document.getElementById(areaSelectId);
  if (!divSelect || !areaSelect) return;

  if (typeof readLists === "function") {
    currentLists = await readLists();
  }

  let divList = [];
  if (currentLists && currentLists.divisions) {
    let keys = Object.keys(currentLists.divisions);
    for (let i = 0; i < keys.length; i++) {
      divList.push(keys[i]);
    }
  }
  if (divList.length == 0) {
    divList = ["Barisal", "Chittagong", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"];
  }

  let divHtml = "<option value='' disabled>Select Division</option>";
  for (let i = 0; i < divList.length; i++) {
    let sel = (curDiv && curDiv.toLowerCase() == divList[i].toLowerCase()) ? " selected" : "";
    divHtml += "<option value='" + divList[i] + "'" + sel + ">" + divList[i] + "</option>";
  }
  divSelect.innerHTML = divHtml;

  function updateAreas(selDiv, matchArea) {
    let areas = [];
    if (currentLists && currentLists.divisions && currentLists.divisions[selDiv]) {
      areas = currentLists.divisions[selDiv];
    } else {
      areas = ["Main City", "Area-1", "Area-2"];
    }
    let aHtml = "<option value='' disabled>Select Area</option>";
    for (let a = 0; a < areas.length; a++) {
      let isSel = (matchArea && matchArea.toLowerCase() == areas[a].toLowerCase()) ? " selected" : "";
      aHtml += "<option value='" + areas[a] + "'" + isSel + ">" + areas[a] + "</option>";
    }
    areaSelect.innerHTML = aHtml;
  }

  updateAreas(curDiv || divList[0], curArea);

  divSelect.onchange = function () {
    updateAreas(divSelect.value, "");
  };
}

function initEditProfilePage() {
  let form = document.getElementById("tutorEditProfileForm");
  if (!form || !activeTutor) return;

  let idInput = document.getElementById("editUserId");
  let roleInput = document.getElementById("editUserRole");
  let statusInput = document.getElementById("editUserStatus");
  let nameInput = document.getElementById("editFullName");
  let emailInput = document.getElementById("editEmail");
  let phoneInput = document.getElementById("editPhone");
  let dobInput = document.getElementById("editDob");
  let gradeSelect = document.getElementById("editGrade");
  let degreeInput = document.getElementById("editDegree");
  let passInput = document.getElementById("editPassword");
  let confirmPassInput = document.getElementById("editConfirmPassword");
  let avatarImg = document.getElementById("editAvatarPreview");
  let avatarFileInput = document.getElementById("editAvatarFile");

  if (idInput) idInput.value = activeTutor.id;
  if (roleInput) roleInput.value = activeTutor.role;
  if (statusInput) statusInput.value = activeTutor.status;
  if (nameInput) nameInput.value = activeTutor.fullName;
  if (emailInput) emailInput.value = activeTutor.email;
  if (phoneInput) phoneInput.value = activeTutor.phone;
  if (dobInput) dobInput.value = activeTutor.dob;
  if (passInput) passInput.value = activeTutor.password;
  if (confirmPassInput) confirmPassInput.value = activeTutor.password;

  let genderMale = document.getElementById("genderMale");
  let genderFemale = document.getElementById("genderFemale");
  if ((activeTutor.gender || "").toLowerCase() == "male" && genderMale) {
    genderMale.checked = true;
  } else if (genderFemale) {
    genderFemale.checked = true;
  }

  let rawGrade = activeTutor.grade || "";
  let underIdx = rawGrade.indexOf("_");
  let baseGrade = underIdx != -1 ? rawGrade.substring(0, underIdx) : rawGrade;
  let detailGrade = underIdx != -1 ? rawGrade.substring(underIdx + 1) : "";
  if (gradeSelect) gradeSelect.value = baseGrade;
  if (degreeInput) degreeInput.value = detailGrade;

  if (avatarImg) {
    avatarImg.src = resolveUserAvatar(activeTutor);
  }

  if (avatarFileInput) {
    avatarFileInput.onchange = function () {
      if (avatarFileInput.files && avatarFileInput.files.length > 0) {
        let file = avatarFileInput.files[0];
        tempAvatarFileName = file.name;
        let reader = new FileReader();
        reader.onload = function (e) {
          tempAvatarDataUrl = e.target.result;
          if (avatarImg) avatarImg.src = tempAvatarDataUrl;
        };
        reader.readAsDataURL(file);
      }
    };
  }

  populateDivisionsAndAreas("editDivision", "editArea", activeTutor.division, activeTutor.area);

  form.onsubmit = function (e) {
    e.preventDefault();

    let newName = cleanInputText(nameInput.value);
    let newEmail = cleanInputText(emailInput.value);
    let newPhone = cleanInputText(phoneInput.value);
    let newDob = dobInput.value;
    let newGrade = gradeSelect ? gradeSelect.value : "";
    let newDegree = degreeInput ? cleanInputText(degreeInput.value) : "";
    let newPass = passInput.value;
    let newConfirmPass = confirmPassInput.value;

    let divSelect = document.getElementById("editDivision");
    let areaSelect = document.getElementById("editArea");
    let newDiv = divSelect ? divSelect.value : activeTutor.division;
    let newArea = areaSelect ? areaSelect.value : activeTutor.area;

    let newGender = "Female";
    if (genderMale && genderMale.checked) newGender = "Male";

    if (newName == "" || newEmail == "" || newPhone == "" || newDob == "" || newPass == "") {
      showModal("Validation Error", "<p>Please fill in all mandatory fields.</p>");
      return;
    }

    if (newPhone.length != 11) {
      showModal("Validation Error", "<p>Phone number must be exactly 11 digits.</p>");
      return;
    }

    if (newPass != newConfirmPass) {
      showModal("Validation Error", "<p>Password and Confirm Password do not match.</p>");
      return;
    }

    for (let u = 0; u < currentDb.users.length; u++) {
      let other = currentDb.users[u];
      if (other.id != activeTutor.id) {
        if ((other.email || "").toLowerCase() == newEmail.toLowerCase()) {
          showModal("Duplicate Email", "<p>This email address is already in use by another account.</p>");
          return;
        }
        if (other.phone == newPhone) {
          showModal("Duplicate Phone", "<p>This phone number is already registered to another account.</p>");
          return;
        }
      }
    }

    let finalGrade = newGrade;
    if (newDegree.length > 0) {
      finalGrade = newGrade + "_" + newDegree;
    }

    let savedImg = activeTutor.image;
    if (tempAvatarFileName.length > 0) {
      savedImg = "../Files/Img/Profile/" + tempAvatarFileName;
      if (tempAvatarDataUrl.length > 0) {
        localStorage.setItem("lhtmp_avatar_" + activeTutor.id, tempAvatarDataUrl);
        localStorage.setItem("lhtmp_avatar_" + newEmail, tempAvatarDataUrl);
      }
    }

    activeTutor.fullName = newName;
    activeTutor.email = newEmail;
    activeTutor.phone = newPhone;
    activeTutor.dob = newDob;
    activeTutor.gender = newGender;
    activeTutor.division = newDiv;
    activeTutor.area = newArea;
    activeTutor.grade = finalGrade;
    activeTutor.password = newPass;
    activeTutor.image = savedImg;

    for (let u = 0; u < currentDb.users.length; u++) {
      if (currentDb.users[u].id == activeTutor.id) {
        currentDb.users[u] = activeTutor;
        break;
      }
    }

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("lhtmp_current_user", JSON.stringify(activeTutor));
    }

    writeDatabase(currentDb, function () {
      showModal("Profile Updated", "<p>Your profile information has been successfully updated.</p>");
      setTimeout(function () {
        window.location.href = "profile.html";
      }, 1000);
    });
  };
}

function initAvailabilityPage() {
  let avail = (currentDb && currentDb.tutorAvailability && currentDb.tutorAvailability.length > 0) ? currentDb.tutorAvailability[0] : null;

  let form = document.getElementById("availabilitySettingsForm");
  let startTimeInput = document.getElementById("start-time");
  let endTimeInput = document.getElementById("end-time");
  let durationSelect = document.getElementById("duration");
  let bufferSelect = document.getElementById("buffer");
  let vacationInput = document.getElementById("vacation-note");

  if (avail) {
    if (startTimeInput) startTimeInput.value = avail.startTime;
    if (endTimeInput) endTimeInput.value = avail.endTime;
    if (durationSelect) durationSelect.value = avail.sessionDuration;
    if (bufferSelect) bufferSelect.value = avail.bufferMinutes;
    if (vacationInput) vacationInput.value = avail.vacationNote != "N/A" ? avail.vacationNote : "";

    let dayBoxes = document.getElementsByName("workdays");
    let activeDays = (avail.workdays || "").split(",");
    for (let d = 0; d < dayBoxes.length; d++) {
      let isChecked = false;
      for (let k = 0; k < activeDays.length; k++) {
        if (cleanInputText(activeDays[k]) == dayBoxes[d].value) {
          isChecked = true;
          break;
        }
      }
      dayBoxes[d].checked = isChecked;
    }
  }

  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      let dayBoxes = document.getElementsByName("workdays");
      let selectedDays = [];
      for (let d = 0; d < dayBoxes.length; d++) {
        if (dayBoxes[d].checked) selectedDays.push(dayBoxes[d].value);
      }

      let sTime = startTimeInput ? startTimeInput.value : "09:00";
      let eTime = endTimeInput ? endTimeInput.value : "20:30";
      let dur = durationSelect ? durationSelect.value : "90";
      let buf = bufferSelect ? bufferSelect.value : "15";
      let vac = vacationInput ? cleanInputText(vacationInput.value) : "";

      if (!currentDb.tutorAvailability || currentDb.tutorAvailability.length == 0) {
        currentDb.tutorAvailability = [];
        currentDb.tutorAvailability.push({
          tutorId: activeTutor ? activeTutor.id : "USR-1003",
          startTime: sTime,
          endTime: eTime,
          sessionDuration: dur,
          bufferMinutes: buf,
          workdays: selectedDays.join(","),
          vacationNote: vac.length > 0 ? vac : "N/A",
          totalHours: (selectedDays.length * 4.5) + " hrs",
          workingDaysCount: selectedDays.length + " Days",
          bookedSlotsCount: "16",
          openSlotsCount: "8"
        });
      } else {
        currentDb.tutorAvailability[0].startTime = sTime;
        currentDb.tutorAvailability[0].endTime = eTime;
        currentDb.tutorAvailability[0].sessionDuration = dur;
        currentDb.tutorAvailability[0].bufferMinutes = buf;
        currentDb.tutorAvailability[0].workdays = selectedDays.join(",");
        currentDb.tutorAvailability[0].vacationNote = vac.length > 0 ? vac : "N/A";
        currentDb.tutorAvailability[0].workingDaysCount = selectedDays.length + " Days";
      }

      writeDatabase(currentDb, function () {
        showModal("Availability Saved", "<p>Working hour preferences and teaching days saved successfully.</p>");
      });
    };
  }

  let btnSelectAll = document.getElementById("btnSelectAllSlots");
  let btnResetWeekend = document.getElementById("btnResetWeekendSlots");
  let btnSaveSlots = document.getElementById("btnSaveSlots");
  let slotButtons = document.getElementsByClassName("slot-item");

  for (let i = 0; i < slotButtons.length; i++) {
    let btn = slotButtons[i];
    if (btn.className.indexOf("booked") == -1) {
      btn.onclick = function () {
        if (btn.className.indexOf("active") != -1) {
          btn.className = "slot-item";
        } else {
          btn.className = "slot-item active";
        }
      };
    }
  }

  if (btnSelectAll) {
    btnSelectAll.onclick = function () {
      for (let i = 0; i < slotButtons.length; i++) {
        if (slotButtons[i].className.indexOf("booked") == -1) {
          slotButtons[i].className = "slot-item active";
        }
      }
    };
  }

  if (btnResetWeekend) {
    btnResetWeekend.onclick = function () {
      let weekendSlots = document.getElementsByClassName("slot-weekend");
      for (let i = 0; i < weekendSlots.length; i++) {
        if (weekendSlots[i].className.indexOf("booked") == -1) {
          weekendSlots[i].className = "slot-item slot-weekend";
        }
      }
      showModal("Weekend Reset", "<p>Friday and Saturday slots have been toggled off.</p>");
    };
  }

  if (btnSaveSlots) {
    btnSaveSlots.onclick = function () {
      let activeCount = 0;
      for (let i = 0; i < slotButtons.length; i++) {
        if (slotButtons[i].className.indexOf("active") != -1) {
          activeCount++;
        }
      }
      showModal("Schedule Synchronized", "<p>" + activeCount + " weekly teaching slots are open for student bookings.</p>");
    };
  }
}

function initBookingRequestsPage() {
  let tbody = document.getElementById("bookingRequestsTbody");
  if (!tbody) return;

  let allRequests = (currentDb && currentDb.bookingRequests) ? currentDb.bookingRequests : [];

  let countAll = allRequests.length;
  let countPending = 0;
  let countConfirmed = 0;
  let countDeclined = 0;

  for (let i = 0; i < allRequests.length; i++) {
    let st = (allRequests[i].status || "").toLowerCase();
    if (st == "pending") countPending++;
    else if (st == "confirmed") countConfirmed++;
    else if (st == "declined") countDeclined++;
  }

  let statCards = document.getElementsByClassName("stat-card");
  if (statCards.length >= 4) {
    let val0 = statCards[0].getElementsByClassName("stat-value");
    if (val0.length > 0) val0[0].textContent = "" + countAll;
    let val1 = statCards[1].getElementsByClassName("stat-value");
    if (val1.length > 0) val1[0].textContent = "" + countPending;
    let val2 = statCards[2].getElementsByClassName("stat-value");
    if (val2.length > 0) val2[0].textContent = "" + countConfirmed;
    let val3 = statCards[3].getElementsByClassName("stat-value");
    if (val3.length > 0) val3[0].textContent = "" + countDeclined;
  }

  let filtered = [];
  for (let i = 0; i < allRequests.length; i++) {
    let b = allRequests[i];
    let matchFilter = true;
    if (filterBooking != "All") {
      if ((b.status || "").toLowerCase() != filterBooking.toLowerCase()) {
        matchFilter = false;
      }
    }
    if (matchFilter && searchBooking.length > 0) {
      let query = searchBooking.toLowerCase();
      let nameMatch = (b.studentName || "").toLowerCase().indexOf(query) != -1;
      let subMatch = (b.subject || "").toLowerCase().indexOf(query) != -1;
      if (!nameMatch && !subMatch) {
        matchFilter = false;
      }
    }
    if (matchFilter) {
      filtered.push(b);
    }
  }

  let rowsPerPage = 5;
  let totalPages = Math.ceil(filtered.length / rowsPerPage);
  if (totalPages < 1) totalPages = 1;
  if (pageBooking > totalPages) pageBooking = totalPages;

  let startIdx = (pageBooking - 1) * rowsPerPage;
  let endIdx = startIdx + rowsPerPage;
  let pageItems = [];
  for (let i = startIdx; i < endIdx && i < filtered.length; i++) {
    pageItems.push(filtered[i]);
  }

  let html = "";
  if (pageItems.length == 0) {
    html = "<tr><td colspan='8' class='text-meta-small'>No matching booking requests found.</td></tr>";
  } else {
    for (let i = 0; i < pageItems.length; i++) {
      let b = pageItems[i];
      html += "<tr>";
      html += "<td><strong>" + getText(b.id) + "</strong></td>";
      html += "<td><div><strong>" + getText(b.studentName) + "</strong></div><div class='text-meta-small'>Contact: " + getText(b.studentPhone) + "</div></td>";
      html += "<td><div><span class='subject-chip'>" + getText(b.subject) + "</span></div><div class='text-meta-small'>" + getText(b.grade) + "</div></td>";
      html += "<td>" + getText(b.dateTime) + "</td>";
      html += "<td>" + getText(b.mode) + "</td>";
      html += "<td><strong>" + getText(b.rate) + "</strong></td>";
      html += "<td>" + getStatusBadge(b.status) + "</td>";
      html += "<td>";
      if ((b.status || "").toLowerCase() == "pending") {
        html += "<button type='button' class='btn-success btn-action-sm' data-id='" + b.id + "' data-act='accept'>Accept</button> ";
        html += "<button type='button' class='btn-danger btn-action-sm' data-id='" + b.id + "' data-act='decline'>Decline</button> ";
      }
      html += "<button type='button' class='btn-secondary btn-action-sm' data-id='" + b.id + "' data-act='details'>View Details</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tbody.innerHTML = html;

  let btns = tbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let bid = btn.getAttribute("data-id");
    let act = btn.getAttribute("data-act");
    btn.onclick = function () {
      for (let j = 0; j < currentDb.bookingRequests.length; j++) {
        let req = currentDb.bookingRequests[j];
        if (req.id == bid) {
          if (act == "accept") {
            req.status = "Confirmed";
            writeDatabase(currentDb, function () {
              showModal("Request Accepted", "<p>Booking request <strong>#" + req.id + "</strong> from " + req.studentName + " has been accepted.</p>");
              initBookingRequestsPage();
              updateHeaderAndUserInfo();
            });
          } else if (act == "decline") {
            req.status = "Declined";
            writeDatabase(currentDb, function () {
              showModal("Request Declined", "<p>Booking request <strong>#" + req.id + "</strong> from " + req.studentName + " has been declined.</p>");
              initBookingRequestsPage();
              updateHeaderAndUserInfo();
            });
          } else if (act == "details") {
            let dHtml = "<div class='modal-details-grid'>";
            dHtml += "<div class='modal-label'>Request ID:</div><div class='modal-value'>" + req.id + "</div>";
            dHtml += "<div class='modal-label'>Student Name:</div><div class='modal-value'>" + req.studentName + "</div>";
            dHtml += "<div class='modal-label'>Phone:</div><div class='modal-value'>" + req.studentPhone + "</div>";
            dHtml += "<div class='modal-label'>Subject:</div><div class='modal-value'>" + req.subject + "</div>";
            dHtml += "<div class='modal-label'>Grade / Level:</div><div class='modal-value'>" + req.grade + "</div>";
            dHtml += "<div class='modal-label'>Schedule:</div><div class='modal-value'>" + req.dateTime + "</div>";
            dHtml += "<div class='modal-label'>Mode / Location:</div><div class='modal-value'>" + req.mode + "</div>";
            dHtml += "<div class='modal-label'>Offered Rate:</div><div class='modal-value'>" + req.rate + "</div>";
            dHtml += "<div class='modal-label'>Status:</div><div class='modal-value'>" + getStatusBadge(req.status) + "</div>";
            dHtml += "<div class='modal-label'>Remarks / Address:</div><div class='modal-value'>" + req.details + "</div>";
            dHtml += "</div>";
            showModal("Booking Request Details - #" + req.id, dHtml);
          }
          break;
        }
      }
    };
  }

  updateTablePagination("Booking", pageBooking, totalPages, function (newPage) {
    pageBooking = newPage;
    initBookingRequestsPage();
  });
}

function setupBookingFilters() {
  let filterBtns = document.getElementsByClassName("btn-filter-booking");
  for (let i = 0; i < filterBtns.length; i++) {
    let fBtn = filterBtns[i];
    fBtn.onclick = function () {
      for (let j = 0; j < filterBtns.length; j++) {
        filterBtns[j].className = "btn-filter btn-filter-booking";
      }
      fBtn.className = "btn-filter btn-filter-booking active";
      filterBooking = fBtn.getAttribute("data-filter") || "All";
      pageBooking = 1;
      initBookingRequestsPage();
    };
  }

  let searchInput = document.getElementById("searchBookingInput");
  let searchBtn = document.getElementById("btnSearchBooking");
  if (searchBtn && searchInput) {
    searchBtn.onclick = function () {
      searchBooking = cleanInputText(searchInput.value);
      pageBooking = 1;
      initBookingRequestsPage();
    };
  }
}

function initStudentProgressPage() {
  let tbody = document.getElementById("studentProgressTbody");
  if (!tbody) return;

  let allProgress = (currentDb && currentDb.studentProgress) ? currentDb.studentProgress : [];

  let rowsPerPage = 5;
  let totalPages = Math.ceil(allProgress.length / rowsPerPage);
  if (totalPages < 1) totalPages = 1;
  if (pageProgress > totalPages) pageProgress = totalPages;

  let startIdx = (pageProgress - 1) * rowsPerPage;
  let endIdx = startIdx + rowsPerPage;
  let pageItems = [];
  for (let i = startIdx; i < endIdx && i < allProgress.length; i++) {
    pageItems.push(allProgress[i]);
  }

  let html = "";
  if (pageItems.length == 0) {
    html = "<tr><td colspan='7' class='text-meta-small'>No enrolled students progress records.</td></tr>";
  } else {
    for (let i = 0; i < pageItems.length; i++) {
      let p = pageItems[i];
      let scoreVal = parseInt(p.latestScore, 10) || 0;
      html += "<tr>";
      html += "<td><div><strong>" + getText(p.studentName) + "</strong></div><div class='text-meta-small'>ID: " + getText(p.studentId) + "</div></td>";
      html += "<td><div><span class='subject-chip'>" + getText(p.subject) + "</span></div><div class='text-meta-small'>" + getText(p.grade) + "</div></td>";
      html += "<td><strong>" + getText(p.sessionsCompleted) + "</strong></td>";
      html += "<td><span class='status-badge active'>" + getText(p.attendanceRate) + "</span></td>";
      html += "<td><strong>" + getText(p.latestScore) + " / 100</strong><div class='progress-bar-container progress-bar-fixed-width'><div class='progress-bar-fill' style='width: " + scoreVal + "%;'></div></div></td>";
      html += "<td><strong>" + getText(p.syllabusDone) + "</strong></td>";
      html += "<td>";
      html += "<button type='button' class='btn-primary btn-action-sm' data-pid='" + p.id + "' data-act='update'>Update Progress</button> ";
      html += "<button type='button' class='btn-secondary btn-action-sm' data-pid='" + p.id + "' data-act='report'>Report Card</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tbody.innerHTML = html;

  let btns = tbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let pid = btn.getAttribute("data-pid");
    let act = btn.getAttribute("data-act");

    btn.onclick = function () {
      for (let j = 0; j < currentDb.studentProgress.length; j++) {
        let p = currentDb.studentProgress[j];
        if (p.id == pid) {
          if (act == "update") {
            let nameInput = document.getElementById("log-student");
            let subInput = document.getElementById("log-subject");
            let form = document.getElementById("progressLogForm");
            if (nameInput) nameInput.value = p.studentName;
            if (subInput) subInput.value = p.subject;
            if (form) {
              form.setAttribute("data-edit-pid", p.id);
              form.scrollIntoView({ behavior: "smooth" });
            }
          } else if (act == "report") {
            let rHtml = "<div class='modal-details-grid'>";
            rHtml += "<div class='modal-label'>Student Name:</div><div class='modal-value'>" + p.studentName + " (" + p.studentId + ")</div>";
            rHtml += "<div class='modal-label'>Subject & Grade:</div><div class='modal-value'>" + p.subject + " - " + p.grade + "</div>";
            rHtml += "<div class='modal-label'>Completed Sessions:</div><div class='modal-value'>" + p.sessionsCompleted + "</div>";
            rHtml += "<div class='modal-label'>Attendance:</div><div class='modal-value'>" + p.attendanceRate + "</div>";
            rHtml += "<div class='modal-label'>Recent Score:</div><div class='modal-value'>" + p.latestScore + " / 100</div>";
            rHtml += "<div class='modal-label'>Syllabus Completion:</div><div class='modal-value'>" + p.syllabusDone + "</div>";
            rHtml += "<div class='modal-label'>Teacher Assessment:</div><div class='modal-value'>" + p.remarks + "</div>";
            rHtml += "</div>";
            showModal("Student Academic Report Card", rHtml);
          }
          break;
        }
      }
    };
  }

  updateTablePagination("Progress", pageProgress, totalPages, function (newPage) {
    pageProgress = newPage;
    initStudentProgressPage();
  });

  setupProgressForm();
}

function setupProgressForm() {
  let form = document.getElementById("progressLogForm");
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();
    let nameInput = document.getElementById("log-student");
    let subInput = document.getElementById("log-subject");
    let attSelect = document.getElementById("log-att");
    let scoreInput = document.getElementById("log-score");
    let syllabusInput = document.getElementById("log-syllabus");
    let notesInput = document.getElementById("log-notes");

    let sName = cleanInputText(nameInput.value);
    let sSub = cleanInputText(subInput.value);
    let sAtt = attSelect ? attSelect.value : "Present";
    let sScore = scoreInput ? cleanInputText(scoreInput.value) : "85";
    let sSyllabus = syllabusInput ? cleanInputText(syllabusInput.value) : "80%";
    let sNotes = notesInput ? cleanInputText(notesInput.value) : "Session conducted smoothly.";

    if (sName == "" || sSub == "") {
      showModal("Validation Error", "<p>Please select a student and tuition subject.</p>");
      return;
    }

    let editPid = form.getAttribute("data-edit-pid");
    let matched = false;
    if (editPid) {
      for (let i = 0; i < currentDb.studentProgress.length; i++) {
        if (currentDb.studentProgress[i].id == editPid) {
          currentDb.studentProgress[i].latestScore = sScore;
          currentDb.studentProgress[i].syllabusDone = sSyllabus.indexOf("%") == -1 ? sSyllabus + "%" : sSyllabus;
          currentDb.studentProgress[i].remarks = sNotes;
          matched = true;
          break;
        }
      }
      form.removeAttribute("data-edit-pid");
    }

    if (!matched) {
      let newId = "PROG-" + (201 + currentDb.studentProgress.length);
      currentDb.studentProgress.push({
        id: newId,
        tutorId: activeTutor ? activeTutor.id : "USR-1003",
        studentName: sName,
        studentId: "STU-" + (8820 + currentDb.studentProgress.length),
        subject: sSub,
        grade: "Class 10 (SSC)",
        sessionsCompleted: "1 Sessions",
        attendanceRate: sAtt == "Present" ? "100%" : "0%",
        latestScore: sScore,
        syllabusDone: sSyllabus.indexOf("%") == -1 ? sSyllabus + "%" : sSyllabus,
        remarks: sNotes
      });
    }

    writeDatabase(currentDb, function () {
      showModal("Progress Logged", "<p>Session progress evaluation for <strong>" + sName + "</strong> has been saved.</p>");
      form.reset();
      initStudentProgressPage();
    });
  };

  let scrollBtn = document.getElementById("btnScrollToProgressForm");
  if (scrollBtn) {
    scrollBtn.onclick = function () {
      form.scrollIntoView({ behavior: "smooth" });
    };
  }
}

function initStudyMaterialsPage() {
  let tbody = document.getElementById("studyMaterialsTbody");
  if (!tbody) return;

  let allMaterials = (currentDb && currentDb.studyMaterials) ? currentDb.studyMaterials : [];

  let rowsPerPage = 5;
  let totalPages = Math.ceil(allMaterials.length / rowsPerPage);
  if (totalPages < 1) totalPages = 1;
  if (pageMaterials > totalPages) pageMaterials = totalPages;

  let startIdx = (pageMaterials - 1) * rowsPerPage;
  let endIdx = startIdx + rowsPerPage;
  let pageItems = [];
  for (let i = startIdx; i < endIdx && i < allMaterials.length; i++) {
    pageItems.push(allMaterials[i]);
  }

  let html = "";
  if (pageItems.length == 0) {
    html = "<tr><td colspan='7' class='text-meta-small'>No study materials uploaded.</td></tr>";
  } else {
    for (let i = 0; i < pageItems.length; i++) {
      let m = pageItems[i];
      html += "<tr>";
      html += "<td><div><strong>" + getText(m.title) + "</strong></div><div class='text-meta-small'>" + getText(m.fileName) + "</div></td>";
      html += "<td><span class='subject-chip'>" + getText(m.subject) + "</span></td>";
      html += "<td>" + getText(m.targetLevel) + "</td>";
      html += "<td>" + formatDateTime(m.uploadDate) + "</td>";
      html += "<td>" + getText(m.fileSize) + "</td>";
      html += "<td><strong>" + getText(m.downloads) + "</strong></td>";
      html += "<td>";
      html += "<button type='button' class='btn-secondary btn-action-sm' data-mid='" + m.id + "' data-act='download'>Download</button> ";
      html += "<button type='button' class='btn-danger btn-action-sm' data-mid='" + m.id + "' data-act='delete'>Delete</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tbody.innerHTML = html;

  let btns = tbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let mid = btn.getAttribute("data-mid");
    let act = btn.getAttribute("data-act");

    btn.onclick = function () {
      for (let j = 0; j < currentDb.studyMaterials.length; j++) {
        let m = currentDb.studyMaterials[j];
        if (m.id == mid) {
          if (act == "download") {
            let currentDl = parseInt(m.downloads, 10) || 0;
            m.downloads = "" + (currentDl + 1);
            writeDatabase(currentDb, function () {
              showModal("Download Resource", "<p>Downloading <strong>" + m.title + "</strong> (" + m.fileSize + ").</p>");
              initStudyMaterialsPage();
            });
          } else if (act == "delete") {
            let newList = [];
            for (let k = 0; k < currentDb.studyMaterials.length; k++) {
              if (currentDb.studyMaterials[k].id != mid) {
                newList.push(currentDb.studyMaterials[k]);
              }
            }
            currentDb.studyMaterials = newList;
            writeDatabase(currentDb, function () {
              showModal("File Deleted", "<p>Study resource <strong>" + m.title + "</strong> has been deleted from repository.</p>");
              initStudyMaterialsPage();
            });
          }
          break;
        }
      }
    };
  }

  updateTablePagination("Materials", pageMaterials, totalPages, function (newPage) {
    pageMaterials = newPage;
    initStudyMaterialsPage();
  });

  setupStudyMaterialsForm();
}

function setupStudyMaterialsForm() {
  let form = document.getElementById("studyMaterialUploadForm");
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();
    let titleInput = document.getElementById("material-title");
    let subSelect = document.getElementById("material-subject");
    let gradeSelect = document.getElementById("material-grade");
    let typeSelect = document.getElementById("material-type");
    let fileInput = document.getElementById("material-file");
    let notesInput = document.getElementById("material-notes");

    let mTitle = cleanInputText(titleInput.value);
    let mSub = subSelect.value;
    let mGrade = gradeSelect.value;
    let mType = typeSelect.value;
    let mNotes = notesInput ? cleanInputText(notesInput.value) : "";
    let fName = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : "Document.pdf";

    if (mTitle == "" || mSub == "" || mGrade == "" || mType == "") {
      showModal("Validation Error", "<p>Please fill in all resource details.</p>");
      return;
    }

    let newId = "MAT-" + (301 + currentDb.studyMaterials.length);
    currentDb.studyMaterials.push({
      id: newId,
      tutorId: activeTutor ? activeTutor.id : "USR-1003",
      title: mTitle,
      subject: mSub,
      targetLevel: mGrade,
      category: mType,
      fileName: fName,
      uploadDate: "2026-11-21",
      fileSize: "2.5 MB",
      downloads: "0",
      description: mNotes.length > 0 ? mNotes : "N/A"
    });

    writeDatabase(currentDb, function () {
      showModal("Resource Uploaded", "<p>Study material <strong>" + mTitle + "</strong> is now available for download.</p>");
      form.reset();
      initStudyMaterialsPage();
    });
  };
}

function initReviewsPage() {
  let container = document.getElementById("tutorReviewsContainer");
  if (!container) return;

  let allReviews = (currentDb && currentDb.tutorReviews) ? currentDb.tutorReviews : [];

  let star5Count = 0;
  let star4Count = 0;
  let star3Count = 0;
  let star2Count = 0;
  let star1Count = 0;

  for (let i = 0; i < allReviews.length; i++) {
    let r = parseInt(allReviews[i].rating, 10) || 5;
    if (r == 5) star5Count++;
    else if (r == 4) star4Count++;
    else if (r == 3) star3Count++;
    else if (r == 2) star2Count++;
    else star1Count++;
  }

  let totalRev = allReviews.length;
  if (totalRev == 0) totalRev = 1;

  let el5 = document.getElementById("barCount5");
  let el4 = document.getElementById("barCount4");
  let el3 = document.getElementById("barCount3");
  let el2 = document.getElementById("barCount2");
  let el1 = document.getElementById("barCount1");

  if (el5) el5.textContent = "" + star5Count;
  if (el4) el4.textContent = "" + star4Count;
  if (el3) el3.textContent = "" + star3Count;
  if (el2) el2.textContent = "" + star2Count;
  if (el1) el1.textContent = "" + star1Count;

  let fill5 = document.getElementById("barFill5");
  let fill4 = document.getElementById("barFill4");
  let fill3 = document.getElementById("barFill3");
  let fill2 = document.getElementById("barFill2");
  let fill1 = document.getElementById("barFill1");

  if (fill5) fill5.style.width = Math.round((star5Count / totalRev) * 100) + "%";
  if (fill4) fill4.style.width = Math.round((star4Count / totalRev) * 100) + "%";
  if (fill3) fill3.style.width = Math.round((star3Count / totalRev) * 100) + "%";
  if (fill2) fill2.style.width = Math.round((star2Count / totalRev) * 100) + "%";
  if (fill1) fill1.style.width = Math.round((star1Count / totalRev) * 100) + "%";

  let filtered = [];
  for (let i = 0; i < allReviews.length; i++) {
    let r = allReviews[i];
    let match = true;
    if (filterReview == "5 Stars" && r.rating != "5") match = false;
    else if (filterReview == "4 Stars" && r.rating != "4") match = false;
    else if (filterReview == "SSC" && (r.studentGrade || "").indexOf("SSC") == -1) match = false;
    else if (filterReview == "HSC" && (r.studentGrade || "").indexOf("HSC") == -1) match = false;

    if (match) filtered.push(r);
  }

  filtered.sort(function (a, b) {
    if (sortReviewNewest) {
      return (b.date || "").localeCompare(a.date || "");
    } else {
      return (parseInt(b.rating, 10) || 0) - (parseInt(a.rating, 10) || 0);
    }
  });

  let html = "";
  if (filtered.length == 0) {
    html = "<div class='modal-notif-empty'>No student reviews matching filter.</div>";
  } else {
    for (let i = 0; i < filtered.length; i++) {
      let r = filtered[i];
      let starsStr = "";
      let starNum = parseInt(r.rating, 10) || 5;
      for (let s = 0; s < starNum; s++) starsStr += "⭐";

      html += "<div class='review-item'>";
      html += "<div class='review-item-header'>";
      html += "<div><span class='review-author-name'>" + getText(r.studentName) + "</span> <span class='text-meta-small'>(" + getText(r.studentGrade) + ")</span></div>";
      html += "<div class='review-stars'>" + starsStr + " " + starNum + ".0</div>";
      html += "</div>";
      html += "<div class='review-meta'>Tuition Subject: <span class='subject-chip'>" + getText(r.subject) + "</span> • Date: " + formatDateTime(r.date) + "</div>";
      html += "<div class='review-text'>\"" + getText(r.reviewText) + "\"</div>";

      if (r.replyText && r.replyText != "N/A" && r.replyText.length > 0) {
        html += "<div class='review-reply-box'>";
        html += "<div class='text-bold-primary'>" + (activeTutor ? activeTutor.fullName : "Tutor") + "'s Response:</div>";
        html += "<div>" + r.replyText + "</div>";
        html += "</div>";
      }

      html += "<div class='profile-actions-bar'>";
      html += "<button type='button' class='btn-secondary btn-action-sm' data-revid='" + r.id + "' data-act='reply'>Edit Reply</button>";
      html += "</div>";
      html += "</div>";
    }
  }
  container.innerHTML = html;

  let replyBtns = container.getElementsByTagName("button");
  for (let i = 0; i < replyBtns.length; i++) {
    let btn = replyBtns[i];
    let rid = btn.getAttribute("data-revid");
    btn.onclick = function () {
      for (let j = 0; j < currentDb.tutorReviews.length; j++) {
        let rev = currentDb.tutorReviews[j];
        if (rev.id == rid) {
          let currReply = rev.replyText && rev.replyText != "N/A" ? rev.replyText : "";
          let rBody = "<div>";
          rBody += "<p>Write a public response to <strong>" + rev.studentName + "</strong>'s review:</p>";
          rBody += "<textarea id='modalReplyInput' class='modal-textarea' rows='4'>" + currReply + "</textarea>";
          rBody += "<div style='margin-top: 12px; text-align: right;'>";
          rBody += "<button type='button' class='btn-primary' id='btnSaveReplySubmit'>Post Reply</button>";
          rBody += "</div>";
          rBody += "</div>";

          showModal("Reply to Review", rBody);

          let postBtn = document.getElementById("btnSaveReplySubmit");
          if (postBtn) {
            postBtn.onclick = function () {
              let textInput = document.getElementById("modalReplyInput");
              if (textInput) {
                rev.replyText = cleanInputText(textInput.value);
                writeDatabase(currentDb, function () {
                  hideModal();
                  initReviewsPage();
                });
              }
            };
          }
          break;
        }
      }
    };
  }

  setupReviewFilters();
}

function setupReviewFilters() {
  let filterBtns = document.getElementsByClassName("btn-filter-review");
  for (let i = 0; i < filterBtns.length; i++) {
    let btn = filterBtns[i];
    btn.onclick = function () {
      for (let j = 0; j < filterBtns.length; j++) {
        filterBtns[j].className = "btn-filter btn-filter-review";
      }
      btn.className = "btn-filter btn-filter-review active";
      filterReview = btn.getAttribute("data-filter") || "All";
      initReviewsPage();
    };
  }

  let sortBtn = document.getElementById("btnToggleReviewSort");
  if (sortBtn) {
    sortBtn.onclick = function () {
      sortReviewNewest = !sortReviewNewest;
      sortBtn.textContent = sortReviewNewest ? "Sort: Newest First" : "Sort: Highest Rating";
      initReviewsPage();
    };
  }
}

function initEarningsPage() {
  let tbody = document.getElementById("tutorEarningsTbody");
  if (!tbody) return;

  let allEarnings = (currentDb && currentDb.tutorEarnings) ? currentDb.tutorEarnings : [];

  let html = "";
  if (allEarnings.length == 0) {
    html = "<tr><td colspan='8' class='text-meta-small'>No earnings statements available.</td></tr>";
  } else {
    for (let i = 0; i < allEarnings.length; i++) {
      let e = allEarnings[i];
      html += "<tr>";
      html += "<td><strong>" + getText(e.month) + "</strong></td>";
      html += "<td>" + getText(e.sessions) + "</td>";
      html += "<td>" + getText(e.hours) + "</td>";
      html += "<td>" + getText(e.gross) + "</td>";
      html += "<td>" + getText(e.commission) + "</td>";
      html += "<td><strong>" + getText(e.net) + "</strong></td>";
      html += "<td>" + getStatusBadge(e.status) + "</td>";
      html += "<td>";
      html += "<button type='button' class='btn-secondary btn-action-sm' data-eid='" + e.id + "'>Statement</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tbody.innerHTML = html;

  let btns = tbody.getElementsByTagName("button");
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    let eid = btn.getAttribute("data-eid");
    btn.onclick = function () {
      for (let j = 0; j < currentDb.tutorEarnings.length; j++) {
        let e = currentDb.tutorEarnings[j];
        if (e.id == eid) {
          let sHtml = "<div class='modal-details-grid'>";
          sHtml += "<div class='modal-label'>Billing Cycle:</div><div class='modal-value'>" + e.month + "</div>";
          sHtml += "<div class='modal-label'>Total Sessions:</div><div class='modal-value'>" + e.sessions + " (" + e.hours + ")</div>";
          sHtml += "<div class='modal-label'>Gross Billed:</div><div class='modal-value'>" + e.gross + "</div>";
          sHtml += "<div class='modal-label'>Platform Fee (10%):</div><div class='modal-value'>" + e.commission + "</div>";
          sHtml += "<div class='modal-label'>Net Receivable:</div><div class='modal-value'>" + e.net + "</div>";
          sHtml += "<div class='modal-label'>Settlement Status:</div><div class='modal-value'>" + getStatusBadge(e.status) + "</div>";
          sHtml += "</div>";
          showModal("Monthly Statement - " + e.month, sHtml);
          break;
        }
      }
    };
  }

  setupPayoutForm();

  let btnExportPdf = document.getElementById("btnExportEarningsPdf");
  if (btnExportPdf) {
    btnExportPdf.onclick = function () {
      let pBody = "<div>";
      pBody += "<p><strong>Local Home Tuition Matchmaking Platform (LHTMP)</strong></p>";
      pBody += "<p>Annual Earnings & Tax Certification Summary - 2026</p>";
      pBody += "<div class='modal-details-grid'>";
      pBody += "<div class='modal-label'>Tutor:</div><div class='modal-value'>" + (activeTutor ? activeTutor.fullName : "Tutor") + " (" + (activeTutor ? activeTutor.id : "USR-1003") + ")</div>";
      pBody += "<div class='modal-label'>Total Gross Transacted:</div><div class='modal-value'>৳1,42,800.00</div>";
      pBody += "<div class='modal-label'>Total Platform Fee (10%):</div><div class='modal-value'>৳14,280.00</div>";
      pBody += "<div class='modal-label'>Total Disbursed:</div><div class='modal-value'>৳1,10,025.00</div>";
      pBody += "<div class='modal-label'>Available Net Balance:</div><div class='modal-value'>৳18,495.00</div>";
      pBody += "</div>";
      pBody += "<p class='text-meta-small' style='margin-top: 14px;'>This document certifies settled platform transactions for income tax and financial records.</p>";
      pBody += "</div>";
      showModal("Earnings Summary Statement PDF", pBody);
    };
  }
}

function setupPayoutForm() {
  let form = document.getElementById("payoutRequestForm");
  if (!form) return;

  let amountInput = document.getElementById("payout-amount");
  let methodSelect = document.getElementById("payout-method");
  let accountNumInput = document.getElementById("account-num");
  let accountNameInput = document.getElementById("account-name");
  let noteInput = document.getElementById("payout-note");

  if (accountNameInput && activeTutor) {
    accountNameInput.value = activeTutor.fullName;
  }
  if (accountNumInput && activeTutor) {
    accountNumInput.value = activeTutor.phone;
  }

  let scrollBtn = document.getElementById("btnScrollToPayoutForm");
  if (scrollBtn) {
    scrollBtn.onclick = function () {
      form.scrollIntoView({ behavior: "smooth" });
    };
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    let amt = parseInt(amountInput.value, 10) || 0;
    let method = methodSelect.value;
    let accNum = cleanInputText(accountNumInput.value);
    let accName = cleanInputText(accountNameInput.value);
    let note = noteInput ? cleanInputText(noteInput.value) : "";

    if (amt < 1000) {
      showModal("Invalid Amount", "<p>Minimum payout request amount is ৳1,000.</p>");
      return;
    }

    if (accNum == "" || accName == "") {
      showModal("Missing Account", "<p>Please enter your account number and account holder name.</p>");
      return;
    }

    let newTxnId = "TXN-" + (9095 + ((currentDb && currentDb.payments) ? currentDb.payments.length : 0));
    if (currentDb && currentDb.payments) {
      currentDb.payments.push({
        id: newTxnId,
        from: "Platform System",
        to: activeTutor ? activeTutor.fullName : "Tutor",
        type: "Tutor Payout (" + method + ")",
        amount: "৳" + amt,
        commission: "৳0",
        method: method,
        date: "2026-11-21 12:00",
        status: "Pending"
      });
    }

    let balEl = document.getElementById("availablePayoutBalance");
    if (balEl) balEl.textContent = "৳0.00";

    writeDatabase(currentDb, function () {
      let pHtml = "<p>Payout request of <strong>৳" + amt + "</strong> via <strong>" + method + "</strong> to account <strong>" + accNum + "</strong> has been submitted.</p>";
      pHtml += "<p class='text-meta-small'>Transaction ID: #" + newTxnId + ". Funds will settle within 24 banking hours.</p>";
      showModal("Payout Submitted Successfully", pHtml);
      form.reset();
    });
  };
}

async function initTutorModule() {
  setupModalButtons();
  setupLogoutButtons();
  setupNotificationButton();

  if (typeof readDatabase === "function") {
    currentDb = await readDatabase();
  }

  activeTutor = getCurrentTutor();
  updateHeaderAndUserInfo();

  initDashboardPage();
  initProfilePage();
  initEditProfilePage();
  initAvailabilityPage();
  initBookingRequestsPage();
  setupBookingFilters();
  initStudentProgressPage();
  initStudyMaterialsPage();
  initReviewsPage();
  initEarningsPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTutorModule);
} else {
  initTutorModule();
}
