let currentDb = null;
let activeCoordinator = null;

let pageDashTutors = 1;
let pageDashDisputes = 1;
let pageVerify = 1;
let pageApprove = 1;
let pageDisputes = 1;
let pageQuality = 1;
let pageSuspend = 1;
let pageReports = 1;
let pageBroadcast = 1;

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
    return "../Files/Img/Profile/coordinator.svg";
  }
  let p = cleanInputText("" + imgPath);
  if (p.length == 0) return "../Files/Img/Profile/coordinator.svg";
  if (p.indexOf("../Files/") == 0) return p;
  if (p.indexOf("./Files/") == 0) return "." + p;
  if (p.indexOf("Files/") == 0) return "../" + p;
  if (p.indexOf("../") == 0 || p.indexOf("/") == 0 || p.indexOf("http") == 0) return p;
  return "../Files/Img/Profile/" + p;
}

function resolveUserAvatar(u) {
  if (!u) return "../Files/Img/Profile/coordinator.svg";
  let cached = null;
  if (u.id) cached = localStorage.getItem("lhtmp_avatar_" + u.id);
  if (!cached && u.email) cached = localStorage.getItem("lhtmp_avatar_" + u.email);
  if (cached && cached.length > 0) return cached;
  return resolveImagePath(u.image);
}

function showModal(title, bodyHtml) {
  const modal = document.getElementById("simpleModal");
  const modalTitle = document.getElementById("simpleModalTitle");
  const modalBody = document.getElementById("simpleModalBody");
  if (!modal || !modalTitle || !modalBody) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("simpleModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function bindModalControls() {
  const btnClose = document.getElementById("btnModalClose");
  const btnOk = document.getElementById("btnModalOk");
  const modal = document.getElementById("simpleModal");
  if (btnClose) {
    btnClose.onclick = function () {
      closeModal();
    };
  }
  if (btnOk) {
    btnOk.onclick = function () {
      closeModal();
    };
  }
  if (modal) {
    modal.onclick = function (e) {
      if (e.target === modal) {
        closeModal();
      }
    };
  }
}

function renderPagination(btnPrevId, btnNextId, btnPage1Id, currentPage, totalPages, changePageCallback) {
  const prevBtn = document.getElementById(btnPrevId);
  const nextBtn = document.getElementById(btnNextId);
  const page1Btn = document.getElementById(btnPage1Id);

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    if (currentPage <= 1) {
      prevBtn.className = "btn-secondary btn-table-disabled";
    } else {
      prevBtn.className = "btn-secondary";
    }
    prevBtn.onclick = function () {
      if (currentPage > 1) {
        changePageCallback(currentPage - 1);
      }
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
      if (currentPage < totalPages) {
        changePageCallback(currentPage + 1);
      }
    };
  }

  if (page1Btn) {
    page1Btn.textContent = "" + currentPage;
    page1Btn.className = "btn-primary";
  }
}

function initCoordinatorSession() {
  let sessionUser = null;
  try {
    let s = sessionStorage.getItem("lhtmp_current_user");
    if (s && s.length > 0) {
      sessionUser = JSON.parse(s);
    }
  } catch (err) {}

  if (currentDb && currentDb.users && currentDb.users.length > 0) {
    if (sessionUser) {
      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.id == sessionUser.id || (u.email && sessionUser.email && u.email.toLowerCase() == sessionUser.email.toLowerCase())) {
          activeCoordinator = u;
          break;
        }
      }
    }
    if (!activeCoordinator) {
      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.role == "Area Coordinator") {
          activeCoordinator = u;
          sessionStorage.setItem("lhtmp_current_user", JSON.stringify(u));
          break;
        }
      }
    }
  }

  if (!activeCoordinator) {
    activeCoordinator = {
      id: "USR-1007",
      fullName: "Razin Chowdhury",
      email: "razin.c@gmail.com",
      phone: "01811223344",
      password: "pass123",
      dob: "1998-11-05",
      gender: "Male",
      division: "Dhaka",
      area: "Mirpur",
      grade: "N/A",
      role: "Area Coordinator",
      status: "Active",
      date: "2025-01-20 15:45",
      image: "../Files/Img/Profile/coordinator.svg"
    };
  }
}

function renderTopHeader() {
  const greeting = document.getElementById("topHeaderGreeting");
  const sub = document.getElementById("topHeaderSub");
  const zone = document.getElementById("topHeaderZone");
  const name = document.getElementById("topHeaderName");
  const avatar = document.getElementById("topHeaderAvatar");
  const notifBadge = document.getElementById("topNotifBadge");
  const btnNotif = document.getElementById("btnNotification");

  if (greeting) greeting.textContent = "Welcome, " + activeCoordinator.fullName + "!";
  if (sub) sub.textContent = "Area Coordinator • " + activeCoordinator.division + " - " + activeCoordinator.area + " Zone";
  if (zone) zone.textContent = "Zone: " + activeCoordinator.division + " - " + activeCoordinator.area;
  if (name) name.textContent = activeCoordinator.fullName;
  if (avatar) avatar.src = resolveUserAvatar(activeCoordinator);

  let unreadCount = 0;
  if (currentDb) {
    if (currentDb.users) {
      for (let i = 0; i < currentDb.users.length; i++) {
        if (currentDb.users[i].role == "Tutor" && currentDb.users[i].status == "Pending Verification") {
          unreadCount++;
        }
      }
    }
    if (currentDb.disputes) {
      for (let i = 0; i < currentDb.disputes.length; i++) {
        if (currentDb.disputes[i].status == "Pending") {
          unreadCount++;
        }
      }
    }
  }
  if (unreadCount == 0) unreadCount = 3;
  if (notifBadge) notifBadge.textContent = "" + unreadCount;

  if (btnNotif) {
    btnNotif.onclick = function () {
      let html = '<div class="modal-detail-row"><span class="modal-detail-label">Active Coordinator:</span><span class="modal-detail-val">' + activeCoordinator.fullName + '</span></div>';
      html += '<div class="modal-detail-row"><span class="modal-detail-label">Assigned Zone:</span><span class="modal-detail-val">' + activeCoordinator.division + ' - ' + activeCoordinator.area + '</span></div>';
      html += '<div class="modal-content-panel panel-warning"><strong>Pending Actions in Queue:</strong><br />You have ' + unreadCount + ' items requiring your mediator attention across tutor verification dossiers and local student inquiries.</div>';
      html += '<div class="modal-content-panel panel-neutral"><strong>Platform Notice:</strong><br />Verification SLA standard requires document review within 24 hours of submission.</div>';
      showModal("Coordinator Notifications (" + unreadCount + " Unread)", html);
    };
  }
}

function renderDashboard() {
  const tutorTableBody = document.getElementById("dashTutorQueueBody");
  const disputesTableBody = document.getElementById("dashDisputesBody");
  if (!tutorTableBody && !disputesTableBody) return;

  let pendingCount = 0;
  let activeTutorCount = 0;
  let openDisputeCount = 0;

  let allTutors = [];
  if (currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.role == "Tutor") {
        allTutors.push(u);
        if (u.status == "Pending Verification") {
          pendingCount++;
        } else if (u.status == "Active") {
          activeTutorCount++;
        }
      }
    }
  }

  let allDisputes = [];
  if (currentDb && currentDb.disputes) {
    for (let i = 0; i < currentDb.disputes.length; i++) {
      let d = currentDb.disputes[i];
      allDisputes.push(d);
      if (d.status == "Pending" || d.status == "Open") {
        openDisputeCount++;
      }
    }
  }

  const statPending = document.getElementById("dashStatPending");
  const statActive = document.getElementById("dashStatActive");
  const statDisputes = document.getElementById("dashStatDisputes");
  const statRating = document.getElementById("dashStatRating");

  if (statPending) statPending.textContent = "" + pendingCount;
  if (statActive) statActive.textContent = "" + activeTutorCount;
  if (statDisputes) statDisputes.textContent = "" + openDisputeCount;
  if (statRating) statRating.textContent = "4.8";

  if (tutorTableBody) {
    let pendingTutors = [];
    for (let i = 0; i < allTutors.length; i++) {
      if (allTutors[i].status == "Pending Verification") {
        pendingTutors.push(allTutors[i]);
      }
    }
    if (pendingTutors.length == 0) {
      pendingTutors = allTutors;
    }

    let pageSize = 5;
    let totalPages = Math.ceil(pendingTutors.length / pageSize);
    if (totalPages == 0) totalPages = 1;
    if (pageDashTutors > totalPages) pageDashTutors = totalPages;

    let start = (pageDashTutors - 1) * pageSize;
    let end = start + pageSize;
    if (end > pendingTutors.length) end = pendingTutors.length;

    let html = "";
    if (pendingTutors.length == 0) {
      html = "<tr><td colspan='6' class='text-center text-muted'>No pending tutor verification records found.</td></tr>";
    } else {
      for (let i = start; i < end; i++) {
        let t = pendingTutors[i];
        let statusBadge = t.status == "Active" ? "<span class='status-badge active'>Verified</span>" : (t.status == "Suspended" ? "<span class='status-badge suspended'>Suspended</span>" : "<span class='status-badge pending'>Under Review</span>");
        let rawGrade = t.grade || "General";
        let institution = "Dhaka University";
        let subjects = "Science / Mathematics";
        if (rawGrade.indexOf("_") != -1) {
          let spl = rawGrade.split("_");
          subjects = spl[0] || "General";
          institution = spl[1] || "University";
        } else if (rawGrade != "N/A") {
          subjects = rawGrade;
        }

        html += "<tr>";
        html += "<td><strong>" + t.fullName + "</strong><br /><small class='text-muted'>ID: " + t.id + "</small></td>";
        html += "<td>" + institution + "</td>";
        html += "<td>" + subjects + "</td>";
        html += "<td>" + statusBadge + "</td>";
        html += "<td>" + formatDateTime(t.date) + "</td>";
        html += "<td>";
        html += "<div class='table-actions'>";
        html += "<button type='button' class='btn-success' onclick='verifyTutorAccount(\"" + t.id + "\")'>Verify</button>";
        html += "<button type='button' class='btn-danger' onclick='rejectTutorAccount(\"" + t.id + "\")'>Reject</button>";
        html += "<button type='button' class='btn-secondary' onclick='viewTutorDossier(\"" + t.id + "\")'>View Docs</button>";
        html += "</div>";
        html += "</td>";
        html += "</tr>";
      }
    }
    tutorTableBody.innerHTML = html;
    renderPagination("btnPrevDashTutors", "btnNextDashTutors", "btnPage1DashTutors", pageDashTutors, totalPages, function (p) {
      pageDashTutors = p;
      renderDashboard();
    });
  }

  if (disputesTableBody) {
    let pageSize = 5;
    let totalPages = Math.ceil(allDisputes.length / pageSize);
    if (totalPages == 0) totalPages = 1;
    if (pageDashDisputes > totalPages) pageDashDisputes = totalPages;

    let start = (pageDashDisputes - 1) * pageSize;
    let end = start + pageSize;
    if (end > allDisputes.length) end = allDisputes.length;

    let html = "";
    if (allDisputes.length == 0) {
      html = "<tr><td colspan='7' class='text-center text-muted'>No dispute records found.</td></tr>";
    } else {
      for (let i = start; i < end; i++) {
        let d = allDisputes[i];
        let statusBadge = d.status == "Resolved" ? "<span class='status-badge active'>Resolved</span>" : "<span class='status-badge open'>Pending</span>";
        html += "<tr>";
        html += "<td><strong>" + d.id + "</strong></td>";
        html += "<td>" + d.raisedBy + "</td>";
        html += "<td>" + d.against + "</td>";
        html += "<td>" + d.reason + "</td>";
        html += "<td>" + formatDateTime(d.date) + "</td>";
        html += "<td>" + statusBadge + "</td>";
        html += "<td>";
        html += "<div class='table-actions'>";
        html += "<button type='button' class='btn-primary' onclick='reviewDisputeCase(\"" + d.id + "\")'>Review</button>";
        if (d.status != "Resolved") {
          html += "<button type='button' class='btn-success' onclick='resolveDisputeCase(\"" + d.id + "\")'>Resolve</button>";
        }
        html += "</div>";
        html += "</td>";
        html += "</tr>";
      }
    }
    disputesTableBody.innerHTML = html;
    renderPagination("btnPrevDashDisputes", "btnNextDashDisputes", "btnPage1DashDisputes", pageDashDisputes, totalPages, function (p) {
      pageDashDisputes = p;
      renderDashboard();
    });
  }
}

function verifyTutorAccount(tutorId) {
  if (!currentDb || !currentDb.users) return;
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == tutorId) {
      u.status = "Active";
      writeDatabase(currentDb, function () {
        renderDashboard();
        renderVerifyTutors();
        renderApproveProfiles();
        showModal("Tutor Verified", "<div class='modal-content-panel panel-success'><strong>Tutor " + u.fullName + " (" + u.id + ")</strong> has been verified successfully. Account status is now <strong>Active</strong> and approved for public search matching.</div>");
      });
      break;
    }
  }
}

function rejectTutorAccount(tutorId) {
  if (!currentDb || !currentDb.users) return;
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == tutorId) {
      u.status = "Suspended";
      writeDatabase(currentDb, function () {
        renderDashboard();
        renderVerifyTutors();
        renderApproveProfiles();
        renderSuspendAccounts();
        showModal("Tutor Rejected / Suspended", "<div class='modal-content-panel panel-danger'><strong>Tutor " + u.fullName + " (" + u.id + ")</strong> verification has been rejected due to compliance requirements. Account is marked <strong>Suspended</strong>.</div>");
      });
      break;
    }
  }
}

function viewTutorDossier(tutorId) {
  if (!currentDb || !currentDb.users) return;
  let target = null;
  for (let i = 0; i < currentDb.users.length; i++) {
    if (currentDb.users[i].id == tutorId) {
      target = currentDb.users[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Full Name:</span><span class='modal-detail-val'>" + target.fullName + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Tutor ID:</span><span class='modal-detail-val'>" + target.id + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Academic Degree:</span><span class='modal-detail-val'>" + target.grade + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Territory Location:</span><span class='modal-detail-val'>" + target.division + " • " + target.area + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Contact Phone:</span><span class='modal-detail-val'>" + target.phone + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Submitted Date:</span><span class='modal-detail-val'>" + formatDateTime(target.date) + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Credentials Status:</span><span class='modal-detail-val'>" + target.status + "</span></div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Audit Verification Checklist:</strong><br />✓ National ID Card / Smart Card Copy verified<br />✓ Degree Transcript authenticated with University Board<br />✓ Contact phone number confirmed active</div>";
  html += "<div class='table-actions mt-10'>";
  if (target.status != "Active") {
    html += "<button type='button' class='btn-success' onclick='verifyTutorAccount(\"" + target.id + "\"); closeModal();'>Approve &amp; Verify Now</button>";
  }
  if (target.status != "Suspended") {
    html += "<button type='button' class='btn-danger' onclick='rejectTutorAccount(\"" + target.id + "\"); closeModal();'>Reject Submission</button>";
  }
  html += "</div>";
  showModal("Tutor Document Verification Dossier", html);
}

function reviewDisputeCase(caseId) {
  if (!currentDb || !currentDb.disputes) return;
  let target = null;
  for (let i = 0; i < currentDb.disputes.length; i++) {
    if (currentDb.disputes[i].id == caseId) {
      target = currentDb.disputes[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Case Docket:</span><span class='modal-detail-val'>" + target.id + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Complainant:</span><span class='modal-detail-val'>" + target.raisedBy + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Respondent:</span><span class='modal-detail-val'>" + target.against + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Regional Zone:</span><span class='modal-detail-val'>" + target.zone + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Filing Timestamp:</span><span class='modal-detail-val'>" + formatDateTime(target.date) + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Priority Level:</span><span class='modal-detail-val'>" + target.priority + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Dispute Status:</span><span class='modal-detail-val'>" + target.status + "</span></div>";
  html += "<div class='modal-content-panel panel-warning'><strong>Dispute Allegation:</strong><br />" + target.reason + "</div>";
  html += "<div class='table-actions mt-10'>";
  if (target.status != "Resolved") {
    html += "<button type='button' class='btn-success' onclick='resolveDisputeCase(\"" + target.id + "\"); closeModal();'>Mark Case as Resolved</button>";
    html += "<button type='button' class='btn-danger' onclick='escalateDisputeCase(\"" + target.id + "\"); closeModal();'>Escalate to Admin</button>";
  }
  html += "</div>";
  showModal("Dispute Case Review Docket - " + target.id, html);
}

function resolveDisputeCase(caseId) {
  if (!currentDb || !currentDb.disputes) return;
  for (let i = 0; i < currentDb.disputes.length; i++) {
    let d = currentDb.disputes[i];
    if (d.id == caseId) {
      d.status = "Resolved";
      writeDatabase(currentDb, function () {
        renderDashboard();
        renderDisputes();
        showModal("Dispute Resolved", "<div class='modal-content-panel panel-success'><strong>Case Docket " + d.id + "</strong> has been resolved and closed successfully by Area Coordinator mediation.</div>");
      });
      break;
    }
  }
}

function escalateDisputeCase(caseId) {
  if (!currentDb || !currentDb.disputes) return;
  for (let i = 0; i < currentDb.disputes.length; i++) {
    let d = currentDb.disputes[i];
    if (d.id == caseId) {
      d.priority = "Urgent";
      writeDatabase(currentDb, function () {
        renderDashboard();
        renderDisputes();
        showModal("Dispute Escalated", "<div class='modal-content-panel panel-danger'><strong>Case Docket " + d.id + "</strong> has been marked as <strong>Urgent</strong> and escalated to Platform Administration for formal inquiry.</div>");
      });
      break;
    }
  }
}

function renderVerifyTutors() {
  const tableBody = document.getElementById("verifyTutorsBody");
  if (!tableBody) return;

  let allTutors = [];
  let pendingCount = 0;
  let verifiedCount = 0;
  let rejectedCount = 0;

  if (currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.role == "Tutor") {
        allTutors.push(u);
        if (u.status == "Pending Verification") pendingCount++;
        else if (u.status == "Active") verifiedCount++;
        else if (u.status == "Suspended") rejectedCount++;
      }
    }
  }

  const statPending = document.getElementById("verifStatPending");
  const statVerified = document.getElementById("verifStatVerified");
  const statRejected = document.getElementById("verifStatRejected");
  if (statPending) statPending.textContent = "" + pendingCount;
  if (statVerified) statVerified.textContent = "" + verifiedCount;
  if (statRejected) statRejected.textContent = "" + rejectedCount;

  const filterSelect = document.getElementById("verifStatusFilter");
  const searchInput = document.getElementById("verifSearchInput");
  const selectedStatus = filterSelect ? filterSelect.value : "all";
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < allTutors.length; i++) {
    let t = allTutors[i];
    if (selectedStatus != "all" && t.status != selectedStatus) {
      continue;
    }
    if (searchVal.length > 0) {
      let matchStr = (t.fullName + " " + t.id + " " + t.grade + " " + t.division + " " + t.area).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) {
        continue;
      }
    }
    filtered.push(t);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageVerify > totalPages) pageVerify = totalPages;

  let start = (pageVerify - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='7' class='text-center text-muted'>No tutor verification records match filter criteria.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let t = filtered[i];
      let statusBadge = t.status == "Active" ? "<span class='status-badge active'>Verified</span>" : (t.status == "Suspended" ? "<span class='status-badge suspended'>Rejected</span>" : "<span class='status-badge pending'>Pending</span>");
      let rawGrade = t.grade || "General";
      let institution = "Dhaka University";
      let degree = "BSc Degree";
      if (rawGrade.indexOf("_") != -1) {
        let spl = rawGrade.split("_");
        degree = spl[0] || "BSc";
        institution = spl[1] || "University";
      }

      html += "<tr>";
      html += "<td><strong>" + t.fullName + "</strong><br /><small class='text-muted'>ID: " + t.id + "</small></td>";
      html += "<td>" + institution + "<br /><small class='text-muted'>" + degree + "</small></td>";
      html += "<td>Certificates &amp; Transcripts (PDF)</td>";
      html += "<td>NID Copy Verified</td>";
      html += "<td>" + formatDateTime(t.date) + "</td>";
      html += "<td>" + statusBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      if (t.status != "Active") {
        html += "<button type='button' class='btn-success' onclick='verifyTutorAccount(\"" + t.id + "\")'>Verify</button>";
      }
      if (t.status != "Suspended") {
        html += "<button type='button' class='btn-danger' onclick='rejectTutorAccount(\"" + t.id + "\")'>Reject</button>";
      }
      html += "<button type='button' class='btn-secondary' onclick='viewTutorDossier(\"" + t.id + "\")'>Audit Docs</button>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevVerify", "btnNextVerify", "btnPage1Verify", pageVerify, totalPages, function (p) {
    pageVerify = p;
    renderVerifyTutors();
  });
}

function renderApproveProfiles() {
  const tableBody = document.getElementById("approveProfilesBody");
  if (!tableBody) return;

  let allTutors = [];
  let awaitingCount = 0;
  let activeCount = 0;
  let revisionCount = 0;

  if (currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.role == "Tutor") {
        allTutors.push(u);
        if (u.status == "Pending Verification") awaitingCount++;
        else if (u.status == "Active") activeCount++;
        else if (u.status == "Suspended") revisionCount++;
      }
    }
  }

  const statPending = document.getElementById("apprStatPending");
  const statActive = document.getElementById("apprStatActive");
  const statRevision = document.getElementById("apprStatRevision");
  if (statPending) statPending.textContent = "" + awaitingCount;
  if (statActive) statActive.textContent = "" + activeCount;
  if (statRevision) statRevision.textContent = "" + revisionCount;

  const filterSelect = document.getElementById("apprStatusFilter");
  const searchInput = document.getElementById("apprSearchInput");
  const selectedStatus = filterSelect ? filterSelect.value : "all";
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < allTutors.length; i++) {
    let t = allTutors[i];
    if (selectedStatus != "all" && t.status != selectedStatus) {
      continue;
    }
    if (searchVal.length > 0) {
      let matchStr = (t.fullName + " " + t.id + " " + t.grade + " " + t.division + " " + t.area).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) {
        continue;
      }
    }
    filtered.push(t);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageApprove > totalPages) pageApprove = totalPages;

  let start = (pageApprove - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='7' class='text-center text-muted'>No tutor profile records found for approval.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let t = filtered[i];
      let statusBadge = t.status == "Active" ? "<span class='status-badge active'>Published</span>" : (t.status == "Suspended" ? "<span class='status-badge suspended'>Suspended</span>" : "<span class='status-badge pending'>Awaiting Clearance</span>");
      let rawGrade = t.grade || "Science & Mathematics";
      let coverage = t.division + " • " + t.area;

      html += "<tr>";
      html += "<td><strong>" + t.fullName + "</strong><br /><small class='text-muted'>ID: " + t.id + " | " + t.gender + "</small></td>";
      html += "<td>" + rawGrade + "</td>";
      html += "<td>" + coverage + "</td>";
      html += "<td><strong>৳6,500</strong> / month</td>";
      html += "<td><span class='text-success text-bold'>100% Complete</span><br /><small class='text-muted'>Bio &amp; Schedule ready</small></td>";
      html += "<td>" + statusBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      if (t.status != "Active") {
        html += "<button type='button' class='btn-success' onclick='verifyTutorAccount(\"" + t.id + "\")'>Approve</button>";
      }
      if (t.status != "Suspended") {
        html += "<button type='button' class='btn-danger' onclick='rejectTutorAccount(\"" + t.id + "\")'>Reject</button>";
      }
      html += "<button type='button' class='btn-secondary' onclick='previewTutorCard(\"" + t.id + "\")'>Preview Card</button>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevApprove", "btnNextApprove", "btnPage1Approve", pageApprove, totalPages, function (p) {
    pageApprove = p;
    renderApproveProfiles();
  });
}

function previewTutorCard(tutorId) {
  if (!currentDb || !currentDb.users) return;
  let target = null;
  for (let i = 0; i < currentDb.users.length; i++) {
    if (currentDb.users[i].id == tutorId) {
      target = currentDb.users[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='profile-summary-box text-center'>";
  html += "<img src='" + resolveUserAvatar(target) + "' class='avatar-preview-img' alt='Avatar' onerror='this.src=\"../Files/Img/Profile/tutor.svg\"' />";
  html += "<div class='profile-summary-name'>" + target.fullName + "</div>";
  html += "<div class='profile-summary-id'>Tutor ID: " + target.id + "</div>";
  html += "<div class='profile-summary-badge'>Verified Educator • " + target.division + "</div>";
  html += "<div class='profile-summary-details'>";
  html += "<div>🎓 <strong>Academic Degree:</strong> " + target.grade + "</div>";
  html += "<div>📍 <strong>Local Coverage:</strong> " + target.division + " • " + target.area + "</div>";
  html += "<div>📱 <strong>Mobile Number:</strong> " + target.phone + "</div>";
  html += "<div>✉️ <strong>Email:</strong> " + target.email + "</div>";
  html += "<div>💰 <strong>Expected Honorarium:</strong> ৳6,500 / Month</div>";
  html += "</div>";
  html += "</div>";
  showModal("Tutor Public Profile Card Preview", html);
}

function renderDisputes() {
  const tableBody = document.getElementById("disputesTableBody");
  if (!tableBody) return;

  let allDisputes = currentDb && currentDb.disputes ? currentDb.disputes : [];
  let openCount = 0;
  let urgentCount = 0;
  let resolvedCount = 0;

  for (let i = 0; i < allDisputes.length; i++) {
    let d = allDisputes[i];
    if (d.status == "Pending" || d.status == "Open") {
      openCount++;
      if (d.priority == "Urgent" || d.priority == "High") {
        urgentCount++;
      }
    } else if (d.status == "Resolved" || d.status == "Closed") {
      resolvedCount++;
    }
  }

  const statOpen = document.getElementById("dispStatOpen");
  const statInvestigating = document.getElementById("dispStatInvestigating");
  const statResolved = document.getElementById("dispStatResolved");
  if (statOpen) statOpen.textContent = "" + openCount;
  if (statInvestigating) statInvestigating.textContent = "" + urgentCount;
  if (statResolved) statResolved.textContent = "" + resolvedCount;

  const filterSelect = document.getElementById("dispStatusFilter");
  const searchInput = document.getElementById("dispSearchInput");
  const selectedStatus = filterSelect ? filterSelect.value : "all";
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < allDisputes.length; i++) {
    let d = allDisputes[i];
    if (selectedStatus != "all" && d.status != selectedStatus) {
      continue;
    }
    if (searchVal.length > 0) {
      let matchStr = (d.id + " " + d.raisedBy + " " + d.against + " " + d.reason + " " + d.zone).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) {
        continue;
      }
    }
    filtered.push(d);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageDisputes > totalPages) pageDisputes = totalPages;

  let start = (pageDisputes - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='8' class='text-center text-muted'>No dispute records match current filter.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let d = filtered[i];
      let statusBadge = d.status == "Resolved" ? "<span class='status-badge active'>Resolved</span>" : "<span class='status-badge open'>Pending</span>";
      let priorityClass = d.priority == "Urgent" ? "status-badge urgent" : (d.priority == "High" ? "status-badge suspended" : "status-badge pending");

      html += "<tr>";
      html += "<td><strong>" + d.id + "</strong></td>";
      html += "<td>" + d.raisedBy + "</td>";
      html += "<td>" + d.against + "</td>";
      html += "<td>" + d.reason + "</td>";
      html += "<td>" + formatDateTime(d.date) + "</td>";
      html += "<td><span class='" + priorityClass + "'>" + d.priority + "</span></td>";
      html += "<td>" + statusBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      html += "<button type='button' class='btn-primary' onclick='reviewDisputeCase(\"" + d.id + "\")'>Review</button>";
      if (d.status != "Resolved") {
        html += "<button type='button' class='btn-success' onclick='resolveDisputeCase(\"" + d.id + "\")'>Resolve</button>";
      }
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevDisputes", "btnNextDisputes", "btnPage1Disputes", pageDisputes, totalPages, function (p) {
    pageDisputes = p;
    renderDisputes();
  });
}

function openNewDisputeModal() {
  let html = "<form id='logDisputeForm' onsubmit='event.preventDefault(); submitNewDisputeForm();'>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Complainant (Student or Tutor) *</label>";
  html += "<input type='text' id='newDispComplainant' class='filter-input w-100' placeholder='e.g. Student: Siam Ahmed' required />";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Respondent (Reported Party) *</label>";
  html += "<input type='text' id='newDispRespondent' class='filter-input w-100' placeholder='e.g. Tutor: Nowrrin Kabir' required />";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Issue Category *</label>";
  html += "<select id='newDispCategory' class='filter-select w-100'>";
  html += "<option value='Tuition Fee Non-Refund & Absence'>Tuition Fee Non-Refund &amp; Absence</option>";
  html += "<option value='Consecutive Unnotified Absences'>Consecutive Unnotified Absences</option>";
  html += "<option value='Subject Curriculum Incompletion'>Subject Curriculum Incompletion</option>";
  html += "<option value='Misconduct & Late Cancellations'>Misconduct &amp; Late Cancellations</option>";
  html += "<option value='Advance Fee Settlement Disagreement'>Advance Fee Settlement Disagreement</option>";
  html += "</select>";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Priority Level *</label>";
  html += "<select id='newDispPriority' class='filter-select w-100'>";
  html += "<option value='Medium'>Medium Priority</option>";
  html += "<option value='High'>High Priority</option>";
  html += "<option value='Urgent'>Urgent Intervention</option>";
  html += "</select>";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Dispute Facts &amp; Context *</label>";
  html += "<textarea id='newDispDescription' class='filter-input w-100' rows='3' placeholder='Describe the dispute circumstances...' required></textarea>";
  html += "</div>";
  html += "<div class='modal-footer'>";
  html += "<button type='submit' class='btn-primary'>File Dispute Docket</button>";
  html += "</div>";
  html += "</form>";
  showModal("Log New Dispute Mediation Docket", html);
}

function submitNewDisputeForm() {
  const comp = document.getElementById("newDispComplainant");
  const resp = document.getElementById("newDispRespondent");
  const cat = document.getElementById("newDispCategory");
  const pri = document.getElementById("newDispPriority");
  const desc = document.getElementById("newDispDescription");

  if (!comp || !resp || !desc || cleanInputText(comp.value) == "" || cleanInputText(resp.value) == "" || cleanInputText(desc.value) == "") {
    alert("Please fill in all mandatory fields.");
    return;
  }

  let nextId = "DISP-" + (100 + (currentDb.disputes ? currentDb.disputes.length + 1 : 1));
  let zoneName = activeCoordinator.fullName + " (" + activeCoordinator.area + " Zone)";

  let newDisp = {
    id: nextId,
    zone: zoneName,
    coordinator: zoneName,
    raisedBy: cleanInputText(comp.value),
    complainant: cleanInputText(comp.value),
    against: cleanInputText(resp.value),
    respondent: cleanInputText(resp.value),
    reason: cat ? cat.value : "General Inquiry",
    issue: cat ? cat.value : "General Inquiry",
    date: "2026-11-21 23:25",
    priority: pri ? pri.value : "Medium",
    status: "Pending"
  };

  if (!currentDb.disputes) currentDb.disputes = [];
  currentDb.disputes.unshift(newDisp);

  writeDatabase(currentDb, function () {
    closeModal();
    renderDisputes();
    renderDashboard();
    showModal("Dispute Logged", "<div class='modal-content-panel panel-success'><strong>Case Docket " + nextId + "</strong> has been opened and assigned to Area Coordinator mediation queue.</div>");
  });
}

function renderTutorQuality() {
  const tableBody = document.getElementById("tutorQualityTableBody");
  if (!tableBody) return;

  let allTutors = [];
  let highCount = 0;
  let flaggedCount = 0;

  if (currentDb && currentDb.users) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.role == "Tutor") {
        allTutors.push(u);
        if (u.status == "Active") {
          highCount++;
        } else if (u.status == "Suspended") {
          flaggedCount++;
        }
      }
    }
  }

  const statActive = document.getElementById("qualStatActive");
  const statHigh = document.getElementById("qualStatHigh");
  const statFlagged = document.getElementById("qualStatFlagged");
  if (statActive) statActive.textContent = "" + (highCount + flaggedCount);
  if (statHigh) statHigh.textContent = "" + highCount;
  if (statFlagged) statFlagged.textContent = "" + flaggedCount;

  const filterSelect = document.getElementById("qualRatingFilter");
  const searchInput = document.getElementById("qualSearchInput");
  const selectedFilter = filterSelect ? filterSelect.value : "all";
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < allTutors.length; i++) {
    let t = allTutors[i];
    let isHigh = t.status == "Active";
    if (selectedFilter == "high" && !isHigh) continue;
    if (selectedFilter == "low" && isHigh) continue;
    if (searchVal.length > 0) {
      let matchStr = (t.fullName + " " + t.id + " " + t.grade).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) continue;
    }
    filtered.push(t);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageQuality > totalPages) pageQuality = totalPages;

  let start = (pageQuality - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='8' class='text-center text-muted'>No tutor quality records found.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let t = filtered[i];
      let ratingStr = t.status == "Active" ? "4.9 ⭐" : "3.8 ⭐";
      let standingBadge = t.status == "Active" ? "<span class='status-badge active'>Exemplary</span>" : "<span class='status-badge suspended'>Flagged</span>";
      let sessions = t.status == "Active" ? "42 Sessions" : "12 Sessions";
      let feedback = t.status == "Active" ? "Outstanding conceptual clarity; student scored top in board exam." : "Late arrivals reported; unnotified class rescheduling.";

      html += "<tr>";
      html += "<td><strong>" + t.fullName + "</strong><br /><small class='text-muted'>ID: " + t.id + "</small></td>";
      html += "<td>" + t.grade + "</td>";
      html += "<td>" + sessions + "</td>";
      html += "<td><strong>" + ratingStr + "</strong></td>";
      html += "<td>" + (t.status == "Active" ? "98.5%" : "82.0%") + "</td>";
      html += "<td>&ldquo;" + feedback + "&rdquo;</td>";
      html += "<td>" + standingBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      html += "<button type='button' class='btn-secondary' onclick='viewQualityFeedback(\"" + t.id + "\")'>Feedback</button>";
      html += "<button type='button' class='btn-primary' onclick='commendTutor(\"" + t.id + "\")'>Commend</button>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevQuality", "btnNextQuality", "btnPage1Quality", pageQuality, totalPages, function (p) {
    pageQuality = p;
    renderTutorQuality();
  });
}

function viewQualityFeedback(tutorId) {
  if (!currentDb || !currentDb.users) return;
  let target = null;
  for (let i = 0; i < currentDb.users.length; i++) {
    if (currentDb.users[i].id == tutorId) {
      target = currentDb.users[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Educator:</span><span class='modal-detail-val'>" + target.fullName + " (" + target.id + ")</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Curriculum Subject:</span><span class='modal-detail-val'>" + target.grade + "</span></div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Parent Review (14-11-2026):</strong><br />&ldquo;The tutor was extremely patient and punctual. My child improved by two grade brackets in calculus.&rdquo; — 5.0 ⭐</div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Student Review (08-11-2026):</strong><br />&ldquo;Concepts were explained with clear real-world examples. Provided worksheets after each lesson.&rdquo; — 4.8 ⭐</div>";
  showModal("Student Feedback Dossier - " + target.fullName, html);
}

function commendTutor(tutorId) {
  if (!currentDb || !currentDb.users) return;
  let target = null;
  for (let i = 0; i < currentDb.users.length; i++) {
    if (currentDb.users[i].id == tutorId) {
      target = currentDb.users[i];
      break;
    }
  }
  if (!target) return;
  showModal("Commendation Dispatched", "<div class='modal-content-panel panel-success'><strong>Area Coordinator Commendation</strong> has been sent to <strong>" + target.fullName + "</strong> for exemplary teaching feedback and high student retention.</div>");
}

function renderSuspendAccounts() {
  const tableBody = document.getElementById("suspendAccountsTableBody");
  if (!tableBody) return;

  let allUsers = currentDb && currentDb.users ? currentDb.users : [];
  let suspendedCount = 0;
  let pendingCount = 0;
  let activeCount = 0;

  for (let i = 0; i < allUsers.length; i++) {
    let u = allUsers[i];
    if (u.status == "Suspended") suspendedCount++;
    else if (u.status == "Pending Verification") pendingCount++;
    else if (u.status == "Active") activeCount++;
  }

  const statSuspended = document.getElementById("suspStatSuspended");
  const statFlagged = document.getElementById("suspStatFlagged");
  const statReinstated = document.getElementById("suspStatReinstated");
  if (statSuspended) statSuspended.textContent = "" + suspendedCount;
  if (statFlagged) statFlagged.textContent = "" + pendingCount;
  if (statReinstated) statReinstated.textContent = "" + activeCount;

  const filterSelect = document.getElementById("suspStatusFilter");
  const searchInput = document.getElementById("suspSearchInput");
  const selectedStatus = filterSelect ? filterSelect.value : "Suspended";
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < allUsers.length; i++) {
    let u = allUsers[i];
    if (selectedStatus != "all" && u.status != selectedStatus) {
      continue;
    }
    if (searchVal.length > 0) {
      let matchStr = (u.fullName + " " + u.id + " " + u.role + " " + u.division + " " + u.area).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) {
        continue;
      }
    }
    filtered.push(u);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageSuspend > totalPages) pageSuspend = totalPages;

  let start = (pageSuspend - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='7' class='text-center text-muted'>No user account suspension records found.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let u = filtered[i];
      let statusBadge = u.status == "Active" ? "<span class='status-badge active'>Active</span>" : (u.status == "Suspended" ? "<span class='status-badge suspended'>Suspended</span>" : "<span class='status-badge pending'>Pending</span>");
      let infraction = u.status == "Suspended" ? "Repeated unexcused session absences and policy inquiry" : "Account in regular community compliance";

      html += "<tr>";
      html += "<td><strong>" + u.fullName + "</strong><br /><small class='text-muted'>ID: " + u.id + "</small></td>";
      html += "<td><span class='badge'>" + u.role + "</span></td>";
      html += "<td>" + u.division + " • " + u.area + "</td>";
      html += "<td>" + infraction + "</td>";
      html += "<td>" + formatDateTime(u.date) + "</td>";
      html += "<td>" + statusBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      if (u.status == "Suspended") {
        html += "<button type='button' class='btn-success' onclick='reinstateAccount(\"" + u.id + "\")'>Reinstate</button>";
      } else {
        html += "<button type='button' class='btn-danger' onclick='suspendAccountAction(\"" + u.id + "\")'>Suspend</button>";
      }
      html += "<button type='button' class='btn-secondary' onclick='viewAuditLog(\"" + u.id + "\")'>Audit Log</button>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevSuspend", "btnNextSuspend", "btnPage1Suspend", pageSuspend, totalPages, function (p) {
    pageSuspend = p;
    renderSuspendAccounts();
  });
}

function reinstateAccount(userId) {
  if (!currentDb || !currentDb.users) return;
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == userId) {
      u.status = "Active";
      writeDatabase(currentDb, function () {
        renderSuspendAccounts();
        renderDashboard();
        showModal("Account Reinstated", "<div class='modal-content-panel panel-success'>Account <strong>" + u.fullName + " (" + u.id + ")</strong> has been reinstated to <strong>Active</strong> standing. Access credentials are fully restored.</div>");
      });
      break;
    }
  }
}

function suspendAccountAction(userId) {
  if (!currentDb || !currentDb.users) return;
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == userId) {
      u.status = "Suspended";
      writeDatabase(currentDb, function () {
        renderSuspendAccounts();
        renderDashboard();
        showModal("Account Suspended", "<div class='modal-content-panel panel-danger'>Account <strong>" + u.fullName + " (" + u.id + ")</strong> has been <strong>Suspended</strong> under Area Coordinator disciplinary enforcement.</div>");
      });
      break;
    }
  }
}

function viewAuditLog(userId) {
  if (!currentDb || !currentDb.users) return;
  let target = null;
  for (let i = 0; i < currentDb.users.length; i++) {
    if (currentDb.users[i].id == userId) {
      target = currentDb.users[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>User Account:</span><span class='modal-detail-val'>" + target.fullName + " (" + target.id + ")</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Role Authority:</span><span class='modal-detail-val'>" + target.role + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Account Status:</span><span class='modal-detail-val'>" + target.status + "</span></div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Disciplinary History Log:</strong><br />• 24-10-2026: Notice logged regarding schedule absence without prior student notice.<br />• 02-11-2026: Mediator counseling session conducted by Area Coordinator.<br />• 12-11-2026: Audit compliance status checked and updated.</div>";
  showModal("Account Disciplinary Audit Log", html);
}

function openFlagAccountModal() {
  if (!currentDb || !currentDb.users) return;
  let html = "<form id='flagAccountForm' onsubmit='event.preventDefault(); submitFlagAccountForm();'>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Select Account to Audit / Penalize *</label>";
  html += "<select id='flagSelectUser' class='filter-select w-100'>";
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    html += "<option value='" + u.id + "'>" + u.fullName + " (" + u.id + " - " + u.role + " - " + u.status + ")</option>";
  }
  html += "</select>";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Violation Category *</label>";
  html += "<select id='flagViolationCat' class='filter-select w-100'>";
  html += "<option value='Repeated Absenteeism'>Repeated Absenteeism</option>";
  html += "<option value='Payment Policy Bypass'>Payment Policy Bypass</option>";
  html += "<option value='Misconduct / Harassment'>Misconduct / Harassment</option>";
  html += "<option value='Unverified Documents'>Unverified Documents</option>";
  html += "</select>";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Enforcement Action *</label>";
  html += "<select id='flagActionType' class='filter-select w-100'>";
  html += "<option value='Suspend'>Suspend Account Immediately</option>";
  html += "<option value='Pending'>Place Under Compliance Review (Pending)</option>";
  html += "</select>";
  html += "</div>";
  html += "<div class='modal-form-group mb-14'>";
  html += "<label class='text-bold text-small'>Audit Observations &amp; Findings *</label>";
  html += "<textarea id='flagObservations' class='filter-input w-100' rows='3' placeholder='State the specific reasons and documented evidence...' required></textarea>";
  html += "</div>";
  html += "<div class='modal-footer'>";
  html += "<button type='submit' class='btn-danger'>Apply Disciplinary Action</button>";
  html += "</div>";
  html += "</form>";
  showModal("Flag / Penalize User Account", html);
}

function submitFlagAccountForm() {
  const selUser = document.getElementById("flagSelectUser");
  const actType = document.getElementById("flagActionType");
  const obs = document.getElementById("flagObservations");

  if (!selUser || !obs || cleanInputText(obs.value) == "") {
    alert("Please provide audit observations.");
    return;
  }

  let targetId = selUser.value;
  let newStatus = actType && actType.value == "Pending" ? "Pending Verification" : "Suspended";

  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == targetId) {
      u.status = newStatus;
      writeDatabase(currentDb, function () {
        closeModal();
        renderSuspendAccounts();
        renderDashboard();
        showModal("Disciplinary Action Executed", "<div class='modal-content-panel panel-danger'>Account <strong>" + u.fullName + " (" + u.id + ")</strong> has been updated to <strong>" + newStatus + "</strong>.</div>");
      });
      break;
    }
  }
}

function renderAreaReports() {
  const tableBody = document.getElementById("areaReportsTableBody");
  if (!tableBody) return;

  let zones = currentDb && currentDb.analyticsZones ? currentDb.analyticsZones : [];

  let totalInquiries = 0;
  let totalFinalized = 0;
  for (let i = 0; i < zones.length; i++) {
    totalInquiries += parseInt(zones[i].inquiries, 10) || 0;
    totalFinalized += parseInt(zones[i].finalized, 10) || 0;
  }

  const statUsers = document.getElementById("repStatUsers");
  const statBookings = document.getElementById("repStatBookings");
  const statRevenue = document.getElementById("repStatRevenue");
  const statSuccess = document.getElementById("repStatSuccess");

  if (statUsers) statUsers.textContent = "142";
  if (statBookings) statBookings.textContent = "" + (totalInquiries > 0 ? totalInquiries : 198);
  if (statRevenue) statRevenue.textContent = "" + (totalFinalized > 0 ? totalFinalized : 184);
  if (statSuccess) statSuccess.textContent = "96.4%";

  const searchInput = document.getElementById("repSearchInput");
  const searchVal = searchInput ? cleanInputText(searchInput.value).toLowerCase() : "";

  let filtered = [];
  for (let i = 0; i < zones.length; i++) {
    let z = zones[i];
    if (searchVal.length > 0) {
      let matchStr = (z.zone + " " + z.coordinator).toLowerCase();
      if (matchStr.indexOf(searchVal) == -1) continue;
    }
    filtered.push(z);
  }

  let pageSize = 5;
  let totalPages = Math.ceil(filtered.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageReports > totalPages) pageReports = totalPages;

  let start = (pageReports - 1) * pageSize;
  let end = start + pageSize;
  if (end > filtered.length) end = filtered.length;

  let html = "";
  if (filtered.length == 0) {
    html = "<tr><td colspan='7' class='text-center text-muted'>No regional zone performance records found.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let z = filtered[i];
      html += "<tr>";
      html += "<td><strong>" + z.zone + "</strong></td>";
      html += "<td>" + z.coordinator + "</td>";
      html += "<td>" + z.inquiries + " Inquiries</td>";
      html += "<td>" + z.finalized + " Matched</td>";
      html += "<td><span class='status-badge active'>" + z.successRate + "</span></td>";
      html += "<td><strong>" + z.rating + "</strong></td>";
      html += "<td>";
      html += "<button type='button' class='btn-secondary' onclick='viewZoneReport(\"" + z.zone + "\")'>Breakdown</button>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevReports", "btnNextReports", "btnPage1Reports", pageReports, totalPages, function (p) {
    pageReports = p;
    renderAreaReports();
  });
}

function viewZoneReport(zoneName) {
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Regional Zone Sector:</span><span class='modal-detail-val'>" + zoneName + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Area Operational Status:</span><span class='modal-detail-val text-success'>Optimal Matching</span></div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Monthly Operational Summary:</strong><br />• Student Inquiries: 98% handled within 48h SLA<br />• Tutor Attendance Fulfillment: 97.4%<br />• Dispute Rate: &lt; 0.6% across active tuition batches</div>";
  html += "<div class='modal-content-panel panel-success'><strong>Coordinator Recommendation:</strong><br />Expand active tutor recruitment for Higher Mathematics &amp; English Version curricula.</div>";
  showModal("Regional Zone Analytics Breakdown - " + zoneName, html);
}

function renderBroadcastAlerts() {
  const tableBody = document.getElementById("broadcastHistoryBody");
  if (!tableBody) return;

  let allAlerts = currentDb && currentDb.alerts ? currentDb.alerts : [];
  let activeAlertsCount = 0;

  for (let i = 0; i < allAlerts.length; i++) {
    if (allAlerts[i].status == "Active") {
      activeAlertsCount++;
    }
  }

  const statActive = document.getElementById("bcastStatActive");
  const statTotal = document.getElementById("bcastStatTotal");
  const statReach = document.getElementById("bcastStatReach");
  if (statActive) statActive.textContent = "" + activeAlertsCount;
  if (statTotal) statTotal.textContent = "" + allAlerts.length;
  if (statReach) statReach.textContent = "1,380";

  let pageSize = 5;
  let totalPages = Math.ceil(allAlerts.length / pageSize);
  if (totalPages == 0) totalPages = 1;
  if (pageBroadcast > totalPages) pageBroadcast = totalPages;

  let start = (pageBroadcast - 1) * pageSize;
  let end = start + pageSize;
  if (end > allAlerts.length) end = allAlerts.length;

  let html = "";
  if (allAlerts.length == 0) {
    html = "<tr><td colspan='8' class='text-center text-muted'>No broadcast announcements found.</td></tr>";
  } else {
    for (let i = start; i < end; i++) {
      let a = allAlerts[i];
      let statusBadge = a.status == "Active" ? "<span class='status-badge active'>Active</span>" : "<span class='status-badge low'>Completed</span>";
      html += "<tr>";
      html += "<td><strong>" + a.title + "</strong><br /><small class='text-muted'>ID: " + a.id + "</small></td>";
      html += "<td><span class='badge'>" + a.category + "</span></td>";
      html += "<td>" + a.target + "</td>";
      html += "<td>" + formatDateTime(a.date) + "</td>";
      html += "<td>" + a.sentBy + "</td>";
      html += "<td>" + a.reach + "</td>";
      html += "<td>" + statusBadge + "</td>";
      html += "<td>";
      html += "<div class='table-actions'>";
      html += "<button type='button' class='btn-secondary' onclick='viewAlertDetail(\"" + a.id + "\")'>Details</button>";
      if (a.status == "Active") {
        html += "<button type='button' class='btn-danger' onclick='deactivateAlert(\"" + a.id + "\")'>Deactivate</button>";
      }
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
  }
  tableBody.innerHTML = html;
  renderPagination("btnPrevBroadcast", "btnNextBroadcast", "btnPage1Broadcast", pageBroadcast, totalPages, function (p) {
    pageBroadcast = p;
    renderBroadcastAlerts();
  });
}

function viewAlertDetail(alertId) {
  if (!currentDb || !currentDb.alerts) return;
  let target = null;
  for (let i = 0; i < currentDb.alerts.length; i++) {
    if (currentDb.alerts[i].id == alertId) {
      target = currentDb.alerts[i];
      break;
    }
  }
  if (!target) return;
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Announcement ID:</span><span class='modal-detail-val'>" + target.id + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Category:</span><span class='modal-detail-val'>" + target.category + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Target Audience:</span><span class='modal-detail-val'>" + target.target + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Dispatched By:</span><span class='modal-detail-val'>" + target.sentBy + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Timestamp:</span><span class='modal-detail-val'>" + formatDateTime(target.date) + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Audience Reach:</span><span class='modal-detail-val'>" + target.reach + "</span></div>";
  html += "<div class='modal-content-panel panel-warning'><strong>Broadcast Message:</strong><br />" + target.title + "</div>";
  showModal("Broadcast Bulletin Details", html);
}

function deactivateAlert(alertId) {
  if (!currentDb || !currentDb.alerts) return;
  for (let i = 0; i < currentDb.alerts.length; i++) {
    let a = currentDb.alerts[i];
    if (a.id == alertId) {
      a.status = "Completed";
      writeDatabase(currentDb, function () {
        renderBroadcastAlerts();
        showModal("Broadcast Deactivated", "<div class='modal-content-panel panel-neutral'>Announcement <strong>" + a.id + "</strong> has been deactivated from active user dashboard banners.</div>");
      });
      break;
    }
  }
}

function bindBroadcastForm() {
  const form = document.getElementById("bcastForm");
  if (!form) return;
  form.onsubmit = function (e) {
    e.preventDefault();
    const aud = document.getElementById("bcastAudience");
    const pri = document.getElementById("bcastPriority");
    const tit = document.getElementById("bcastTitle");
    const msg = document.getElementById("bcastMessage");

    if (!tit || !msg || cleanInputText(tit.value) == "" || cleanInputText(msg.value) == "") {
      alert("Please enter title and announcement content.");
      return;
    }

    let nextId = "ALT-" + (401 + (currentDb.alerts ? currentDb.alerts.length : 0));
    let newAlert = {
      id: nextId,
      title: cleanInputText(tit.value),
      category: pri ? pri.value : "Global",
      target: aud ? aud.value : "All Users in Zone",
      date: "2026-11-21 23:25",
      sentBy: "Coordinator (" + activeCoordinator.fullName + ")",
      reach: "142 Users",
      status: "Active"
    };

    if (!currentDb.alerts) currentDb.alerts = [];
    currentDb.alerts.unshift(newAlert);

    writeDatabase(currentDb, function () {
      form.reset();
      renderBroadcastAlerts();
      showModal("Announcement Dispatched", "<div class='modal-content-panel panel-success'><strong>Broadcast " + nextId + "</strong> has been dispatched successfully to " + newAlert.target + ".</div>");
    });
  };
}

function renderProfilePage() {
  const avatar = document.getElementById("profSummaryAvatar");
  const name = document.getElementById("profSummaryName");
  const uid = document.getElementById("profSummaryId");
  const zone = document.getElementById("profSummaryZone");
  const territory = document.getElementById("profDetailTerritory");
  const phone = document.getElementById("profDetailPhone");
  const email = document.getElementById("profDetailEmail");
  const dob = document.getElementById("profDetailDob");
  const gender = document.getElementById("profDetailGender");
  const date = document.getElementById("profDetailDate");

  const fieldId = document.getElementById("profFieldId");
  const fieldDiv = document.getElementById("profFieldDivision");
  const fieldArea = document.getElementById("profFieldArea");
  const fieldStatus = document.getElementById("profFieldStatus");
  const fieldFullName = document.getElementById("profFieldFullName");
  const fieldEmail = document.getElementById("profFieldEmail");
  const fieldPhone = document.getElementById("profFieldPhone");
  const fieldDob = document.getElementById("profFieldDob");
  const fieldGender = document.getElementById("profFieldGender");
  const fieldDate = document.getElementById("profFieldDate");

  if (!name && !fieldFullName) return;

  if (avatar) avatar.src = resolveUserAvatar(activeCoordinator);
  if (name) name.textContent = activeCoordinator.fullName;
  if (uid) uid.textContent = "ID: " + activeCoordinator.id;
  if (zone) zone.textContent = "Zone: " + activeCoordinator.division + " - " + activeCoordinator.area;
  if (territory) territory.textContent = activeCoordinator.division + " • " + activeCoordinator.area;
  if (phone) phone.textContent = activeCoordinator.phone;
  if (email) email.textContent = activeCoordinator.email;
  if (dob) dob.textContent = activeCoordinator.dob;
  if (gender) gender.textContent = activeCoordinator.gender;
  if (date) date.textContent = formatDateTime(activeCoordinator.date);

  if (fieldId) fieldId.textContent = activeCoordinator.id;
  if (fieldDiv) fieldDiv.textContent = activeCoordinator.division;
  if (fieldArea) fieldArea.textContent = activeCoordinator.area;
  if (fieldStatus) fieldStatus.textContent = activeCoordinator.status || "Active";
  if (fieldFullName) fieldFullName.textContent = activeCoordinator.fullName;
  if (fieldEmail) fieldEmail.textContent = activeCoordinator.email;
  if (fieldPhone) fieldPhone.textContent = activeCoordinator.phone;
  if (fieldDob) fieldDob.textContent = activeCoordinator.dob;
  if (fieldGender) fieldGender.textContent = activeCoordinator.gender;
  if (fieldDate) fieldDate.textContent = formatDateTime(activeCoordinator.date);
}

function initEditProfilePage() {
  const form = document.getElementById("coordEditForm");
  if (!form) return;

  const idInput = document.getElementById("coordUserId");
  const typeInput = document.getElementById("coordUserType");
  const statusInput = document.getElementById("coordStatus");
  const divInput = document.getElementById("coordDivision");
  const areaInput = document.getElementById("coordArea");
  const nameInput = document.getElementById("coordFullName");
  const emailInput = document.getElementById("coordEmail");
  const phoneInput = document.getElementById("coordPhone");
  const dobInput = document.getElementById("coordDob");
  const maleRadio = document.getElementById("genderMale");
  const femaleRadio = document.getElementById("genderFemale");
  const passInput = document.getElementById("coordPassword");
  const confirmPassInput = document.getElementById("coordConfirmPassword");
  const avatarPreview = document.getElementById("avatarPreview");
  const profileImageInput = document.getElementById("profileImage");
  const alertBox = document.getElementById("coordAlertBox");

  if (idInput) idInput.value = activeCoordinator.id;
  if (typeInput) typeInput.value = "Area Coordinator";
  if (statusInput) statusInput.value = activeCoordinator.status || "Active";
  if (divInput) divInput.value = activeCoordinator.division;
  if (areaInput) areaInput.value = activeCoordinator.area;
  if (nameInput) nameInput.value = activeCoordinator.fullName;
  if (emailInput) emailInput.value = activeCoordinator.email;
  if (phoneInput) phoneInput.value = activeCoordinator.phone;
  if (dobInput) dobInput.value = activeCoordinator.dob;

  let g = activeCoordinator.gender ? activeCoordinator.gender.toLowerCase() : "";
  if (g == "male" && maleRadio) maleRadio.checked = true;
  else if (g == "female" && femaleRadio) femaleRadio.checked = true;

  if (passInput) passInput.value = activeCoordinator.password != "N/A" ? activeCoordinator.password : "";
  if (confirmPassInput) confirmPassInput.value = activeCoordinator.password != "N/A" ? activeCoordinator.password : "";

  if (avatarPreview) avatarPreview.src = resolveUserAvatar(activeCoordinator);

  if (profileImageInput) {
    profileImageInput.onchange = function () {
      if (profileImageInput.files && profileImageInput.files.length > 0) {
        let file = profileImageInput.files[0];
        tempAvatarFileName = file.name;
        let reader = new FileReader();
        reader.onload = function (e) {
          tempAvatarDataUrl = e.target.result;
          if (avatarPreview) avatarPreview.src = tempAvatarDataUrl;
        };
        reader.readAsDataURL(file);
      } else {
        tempAvatarFileName = "";
        tempAvatarDataUrl = "";
        if (avatarPreview) avatarPreview.src = resolveUserAvatar(activeCoordinator);
      }
    };
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    if (!alertBox) return;

    const fullName = cleanInputText(nameInput.value);
    const email = cleanInputText(emailInput.value);
    const phone = cleanInputText(phoneInput.value);
    const dob = dobInput.value;
    let gender = "";
    if (maleRadio && maleRadio.checked) gender = "Male";
    else if (femaleRadio && femaleRadio.checked) gender = "Female";

    const password = passInput.value;
    const confirmPassword = confirmPassInput.value;

    if (fullName == "" || email == "" || phone == "" || dob == "" || gender == "" || password == "" || confirmPassword == "") {
      alertBox.textContent = "Please fill in all mandatory fields.";
      alertBox.className = "alert-box alert-error";
      alertBox.style.display = "block";
      return;
    }

    if (phone.length != 11) {
      alertBox.textContent = "Contact Phone Number must be exactly 11 digits.";
      alertBox.className = "alert-box alert-error";
      alertBox.style.display = "block";
      return;
    }

    if (password != confirmPassword) {
      alertBox.textContent = "Password and Confirm Password do not match.";
      alertBox.className = "alert-box alert-error";
      alertBox.style.display = "block";
      return;
    }

    if (currentDb && currentDb.users) {
      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.id != activeCoordinator.id) {
          if (u.email && u.email.toLowerCase() == email.toLowerCase()) {
            alertBox.textContent = "This email address is already in use by another user account.";
            alertBox.className = "alert-box alert-error";
            alertBox.style.display = "block";
            return;
          }
          if (u.phone && u.phone == phone) {
            alertBox.textContent = "This phone number is already registered to another user account.";
            alertBox.className = "alert-box alert-error";
            alertBox.style.display = "block";
            return;
          }
        }
      }
    }

    let savedImg = activeCoordinator.image;
    if (tempAvatarFileName.length > 0) {
      savedImg = "../Files/Img/Profile/" + tempAvatarFileName;
      if (tempAvatarDataUrl.length > 0) {
        localStorage.setItem("lhtmp_avatar_" + activeCoordinator.id, tempAvatarDataUrl);
        localStorage.setItem("lhtmp_avatar_" + email, tempAvatarDataUrl);
      }
    }

    activeCoordinator.fullName = fullName;
    activeCoordinator.email = email;
    activeCoordinator.phone = phone;
    activeCoordinator.dob = dob;
    activeCoordinator.gender = gender;
    activeCoordinator.password = password;
    activeCoordinator.image = savedImg;

    if (currentDb && currentDb.users) {
      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.id == activeCoordinator.id) {
          u.fullName = fullName;
          u.email = email;
          u.phone = phone;
          u.dob = dob;
          u.gender = gender;
          u.password = password;
          u.image = savedImg;
          break;
        }
      }
    }

    sessionStorage.setItem("lhtmp_current_user", JSON.stringify(activeCoordinator));

    writeDatabase(currentDb, function () {
      alertBox.textContent = "Coordinator profile updated successfully! Redirecting to profile view...";
      alertBox.className = "alert-box alert-success";
      alertBox.style.display = "block";
      setTimeout(function () {
        window.location.href = "profile.html";
      }, 900);
    });
  };
}

document.addEventListener("DOMContentLoaded", async function () {
  bindModalControls();

  if (typeof readDatabase == "function") {
    currentDb = await readDatabase();
  }

  initCoordinatorSession();
  renderTopHeader();

  const refreshVerifyBtn = document.getElementById("btnRefreshVerify");
  if (refreshVerifyBtn) {
    refreshVerifyBtn.onclick = function () {
      renderVerifyTutors();
    };
  }
  const verifFilter = document.getElementById("verifStatusFilter");
  if (verifFilter) {
    verifFilter.onchange = function () {
      pageVerify = 1;
      renderVerifyTutors();
    };
  }
  const verifSearch = document.getElementById("verifSearchInput");
  if (verifSearch) {
    verifSearch.oninput = function () {
      pageVerify = 1;
      renderVerifyTutors();
    };
  }

  const refreshApproveBtn = document.getElementById("btnRefreshApprove");
  if (refreshApproveBtn) {
    refreshApproveBtn.onclick = function () {
      renderApproveProfiles();
    };
  }
  const apprFilter = document.getElementById("apprStatusFilter");
  if (apprFilter) {
    apprFilter.onchange = function () {
      pageApprove = 1;
      renderApproveProfiles();
    };
  }
  const apprSearch = document.getElementById("apprSearchInput");
  if (apprSearch) {
    apprSearch.oninput = function () {
      pageApprove = 1;
      renderApproveProfiles();
    };
  }

  const refreshDisputesBtn = document.getElementById("btnRefreshDisputes");
  if (refreshDisputesBtn) {
    refreshDisputesBtn.onclick = function () {
      renderDisputes();
    };
  }
  const dispFilter = document.getElementById("dispStatusFilter");
  if (dispFilter) {
    dispFilter.onchange = function () {
      pageDisputes = 1;
      renderDisputes();
    };
  }
  const dispSearch = document.getElementById("dispSearchInput");
  if (dispSearch) {
    dispSearch.oninput = function () {
      pageDisputes = 1;
      renderDisputes();
    };
  }
  const btnLogDispute = document.getElementById("btnLogDisputeModal");
  if (btnLogDispute) {
    btnLogDispute.onclick = function () {
      openNewDisputeModal();
    };
  }

  const refreshQualityBtn = document.getElementById("btnRefreshQuality");
  if (refreshQualityBtn) {
    refreshQualityBtn.onclick = function () {
      renderTutorQuality();
    };
  }
  const qualFilter = document.getElementById("qualRatingFilter");
  if (qualFilter) {
    qualFilter.onchange = function () {
      pageQuality = 1;
      renderTutorQuality();
    };
  }
  const qualSearch = document.getElementById("qualSearchInput");
  if (qualSearch) {
    qualSearch.oninput = function () {
      pageQuality = 1;
      renderTutorQuality();
    };
  }
  const btnExportQuality = document.getElementById("btnExportQualityModal");
  if (btnExportQuality) {
    btnExportQuality.onclick = function () {
      let html = "<div class='modal-content-panel panel-neutral'><strong>Dhaka - Mirpur Zone Quality Audit Docket</strong><br />• Total Active Tutors: 23<br />• High Performers Tier: 18 Tutors (4.5+ Rating)<br />• Student Retention Rate: 94.6%<br />• Recommended Quality Actions: Maintain weekly session audits.</div>";
      showModal("Quality Audit Export Summary", html);
    };
  }

  const refreshSuspendBtn = document.getElementById("btnRefreshSuspend");
  if (refreshSuspendBtn) {
    refreshSuspendBtn.onclick = function () {
      renderSuspendAccounts();
    };
  }
  const suspFilter = document.getElementById("suspStatusFilter");
  if (suspFilter) {
    suspFilter.onchange = function () {
      pageSuspend = 1;
      renderSuspendAccounts();
    };
  }
  const suspSearch = document.getElementById("suspSearchInput");
  if (suspSearch) {
    suspSearch.oninput = function () {
      pageSuspend = 1;
      renderSuspendAccounts();
    };
  }
  const btnFlagAccount = document.getElementById("btnFlagAccountModal");
  if (btnFlagAccount) {
    btnFlagAccount.onclick = function () {
      openFlagAccountModal();
    };
  }

  const refreshReportsBtn = document.getElementById("btnRefreshReports");
  if (refreshReportsBtn) {
    refreshReportsBtn.onclick = function () {
      renderAreaReports();
    };
  }
  const repSearch = document.getElementById("repSearchInput");
  if (repSearch) {
    repSearch.oninput = function () {
      pageReports = 1;
      renderAreaReports();
    };
  }
  const btnDownloadReport = document.getElementById("btnDownloadReportModal");
  if (btnDownloadReport) {
    btnDownloadReport.onclick = function () {
      let html = "<div class='modal-content-panel panel-neutral'><strong>Regional Area Performance Docket (October 2026)</strong><br />• Gross Tuition Volume Disbursed: ৳2,75,000<br />• Overall Matching SLA: 96.4%<br />• Active Tuition Placements: 1,150<br />• Full certified report is archived in administrative registry.</div>";
      showModal("Comprehensive Area Performance Report", html);
    };
  }

  const refreshBroadcastBtn = document.getElementById("btnRefreshBroadcast");
  if (refreshBroadcastBtn) {
    refreshBroadcastBtn.onclick = function () {
      renderBroadcastAlerts();
    };
  }

  renderDashboard();
  renderVerifyTutors();
  renderApproveProfiles();
  renderDisputes();
  renderTutorQuality();
  renderSuspendAccounts();
  renderAreaReports();
  renderBroadcastAlerts();
  bindBroadcastForm();
  renderProfilePage();
  initEditProfilePage();
});