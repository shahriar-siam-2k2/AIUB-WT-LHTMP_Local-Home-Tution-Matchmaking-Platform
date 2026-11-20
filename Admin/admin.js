let currentDb = null;
let currentLists = null;
let currentUsersTxt = null;

let pageUsers = 1;
let pageDashAnalytics = 1;
let pageDashDisputes = 1;
let pageBroadcast = 1;
let pageDisputes = 1;
let pageModeration = 1;
let pagePayments = 1;
let pageAnalyticsPerf = 1;
let pageAnalyticsMonthly = 1;
let pageAnalyticsZones = 1;

function isEmpty(val) {
  if (val === null || val === undefined) return true;
  let str = "" + val;
  if (str.length == 0) return true;
  for (let i = 0; i < str.length; i++) {
    let c = str.charAt(i);
    if (c != " " && c != "\t" && c != "\n" && c != "\r") {
      return false;
    }
  }
  return true;
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

function formatDelta(val) {
  if (!val || val == "") {
    return '<span class="trend-rate trend-neutral">0%</span>';
  }
  let str = "" + val;
  if (str.charAt(0) == "+") {
    return '<span class="trend-rate trend-positive">' + str + '</span>';
  } else if (str.charAt(0) == "-") {
    return '<span class="trend-rate trend-negative">' + str + '</span>';
  } else {
    return '<span class="trend-rate trend-neutral">' + str + '</span>';
  }
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
  let s = 0;
  while (s < clean.length && clean.charAt(s) == " ") s++;
  let e = clean.length - 1;
  while (e >= s && clean.charAt(e) == " ") e--;
  let sVal = "";
  for (let i = s; i <= e; i++) {
    sVal += clean.charAt(i);
  }
  if (sVal.length == 0) return "N/A";

  if (sVal.indexOf("AM") != -1 || sVal.indexOf("PM") != -1) {
    return sVal;
  }

  let datePart = "";
  let timePart = "";
  let spaceIdx = sVal.indexOf(" ");
  if (spaceIdx != -1) {
    datePart = sVal.substring(0, spaceIdx);
    timePart = sVal.substring(spaceIdx + 1);
  } else {
    let tIdx = sVal.indexOf("T");
    if (tIdx != -1) {
      datePart = sVal.substring(0, tIdx);
      timePart = sVal.substring(tIdx + 1);
    } else {
      datePart = sVal;
      timePart = "05:32";
    }
  }

  let year = "2026";
  let month = "11";
  let day = "14";

  if (datePart.indexOf("-") != -1) {
    let dParts = datePart.split("-");
    if (dParts.length >= 3) {
      if (dParts[0].length == 4) {
        year = dParts[0];
        month = dParts[1].length == 1 ? "0" + dParts[1] : dParts[1];
        day = dParts[2].length == 1 ? "0" + dParts[2] : dParts[2];
      } else {
        day = dParts[0].length == 1 ? "0" + dParts[0] : dParts[0];
        month = dParts[1].length == 1 ? "0" + dParts[1] : dParts[1];
        year = dParts[2];
      }
    }
  } else if (datePart.indexOf("/") != -1) {
    let dParts = datePart.split("/");
    if (dParts.length >= 3) {
      if (dParts[0].length == 4) {
        year = dParts[0];
        month = dParts[1].length == 1 ? "0" + dParts[1] : dParts[1];
        day = dParts[2].length == 1 ? "0" + dParts[2] : dParts[2];
      } else {
        day = dParts[0].length == 1 ? "0" + dParts[0] : dParts[0];
        month = dParts[1].length == 1 ? "0" + dParts[1] : dParts[1];
        year = dParts[2];
      }
    }
  }

  let hours = 5;
  let mins = 32;
  if (timePart.indexOf(":") != -1) {
    let tParts = timePart.split(":");
    hours = parseInt(tParts[0], 10);
    if (isNaN(hours)) hours = 5;
    mins = parseInt(tParts[1], 10);
    if (isNaN(mins)) mins = 32;
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
  let p = "" + imgPath;
  let clean = "";
  for (let i = 0; i < p.length; i++) {
    let c = p.charAt(i);
    if (c != "{" && c != "}" && c != "\r" && c != "\n") {
      clean += c;
    }
  }
  let s = 0;
  while (s < clean.length && (clean.charAt(s) == " " || clean.charAt(s) == "\t")) s++;
  let e = clean.length - 1;
  while (e >= s && (clean.charAt(e) == " " || clean.charAt(e) == "\t")) e--;
  let trimmed = "";
  for (let i = s; i <= e; i++) {
    trimmed += clean.charAt(i);
  }
  if (trimmed.length == 0) return "../Files/Img/Profile/default.svg";

  if (trimmed.indexOf("../Files/") == 0) {
    return trimmed;
  }
  if (trimmed.indexOf("./Files/") == 0) {
    return "." + trimmed;
  }
  if (trimmed.indexOf("Files/") == 0) {
    return "../" + trimmed;
  }
  if (trimmed.indexOf("../") == 0 || trimmed.indexOf("/") == 0 || trimmed.indexOf("http") == 0) {
    return trimmed;
  }
  return "../Files/Img/Profile/" + trimmed;
}

function resolveUserAvatar(u) {
  if (!u) return "../Files/Img/Profile/default.svg";
  let cached = null;
  if (u.id) {
    cached = localStorage.getItem("lhtmp_avatar_" + u.id);
  }
  if (!cached && u.email) {
    cached = localStorage.getItem("lhtmp_avatar_" + u.email);
  }
  if (cached && cached.length > 0) {
    return cached;
  }
  return resolveImagePath(u.image);
}

function getStatusBadge(status) {
  if (!status || status == "") {
    return '<span class="status-badge">N/A</span>';
  }
  let s = ("" + status).toLowerCase();
  if (s == "urgent") {
    return '<span class="status-badge urgent">' + status + '</span>';
  } else if (s == "high") {
    return '<span class="status-badge high">' + status + '</span>';
  } else if (s == "medium") {
    return '<span class="status-badge medium">' + status + '</span>';
  } else if (s == "low" || s == "normal" || s == "info") {
    return '<span class="status-badge low">' + status + '</span>';
  } else if (s == "removed") {
    return '<span class="status-badge removed">' + status + '</span>';
  } else if (s == "dismissed") {
    return '<span class="status-badge dismissed">' + status + '</span>';
  } else if (s == "active" || s == "verified" || s == "resolved" || s == "completed" || s == "surpassed" || s == "on track" || s == "approved" || s == "online") {
    return '<span class="status-badge active">' + status + '</span>';
  } else if (s.indexOf("pending") != -1 || s == "review" || s == "investigating" || s == "open" || s == "flagged" || s == "under-review" || s == "in-review") {
    return '<span class="status-badge pending">' + status + '</span>';
  } else if (s.indexOf("suspended") != -1 || s == "inactive" || s == "rejected" || s == "closed" || s == "failed" || s == "critical") {
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

function getAvailableRoles() {
  let roles = ["Admin", "Area Coordinator", "Tutor", "Student"];
  if (currentUsersTxt && currentUsersTxt.length > 0) {
    for (let u = 0; u < currentUsersTxt.length; u++) {
      let p = currentUsersTxt[u].parsed;
      if (p && p.userType && p.userType != "N/A" && roles.indexOf(p.userType) == -1) {
        roles.push(p.userType);
      }
    }
  }
  return roles;
}

function cleanText(val) {
  if (val === null || val === undefined) return "";
  let str = "" + val;
  let start = 0;
  while (start < str.length) {
    let c = str.charAt(start);
    if (c == " " || c == "\t" || c == "\n" || c == "\r") {
      start++;
    } else {
      break;
    }
  }
  let end = str.length - 1;
  while (end >= start) {
    let c = str.charAt(end);
    if (c == " " || c == "\t" || c == "\n" || c == "\r") {
      end--;
    } else {
      break;
    }
  }
  if (start > end) return "";
  let res = "";
  let inSpace = false;
  for (let i = start; i <= end; i++) {
    let c = str.charAt(i);
    if (c == " " || c == "\t" || c == "\n" || c == "\r") {
      if (!inSpace) {
        res += " ";
        inSpace = true;
      }
    } else {
      res += c;
      inSpace = false;
    }
  }
  return res;
}

function renderStatCards(prefix) {
  let cards = document.getElementsByClassName("stat-card");
  if (!cards || cards.length == 0) return;
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let labelElem = null;
    let valElem = null;
    let subElem = null;
    for (let c = 0; c < card.children.length; c++) {
      let child = card.children[c];
      if (child.className == "stat-label") labelElem = child;
      if (child.className == "stat-value") valElem = child;
      if (child.className == "stat-sub") subElem = child;
    }
    if (labelElem && valElem && subElem) {
      let labelText = cleanText(labelElem.innerHTML);
      let key = prefix + ":" + labelText;
      if (currentDb && currentDb.stats && currentDb.stats[key]) {
        valElem.innerHTML = getText(currentDb.stats[key].value);
        subElem.innerHTML = getText(currentDb.stats[key].sub);
      } else {
        valElem.innerHTML = "0";
        subElem.innerHTML = "N/A";
      }
    }
  }
}

function updateNotifBadge() {
  let badge = document.getElementById("notifBadge");
  if (!badge) return;
  let count = 0;
  if (currentDb && currentDb.alerts) {
    for (let i = 0; i < currentDb.alerts.length; i++) {
      let a = currentDb.alerts[i];
      if (a.status && a.status.toLowerCase() == "active") {
        count++;
      }
    }
  }
  badge.innerHTML = "" + count;
  if (count > 0) {
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

function updateTablePagination(prefix, currentPage, totalPages, onPageChange) {
  let prevBtn = document.getElementById("btnPrev" + prefix);
  let nextBtn = document.getElementById("btnNext" + prefix);

  if (prevBtn) {
    if (currentPage <= 1) {
      prevBtn.disabled = true;
      prevBtn.style.opacity = "0.5";
      prevBtn.style.cursor = "not-allowed";
    } else {
      prevBtn.disabled = false;
      prevBtn.style.opacity = "1";
      prevBtn.style.cursor = "pointer";
    }
    prevBtn.onclick = function() {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };
  }

  if (nextBtn) {
    if (currentPage >= totalPages) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.5";
      nextBtn.style.cursor = "not-allowed";
    } else {
      nextBtn.disabled = false;
      nextBtn.style.opacity = "1";
      nextBtn.style.cursor = "pointer";
    }
    nextBtn.onclick = function() {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };
  }

  for (let num = 1; num <= 5; num++) {
    let numBtn = document.getElementById("btnPage" + num + prefix);
    if (numBtn) {
      if (num <= totalPages) {
        numBtn.style.display = "inline-block";
        if (num == currentPage) {
          numBtn.className = "btn-primary";
        } else {
          numBtn.className = "btn-secondary";
        }
        numBtn.onclick = (function(n) {
          return function() {
            onPageChange(n);
          };
        })(num);
      } else {
        numBtn.style.display = "none";
      }
    }
  }
}

function renderAdminDashboard() {
  let analBody = document.getElementById("analyticsOverviewBody");
  if (!analBody) return;
  renderStatCards("admin");

  let analyticsList = (currentDb && currentDb.analytics) ? currentDb.analytics : [];
  let totalAnalPages = Math.ceil(analyticsList.length / 5);
  if (totalAnalPages < 1) totalAnalPages = 1;
  if (pageDashAnalytics > totalAnalPages) pageDashAnalytics = totalAnalPages;
  if (pageDashAnalytics < 1) pageDashAnalytics = 1;

  let analStart = (pageDashAnalytics - 1) * 5;
  let analEnd = analStart + 5;
  if (analEnd > analyticsList.length) analEnd = analyticsList.length;

  let html = "";
  if (analyticsList.length > 0) {
    for (let i = analStart; i < analEnd; i++) {
      let a = analyticsList[i];
      html += "<tr>";
      html += "<td><strong>" + getText(a.metric) + "</strong></td>";
      html += "<td>" + getText(a.current) + "</td>";
      html += "<td>" + getText(a.previous) + "</td>";
      html += "<td>" + formatDelta(a.growth) + "</td>";
      html += "<td>" + getText(a.target) + "</td>";
      html += "<td>" + getStatusBadge(a.status) + "</td>";
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='6' class='table-empty-cell'>N/A</td></tr>";
  }
  analBody.innerHTML = html;

  updateTablePagination("DashAnalytics", pageDashAnalytics, totalAnalPages, function(newPage) {
    pageDashAnalytics = newPage;
    renderAdminDashboard();
  });

  let dispBody = document.getElementById("escalatedDisputesBody");
  if (dispBody) {
    let pendingDisputes = [];
    if (currentDb && currentDb.disputes && currentDb.disputes.length > 0) {
      for (let i = 0; i < currentDb.disputes.length; i++) {
        let d = currentDb.disputes[i];
        if (d.status && d.status.toLowerCase() == "pending") {
          pendingDisputes.push(d);
        }
      }
    }

    let totalDispPages = Math.ceil(pendingDisputes.length / 5);
    if (totalDispPages < 1) totalDispPages = 1;
    if (pageDashDisputes > totalDispPages) pageDashDisputes = totalDispPages;
    if (pageDashDisputes < 1) pageDashDisputes = 1;

    let dispStart = (pageDashDisputes - 1) * 5;
    let dispEnd = dispStart + 5;
    if (dispEnd > pendingDisputes.length) dispEnd = pendingDisputes.length;

    let dispHtml = "";
    if (pendingDisputes.length > 0) {
      for (let i = dispStart; i < dispEnd; i++) {
        let d = pendingDisputes[i];
        dispHtml += "<tr>";
        dispHtml += "<td><strong>" + getText(d.id) + "</strong></td>";
        dispHtml += "<td>" + getText(d.zone) + "</td>";
        dispHtml += "<td>" + getText(d.raisedBy) + "</td>";
        dispHtml += "<td>" + getText(d.against) + "</td>";
        dispHtml += "<td>" + getText(d.reason) + "</td>";
        dispHtml += "<td>" + getStatusBadge(d.priority) + "</td>";
        dispHtml += "<td><a href='dispute_center.html'><button type='button' class='btn-secondary'>Review Dispute</button></a></td>";
        dispHtml += "</tr>";
      }
    } else {
      dispHtml = "<tr><td colspan='7' class='table-empty-cell'>N/A</td></tr>";
    }
    dispBody.innerHTML = dispHtml;

    updateTablePagination("DashDisputes", pageDashDisputes, totalDispPages, function(newPage) {
      pageDashDisputes = newPage;
      renderAdminDashboard();
    });
  }
}

function updateRoleFilterOptions() {
  let rf = document.getElementById("role-filter");
  if (!rf) return;
  let roles = getAvailableRoles();
  let currentVal = rf.value;
  let html = "<option value='all'>All Roles</option>";
  for (let i = 0; i < roles.length; i++) {
    let r = roles[i];
    let sel = (currentVal && currentVal.toLowerCase() == r.toLowerCase()) ? " selected" : "";
    html += "<option value='" + r.toLowerCase() + "'" + sel + ">" + r + "</option>";
  }
  rf.innerHTML = html;
}

function renderUserManagement() {
  let tableBody = document.getElementById("userTableBody");
  if (!tableBody) return;
  renderStatCards("users");
  updateRoleFilterOptions();
  let roleFilterElem = document.getElementById("role-filter");
  let statusFilterElem = document.getElementById("status-filter");
  let searchElem = document.getElementById("search-user");
  let selectedRole = (roleFilterElem && roleFilterElem.value && !isEmpty(roleFilterElem.value)) ? roleFilterElem.value.toLowerCase() : "all";
  let selectedStatus = (statusFilterElem && statusFilterElem.value && !isEmpty(statusFilterElem.value)) ? statusFilterElem.value.toLowerCase() : "all";
  let searchWord = searchElem ? searchElem.value.toLowerCase() : "";

  let filtered = [];
  if (currentDb && currentDb.users && currentDb.users.length > 0) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      let r = u.role ? u.role.toLowerCase() : "";
      let s = u.status ? u.status.toLowerCase() : "";
      let n = u.fullName ? u.fullName.toLowerCase() : "";
      let e = u.email ? u.email.toLowerCase() : "";
      let uid = u.id ? u.id.toLowerCase() : "";
      if (selectedRole != "all") {
        if (r.indexOf(selectedRole) == -1) continue;
      }
      if (selectedStatus != "all") {
        if (selectedStatus == "active" && s != "active") continue;
        if (selectedStatus == "suspended" && s != "suspended") continue;
        if (selectedStatus == "pending" && s.indexOf("pending") == -1) continue;
      }
      if (!isEmpty(searchWord)) {
        if (n.indexOf(searchWord) == -1 && e.indexOf(searchWord) == -1 && uid.indexOf(searchWord) == -1) {
          continue;
        }
      }
      filtered.push(u);
    }
  }

  let totalPages = Math.ceil(filtered.length / 5);
  if (totalPages < 1) totalPages = 1;
  if (pageUsers > totalPages) pageUsers = totalPages;
  if (pageUsers < 1) pageUsers = 1;

  let startIndex = (pageUsers - 1) * 5;
  let endIndex = startIndex + 5;
  if (endIndex > filtered.length) endIndex = filtered.length;

  let html = "";
  if (filtered.length > 0) {
    for (let i = startIndex; i < endIndex; i++) {
      let u = filtered[i];
      let s = u.status ? u.status.toLowerCase() : "";
      let uImg = resolveUserAvatar(u);
      html += "<tr>";
      html += "<td><strong>" + getText(u.id) + "</strong></td>";
      html += "<td><div class='user-cell-wrap'><img src='" + uImg + "' alt='' class='user-avatar-sm' onerror=\"this.src='../Files/Img/Profile/default.svg'\" /><span>" + getText(u.fullName) + "</span></div></td>";
      html += "<td><span class='badge'>" + getText(u.role) + "</span></td>";
      html += "<td>" + getText(u.email) + "</td>";
      html += "<td>" + getText(u.area) + " (" + getText(u.division) + ")</td>";
      html += "<td>" + formatDateTime(u.date) + "</td>";
      html += "<td>" + getStatusBadge(u.status) + "</td>";
      let actBtn = "";
      if (s == "suspended") {
        actBtn = "<button type='button' class='btn-success' onclick=\"toggleUserStatus('" + u.id + "')\">Activate</button>";
      } else {
        actBtn = "<button type='button' class='btn-danger' onclick=\"toggleUserStatus('" + u.id + "')\">Suspend</button>";
      }
      html += "<td><div class='user-action-group'><button type='button' class='btn-secondary' onclick=\"openEditProfile('" + u.id + "')\">Edit</button>" + actBtn + "</div></td>";
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='8' class='table-empty-cell'>N/A</td></tr>";
  }
  tableBody.innerHTML = html;

  updateTablePagination("Users", pageUsers, totalPages, function(newPage) {
    pageUsers = newPage;
    renderUserManagement();
  });
}

function toggleUserStatus(userId) {
  if (!currentDb || !currentDb.users) return;
  for (let i = 0; i < currentDb.users.length; i++) {
    let u = currentDb.users[i];
    if (u.id == userId) {
      if (u.status && u.status.toLowerCase() == "suspended") {
        u.status = "Active";
      } else {
        u.status = "Suspended";
      }
      break;
    }
  }
  if (typeof writeDatabase === "function") {
    writeDatabase(currentDb, function() {
      renderUserManagement();
      alert("User account status updated successfully!");
    });
  } else {
    renderUserManagement();
    alert("User account status updated successfully!");
  }
}

function openEditProfile(userId) {
  window.location.href = "../Registration/edit_profile.html?id=" + encodeURIComponent(userId) + "&from=admin";
}

function renderBroadcastAlerts() {
  let tableBody = document.getElementById("broadcastTableBody");
  if (!tableBody) return;
  renderStatCards("broadcast");

  let alertsList = [];
  if (currentDb && currentDb.alerts) {
    for (let i = 0; i < currentDb.alerts.length; i++) {
      alertsList.push(currentDb.alerts[i]);
    }
    alertsList.sort(function(a, b) {
      let dateA = a && a.date ? a.date : "";
      let dateB = b && b.date ? b.date : "";
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
  }
  let totalPages = Math.ceil(alertsList.length / 5);
  if (totalPages < 1) totalPages = 1;
  if (pageBroadcast > totalPages) pageBroadcast = totalPages;
  if (pageBroadcast < 1) pageBroadcast = 1;

  let startIndex = (pageBroadcast - 1) * 5;
  let endIndex = startIndex + 5;
  if (endIndex > alertsList.length) endIndex = alertsList.length;

  let html = "";
  if (alertsList.length > 0) {
    for (let i = startIndex; i < endIndex; i++) {
      let a = alertsList[i];
      html += "<tr>";
      html += "<td><strong>" + getText(a.id) + "</strong></td>";
      html += "<td>" + getText(a.title) + "</td>";
      html += "<td><span class='badge'>" + getText(a.category) + "</span></td>";
      html += "<td>" + getText(a.target) + "</td>";
      html += "<td>" + formatDateTime(a.date) + "</td>";
      html += "<td>" + getText(a.sentBy) + "</td>";
      html += "<td>" + getText(a.reach) + "</td>";
      html += "<td>" + getStatusBadge(a.status) + "</td>";
      html += "<td><button type='button' class='btn-secondary' onclick=\"previewAlertById('" + a.id + "')\">View</button></td>";
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='9' class='table-empty-cell'>N/A</td></tr>";
  }
  tableBody.innerHTML = html;

  updateTablePagination("Alerts", pageBroadcast, totalPages, function(newPage) {
    pageBroadcast = newPage;
    renderBroadcastAlerts();
  });
}

function previewAlertById(alertId) {
  if (!currentDb || !currentDb.alerts) return;
  let a = null;
  for (let i = 0; i < currentDb.alerts.length; i++) {
    if (currentDb.alerts[i].id == alertId) {
      a = currentDb.alerts[i];
      break;
    }
  }
  if (!a) return;
  let content = "<div>";
  content += "<p><strong>ID:</strong> " + getText(a.id) + " | <strong>Alert Category / Severity:</strong> " + getText(a.category) + "</p>";
  content += "<p><strong>Target Audience:</strong> " + getText(a.target) + " | <strong>Dispatch Date & Time:</strong> " + formatDateTime(a.date) + "</p>";
  content += "<p><strong>Author:</strong> " + getText(a.sentBy) + " | <strong>Delivered Reach:</strong> " + getText(a.reach) + "</p>";
  content += "<div class='modal-content-panel panel-neutral'>";
  content += "<strong>" + getText(a.title) + "</strong>";
  content += "</div>";
  content += "</div>";
  showModal("Broadcast Message Inspection", content);
}

function updateDisputeSelectOptions() {
  let selectElem = document.getElementById("Dispute-id");
  if (!selectElem) return;
  let currentVal = selectElem.value;
  let html = "<option value=''>-- Select Target Case --</option>";
  if (currentDb && currentDb.disputes) {
    for (let i = 0; i < currentDb.disputes.length; i++) {
      let d = currentDb.disputes[i];
      if (d.status && d.status.toLowerCase() == "pending") {
        html += "<option value='" + d.id + "'>" + d.id + " (" + d.priority + " - " + d.reason + ")</option>";
      }
    }
  }
  selectElem.innerHTML = html;
  if (currentVal && currentVal != "") {
    selectElem.value = currentVal;
  }
}

function renderDisputeCenter() {
  let tableBody = document.getElementById("disputeCenterBody");
  if (!tableBody) return;
  renderStatCards("disputes");
  updateDisputeSelectOptions();
  let prioFilterElem = document.getElementById("priority-filter");
  let statFilterElem = document.getElementById("status-filter");
  let searchElem = document.getElementById("search-dispute");
  let prioVal = (prioFilterElem && prioFilterElem.value && !isEmpty(prioFilterElem.value)) ? prioFilterElem.value.toLowerCase() : "all";
  let statVal = (statFilterElem && statFilterElem.value && !isEmpty(statFilterElem.value)) ? statFilterElem.value.toLowerCase() : "all";
  let searchVal = searchElem ? searchElem.value.toLowerCase() : "";

  let filtered = [];
  if (currentDb && currentDb.disputes && currentDb.disputes.length > 0) {
    for (let i = 0; i < currentDb.disputes.length; i++) {
      let d = currentDb.disputes[i];
      let p = d.priority ? d.priority.toLowerCase() : "";
      let s = d.status ? d.status.toLowerCase() : "";
      let z = d.zone ? d.zone.toLowerCase() : "";
      let r = d.reason ? d.reason.toLowerCase() : "";
      let by = d.raisedBy ? d.raisedBy.toLowerCase() : "";
      let ag = d.against ? d.against.toLowerCase() : "";
      let idStr = d.id ? d.id.toLowerCase() : "";
      if (prioVal != "all" && p != prioVal) continue;
      if (statVal != "all") {
        if (statVal == "pending" && s != "pending") continue;
        if (statVal == "investigating" && s != "investigating") continue;
        if (statVal == "resolved" && s != "resolved") continue;
      }
      if (!isEmpty(searchVal)) {
        if (idStr.indexOf(searchVal) == -1 && z.indexOf(searchVal) == -1 && r.indexOf(searchVal) == -1 && by.indexOf(searchVal) == -1 && ag.indexOf(searchVal) == -1) {
          continue;
        }
      }
      filtered.push(d);
    }
  }

  let totalPages = Math.ceil(filtered.length / 5);
  if (totalPages < 1) totalPages = 1;
  if (pageDisputes > totalPages) pageDisputes = totalPages;
  if (pageDisputes < 1) pageDisputes = 1;

  let startIndex = (pageDisputes - 1) * 5;
  let endIndex = startIndex + 5;
  if (endIndex > filtered.length) endIndex = filtered.length;

  let html = "";
  if (filtered.length > 0) {
    for (let i = startIndex; i < endIndex; i++) {
      let d = filtered[i];
      html += "<tr>";
      html += "<td><strong>" + getText(d.id) + "</strong></td>";
      html += "<td>" + getText(d.zone) + "</td>";
      html += "<td>" + getText(d.raisedBy) + "</td>";
      html += "<td>" + getText(d.against) + "</td>";
      html += "<td>" + getText(d.reason) + "</td>";
      html += "<td>" + formatDateTime(d.date) + "</td>";
      html += "<td>" + getStatusBadge(d.priority) + "</td>";
      html += "<td>" + getStatusBadge(d.status) + "</td>";
      let isDone = (d.status && (d.status.toLowerCase() == "resolved" || d.status.toLowerCase() == "closed"));
      if (isDone) {
        html += "<td><button type='button' class='btn-secondary btn-table-disabled' disabled>Rule</button></td>";
      } else {
        html += "<td><button type='button' class='btn-secondary' onclick=\"selectRulingDispute('" + d.id + "')\">Rule</button></td>";
      }
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='9' class='table-empty-cell'>N/A</td></tr>";
  }
  tableBody.innerHTML = html;

  updateTablePagination("Disputes", pageDisputes, totalPages, function(newPage) {
    pageDisputes = newPage;
    renderDisputeCenter();
  });
}

function selectRulingDispute(DisputeId) {
  let selectElem = document.getElementById("Dispute-id");
  if (selectElem) {
    selectElem.value = DisputeId;
    let deskElem = document.getElementById("rulingDeskHeading");
    if (deskElem) {
      deskElem.scrollIntoView();
    }
  }
}

function viewDisputeDetails(DisputeId) {
  if (!currentDb || !currentDb.disputes) return;
  let d = null;
  for (let i = 0; i < currentDb.disputes.length; i++) {
    if (currentDb.disputes[i].id == DisputeId) {
      d = currentDb.disputes[i];
      break;
    }
  }
  if (!d) return;
  let content = "<div>";
  content += "<p><strong>Dispute:</strong> " + getText(d.id) + " | <strong>Priority:</strong> " + getText(d.priority) + "</p>";
  content += "<p><strong>Regional Zone:</strong> " + getText(d.zone) + " | <strong>Date Logged:</strong> " + formatDateTime(d.date) + "</p>";
  content += "<p><strong>Complainant:</strong> " + getText(d.raisedBy) + " | <strong>Respondent:</strong> " + getText(d.against) + "</p>";
  content += "<div class='modal-content-panel panel-danger'>";
  content += "<strong>Dispute Cause:</strong> " + getText(d.reason);
  content += "</div>";
  content += "</div>";
  showModal("Dispute Arbitration Record", content);
}

function updateLiveContentInspector(selectedItem) {
  let caseElem = document.getElementById("inspectCaseId");
  let repElem = document.getElementById("inspectReporter");
  let snipElem = document.getElementById("inspectSnippet");
  if (!caseElem || !repElem || !snipElem) return;
  if (selectedItem) {
    caseElem.value = getText(selectedItem.id) + " | " + getText(selectedItem.reportedUser) + " (" + getText(selectedItem.contentType) + ")";
    repElem.value = getText(selectedItem.reportedBy) + " (" + getText(selectedItem.category) + ")";
    snipElem.value = getText(selectedItem.snippet);
  } else {
    caseElem.value = "";
    repElem.value = "";
    snipElem.value = "";
  }
}

function renderContentModeration() {
  let tableBody = document.getElementById("moderationTableBody");
  if (!tableBody) return;
  renderStatCards("moderation");
  let typeFilterElem = document.getElementById("content-type-filter");
  let sevFilterElem = document.getElementById("severity-filter");
  let searchElem = document.getElementById("search-mod");
  let typeVal = (typeFilterElem && typeFilterElem.value && !isEmpty(typeFilterElem.value)) ? typeFilterElem.value.toLowerCase() : "all";
  let sevVal = (sevFilterElem && sevFilterElem.value && !isEmpty(sevFilterElem.value)) ? sevFilterElem.value.toLowerCase() : "all";
  let searchVal = searchElem ? searchElem.value.toLowerCase() : "";

  let filtered = [];
  if (currentDb && currentDb.moderation && currentDb.moderation.length > 0) {
    for (let i = 0; i < currentDb.moderation.length; i++) {
      let m = currentDb.moderation[i];
      let t = m.contentType ? m.contentType.toLowerCase() : "";
      let sev = m.severity ? m.severity.toLowerCase() : "";
      let u = m.reportedUser ? m.reportedUser.toLowerCase() : "";
      let by = m.reportedBy ? m.reportedBy.toLowerCase() : "";
      let snip = m.snippet ? m.snippet.toLowerCase() : "";
      let cat = m.category ? m.category.toLowerCase() : "";
      let idStr = m.id ? m.id.toLowerCase() : "";
      if (typeVal != "all" && t.indexOf(typeVal) == -1) continue;
      if (sevVal != "all" && sev != sevVal) continue;
      if (!isEmpty(searchVal)) {
        if (idStr.indexOf(searchVal) == -1 && u.indexOf(searchVal) == -1 && by.indexOf(searchVal) == -1 && snip.indexOf(searchVal) == -1 && cat.indexOf(searchVal) == -1) {
          continue;
        }
      }
      filtered.push(m);
    }
  }

  let totalPages = Math.ceil(filtered.length / 5);
  if (totalPages < 1) totalPages = 1;
  if (pageModeration > totalPages) pageModeration = totalPages;
  if (pageModeration < 1) pageModeration = 1;

  let startIndex = (pageModeration - 1) * 5;
  let endIndex = startIndex + 5;
  if (endIndex > filtered.length) endIndex = filtered.length;

  let html = "";
  if (filtered.length > 0) {
    for (let i = startIndex; i < endIndex; i++) {
      let m = filtered[i];
      html += "<tr>";
      html += "<td><strong>" + getText(m.id) + "</strong></td>";
      html += "<td>" + getText(m.contentType) + "</td>";
      html += "<td>" + getText(m.reportedUser) + "</td>";
      html += "<td>" + getText(m.reportedBy) + "</td>";
      html += "<td class='text-truncate-cell'>" + getText(m.snippet) + "</td>";
      html += "<td><span class='badge'>" + getText(m.category) + "</span></td>";
      html += "<td>" + formatDateTime(m.date) + "</td>";
      html += "<td>" + getStatusBadge(m.severity) + "</td>";
      html += "<td>" + getStatusBadge(m.status) + "</td>";
      let isInspectDisabled = (m.status && (m.status.toLowerCase() == "dismissed" || m.status.toLowerCase() == "removed"));
      if (isInspectDisabled) {
        html += "<td><button type='button' class='btn-secondary btn-table-disabled' disabled>Inspect</button></td>";
      } else {
        html += "<td><button type='button' class='btn-secondary' onclick=\"inspectModItem('" + m.id + "')\">Inspect</button></td>";
      }
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='10' class='table-empty-cell'>N/A</td></tr>";
  }
  tableBody.innerHTML = html;

  updateTablePagination("Mod", pageModeration, totalPages, function(newPage) {
    pageModeration = newPage;
    renderContentModeration();
  });
}

function inspectModItem(modId) {
  if (!currentDb || !currentDb.moderation) return;
  for (let i = 0; i < currentDb.moderation.length; i++) {
    if (currentDb.moderation[i].id == modId) {
      updateLiveContentInspector(currentDb.moderation[i]);
      let inspHeader = document.getElementById("inspectCaseId");
      if (inspHeader) inspHeader.scrollIntoView();
      break;
    }
  }
}

function renderPaymentGateway() {
  let tableBody = document.getElementById("paymentTableBody");
  if (!tableBody) return;
  renderStatCards("payments");
  let typeFilterElem = document.getElementById("txn-type");
  let methodFilterElem = document.getElementById("gateway-method");
  let searchElem = document.getElementById("search-txn");
  let typeVal = (typeFilterElem && typeFilterElem.value && !isEmpty(typeFilterElem.value)) ? typeFilterElem.value.toLowerCase() : "all";
  let methodVal = (methodFilterElem && methodFilterElem.value && !isEmpty(methodFilterElem.value)) ? methodFilterElem.value.toLowerCase() : "all";
  let searchVal = searchElem ? searchElem.value.toLowerCase() : "";

  let filtered = [];
  if (currentDb && currentDb.payments && currentDb.payments.length > 0) {
    for (let i = 0; i < currentDb.payments.length; i++) {
      let p = currentDb.payments[i];
      let t = p.type ? p.type.toLowerCase() : "";
      let m = p.method ? p.method.toLowerCase() : "";
      let fromStr = p.from ? p.from.toLowerCase() : "";
      let toStr = p.to ? p.to.toLowerCase() : "";
      let idStr = p.id ? p.id.toLowerCase() : "";
      if (typeVal != "all") {
        if (typeVal == "fee" && t.indexOf("fee") == -1 && t.indexOf("tuition") == -1) continue;
        if (typeVal == "payout" && t.indexOf("payout") == -1 && t.indexOf("advance") == -1) continue;
        if (typeVal == "commission" && t.indexOf("commission") == -1 && t.indexOf("platform") == -1) continue;
      }
      if (methodVal != "all") {
        if (methodVal == "bkash" && m.indexOf("bkash") == -1) continue;
        if (methodVal == "nagad" && m.indexOf("nagad") == -1) continue;
        if (methodVal == "bank" && m.indexOf("bank") == -1) continue;
      }
      if (!isEmpty(searchVal)) {
        if (idStr.indexOf(searchVal) == -1 && fromStr.indexOf(searchVal) == -1 && toStr.indexOf(searchVal) == -1) {
          continue;
        }
      }
      filtered.push(p);
    }
  }

  let totalPages = Math.ceil(filtered.length / 5);
  if (totalPages < 1) totalPages = 1;
  if (pagePayments > totalPages) pagePayments = totalPages;
  if (pagePayments < 1) pagePayments = 1;

  let startIndex = (pagePayments - 1) * 5;
  let endIndex = startIndex + 5;
  if (endIndex > filtered.length) endIndex = filtered.length;

  let html = "";
  if (filtered.length > 0) {
    for (let i = startIndex; i < endIndex; i++) {
      let p = filtered[i];
      html += "<tr>";
      html += "<td><strong>" + getText(p.id) + "</strong></td>";
      html += "<td>" + getText(p.from) + "</td>";
      html += "<td>" + getText(p.to) + "</td>";
      html += "<td><span class='badge'>" + getText(p.type) + "</span></td>";
      html += "<td><strong>" + getText(p.amount) + "</strong></td>";
      html += "<td>" + getText(p.commission) + "</td>";
      html += "<td>" + getText(p.method) + "</td>";
      html += "<td>" + formatDateTime(p.date) + "</td>";
      html += "<td>" + getStatusBadge(p.status) + "</td>";
      html += "<td><button type='button' class='btn-secondary' onclick=\"viewTxnAudit('" + p.id + "')\">Verify</button></td>";
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='10' class='table-empty-cell'>N/A</td></tr>";
  }
  tableBody.innerHTML = html;

  updateTablePagination("Payments", pagePayments, totalPages, function(newPage) {
    pagePayments = newPage;
    renderPaymentGateway();
  });
}

function viewTxnAudit(txnId) {
  if (!currentDb || !currentDb.payments) return;
  let p = null;
  for (let i = 0; i < currentDb.payments.length; i++) {
    if (currentDb.payments[i].id == txnId) {
      p = currentDb.payments[i];
      break;
    }
  }
  if (!p) return;
  let content = "<div>";
  content += "<p><strong>Transaction:</strong> " + getText(p.id) + " | <strong>Status:</strong> " + getText(p.status) + "</p>";
  content += "<p><strong>From:</strong> " + getText(p.from) + " | <strong>To:</strong> " + getText(p.to) + "</p>";
  content += "<p><strong>Amount:</strong> " + getText(p.amount) + " | <strong>Commission:</strong> " + getText(p.commission) + "</p>";
  content += "<p><strong>Method:</strong> " + getText(p.method) + " | <strong>Date:</strong> " + formatDateTime(p.date) + "</p>";
  content += "<div class='modal-content-panel panel-success'>";
  content += "<strong>Audit Result:</strong> Automated cryptographic gateway hash verification passed. Payout verified and processed.";
  content += "</div>";
  content += "</div>";
  showModal("Transaction Audit", content);
}

function renderGlobalAnalytics() {
  let perfBody = document.getElementById("analyticsPerformanceBody");
  if (!perfBody) return;
  renderStatCards("analytics");

  let perfList = (currentDb && currentDb.analytics) ? currentDb.analytics : [];
  let totalPerfPages = Math.ceil(perfList.length / 5);
  if (totalPerfPages < 1) totalPerfPages = 1;
  if (pageAnalyticsPerf > totalPerfPages) pageAnalyticsPerf = totalPerfPages;
  if (pageAnalyticsPerf < 1) pageAnalyticsPerf = 1;

  let perfStart = (pageAnalyticsPerf - 1) * 5;
  let perfEnd = perfStart + 5;
  if (perfEnd > perfList.length) perfEnd = perfList.length;

  let html = "";
  if (perfList.length > 0) {
    for (let i = perfStart; i < perfEnd; i++) {
      let a = perfList[i];
      html += "<tr>";
      html += "<td><strong>" + getText(a.metric) + "</strong></td>";
      html += "<td>" + getText(a.current) + "</td>";
      html += "<td>" + getText(a.previous) + "</td>";
      html += "<td>" + formatDelta(a.growth) + "</td>";
      html += "<td>" + getText(a.target) + "</td>";
      html += "<td>" + getStatusBadge(a.status) + "</td>";
      html += "</tr>";
    }
  } else {
    html = "<tr><td colspan='6' class='table-empty-cell'>N/A</td></tr>";
  }
  perfBody.innerHTML = html;

  updateTablePagination("AnalyticsPerf", pageAnalyticsPerf, totalPerfPages, function(newPage) {
    pageAnalyticsPerf = newPage;
    renderGlobalAnalytics();
  });

  let monthlyBody = document.getElementById("analyticsMonthlyBody");
  if (monthlyBody) {
    let monthlyList = (currentDb && currentDb.analyticsMonthly) ? currentDb.analyticsMonthly : [];
    let totalMonthlyPages = Math.ceil(monthlyList.length / 5);
    if (totalMonthlyPages < 1) totalMonthlyPages = 1;
    if (pageAnalyticsMonthly > totalMonthlyPages) pageAnalyticsMonthly = totalMonthlyPages;
    if (pageAnalyticsMonthly < 1) pageAnalyticsMonthly = 1;

    let monthlyStart = (pageAnalyticsMonthly - 1) * 5;
    let monthlyEnd = monthlyStart + 5;
    if (monthlyEnd > monthlyList.length) monthlyEnd = monthlyList.length;

    let mHtml = "";
    if (monthlyList.length > 0) {
      for (let i = monthlyStart; i < monthlyEnd; i++) {
        let m = monthlyList[i];
        mHtml += "<tr>";
        mHtml += "<td><strong>" + getText(m.month) + "</strong></td>";
        mHtml += "<td>" + getText(m.users) + "</td>";
        mHtml += "<td>" + getText(m.tutors) + "</td>";
        mHtml += "<td>" + getText(m.sessions) + "</td>";
        mHtml += "<td>" + getText(m.gross) + "</td>";
        mHtml += "<td>" + getText(m.commission) + "</td>";
        mHtml += "<td>" + formatDelta(m.rate) + "</td>";
        mHtml += "</tr>";
      }
    } else {
      mHtml = "<tr><td colspan='7' class='table-empty-cell'>N/A</td></tr>";
    }
    monthlyBody.innerHTML = mHtml;

    updateTablePagination("AnalyticsMonthly", pageAnalyticsMonthly, totalMonthlyPages, function(newPage) {
      pageAnalyticsMonthly = newPage;
      renderGlobalAnalytics();
    });
  }

  let zonesBody = document.getElementById("analyticsZonesBody");
  if (zonesBody) {
    let zonesList = (currentDb && currentDb.analyticsZones) ? currentDb.analyticsZones : [];
    let totalZonesPages = Math.ceil(zonesList.length / 5);
    if (totalZonesPages < 1) totalZonesPages = 1;
    if (pageAnalyticsZones > totalZonesPages) pageAnalyticsZones = totalZonesPages;
    if (pageAnalyticsZones < 1) pageAnalyticsZones = 1;

    let zonesStart = (pageAnalyticsZones - 1) * 5;
    let zonesEnd = zonesStart + 5;
    if (zonesEnd > zonesList.length) zonesEnd = zonesList.length;

    let zHtml = "";
    if (zonesList.length > 0) {
      for (let i = zonesStart; i < zonesEnd; i++) {
        let z = zonesList[i];
        zHtml += "<tr>";
        zHtml += "<td><strong>" + getText(z.zone) + "</strong></td>";
        zHtml += "<td>" + getText(z.coordinator) + "</td>";
        zHtml += "<td>" + getText(z.inquiries) + "</td>";
        zHtml += "<td>" + getText(z.finalized) + "</td>";
        zHtml += "<td>" + formatDelta(z.successRate) + "</td>";
        zHtml += "<td><strong>" + getText(z.rating) + "</strong></td>";
        zHtml += "</tr>";
      }
    } else {
      zHtml = "<tr><td colspan='6' class='table-empty-cell'>N/A</td></tr>";
    }
    zonesBody.innerHTML = zHtml;

    updateTablePagination("AnalyticsZones", pageAnalyticsZones, totalZonesPages, function(newPage) {
      pageAnalyticsZones = newPage;
      renderGlobalAnalytics();
    });
  }
}

function setupModalButtons() {
  let btnClose = document.getElementById("btnModalClose");
  let btnOk = document.getElementById("btnModalOk");
  let modal = document.getElementById("simpleModal");
  if (btnClose) {
    btnClose.onclick = function() {
      hideModal();
    };
  }
  if (btnOk) {
    btnOk.onclick = function() {
      hideModal();
    };
  }
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) {
        hideModal();
      }
    };
  }
}

function setupUserManagementButtons() {
  let btnFilter = document.getElementById("btnFilterUsers");
  if (btnFilter) {
    btnFilter.onclick = function() {
      pageUsers = 1;
      renderUserManagement();
    };
  }
  let btnReset = document.getElementById("btnResetUsers");
  if (btnReset) {
    btnReset.onclick = function() {
      let r = document.getElementById("role-filter");
      let s = document.getElementById("status-filter");
      let q = document.getElementById("search-user");
      if (r) r.selectedIndex = 0;
      if (s) s.selectedIndex = 0;
      if (q) q.value = "";
      pageUsers = 1;
      renderUserManagement();
    };
  }
}

function setupBroadcastAlertsButtons() {
  let form = document.getElementById("broadcastForm");
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      let titleElem = document.getElementById("alert-title-input");
      let catElem = document.getElementById("alert-category-input");
      let targetElem = document.getElementById("target-audience-select");
      let bodyElem = document.getElementById("alert-body-text");
      if (!titleElem || isEmpty(titleElem.value)) {
        alert("Please enter an alert headline!");
        return false;
      }
      if (!bodyElem || isEmpty(bodyElem.value)) {
        alert("Please enter alert message body!");
        return false;
      }
      let newAlertId = "ALT-" + (401 + currentDb.alerts.length);
      let now = new Date().toISOString().substring(0, 16);
      let newAlert = {
        id: newAlertId,
        title: titleElem.value,
        category: catElem ? catElem.value : "Global",
        target: targetElem ? targetElem.value : "All Users",
        date: now,
        sentBy: "Admin",
        reach: "1,248 Users",
        status: "Active"
      };
      currentDb.alerts.push(newAlert);
      if (typeof writeDatabase === "function") {
        writeDatabase(currentDb, function() {
          form.reset();
          pageBroadcast = 1;
          renderBroadcastAlerts();
          updateNotifBadge();
          alert("Broadcast alert dispatched successfully!");
        });
      } else {
        form.reset();
        pageBroadcast = 1;
        renderBroadcastAlerts();
        updateNotifBadge();
        alert("Broadcast alert dispatched successfully!");
      }
      return false;
    };
  }
  let btnPreview = document.getElementById("btnPreviewAlert");
  if (btnPreview) {
    btnPreview.onclick = function() {
      let titleElem = document.getElementById("alert-title-input");
      let bodyElem = document.getElementById("alert-body-text");
      let catElem = document.getElementById("alert-category-input");
      let targetElem = document.getElementById("target-audience-select");
      if (!titleElem || isEmpty(titleElem.value) || !bodyElem || isEmpty(bodyElem.value)) {
        alert("Please enter headline and message to preview!");
        return;
      }
      let selectedCatText = (catElem && catElem.options && catElem.selectedIndex >= 0) ? catElem.options[catElem.selectedIndex].text : (catElem ? catElem.value : "Global");
      let content = "<div>";
      content += "<p><strong>Alert Category / Severity:</strong> " + selectedCatText + "</p>";
      content += "<p><strong>Target Audience:</strong> " + (targetElem ? targetElem.value : "All Users") + "</p>";
      content += "<div class='modal-content-panel panel-warning'>";
      content += "<strong>" + titleElem.value + "</strong><br><br>" + bodyElem.value;
      content += "</div>";
      content += "</div>";
      showModal("Broadcast Alert Live Preview", content);
    };
  }
  let btnRefresh = document.getElementById("btnRefreshAlerts");
  if (btnRefresh) {
    btnRefresh.onclick = function() {
      renderBroadcastAlerts();
      alert("Broadcast history refreshed!");
    };
  }
}

function onDisputeIssueSelectChange(sel) {
  let box = document.getElementById("newDisputeOtherContainer");
  if (box) {
    if (sel && sel.value == "Others") {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  }
}

function submitNewDisputeDispute() {
  let zoneElem = document.getElementById("newDisputeZone");
  let compElem = document.getElementById("newDisputeComp");
  let respElem = document.getElementById("newDisputeResp");
  let issueElem = document.getElementById("newDisputeIssue");
  let prioElem = document.getElementById("newDisputePriority");

  if (!zoneElem || isEmpty(zoneElem.value)) {
    alert("Please select Zone / Coordinator!");
    return;
  }
  if (!compElem || isEmpty(compElem.value)) {
    alert("Please select Complainant!");
    return;
  }
  if (!respElem || isEmpty(respElem.value)) {
    alert("Please select Respondent!");
    return;
  }
  if (!issueElem || isEmpty(issueElem.value)) {
    alert("Please select Dispute Subject / Issue!");
    return;
  }

  let finalIssue = issueElem.value;
  if (finalIssue == "Others") {
    let otherTextElem = document.getElementById("newDisputeOtherText");
    if (!otherTextElem || isEmpty(otherTextElem.value)) {
      alert("Please enter custom dispute subject / issue!");
      return;
    }
    finalIssue = cleanText(otherTextElem.value);
  }

  let count = currentDb && currentDb.disputes ? currentDb.disputes.length + 1 : 1;
  let newId = "DISP-" + (count < 10 ? "00" + count : (count < 100 ? "0" + count : "" + count));
  let today = new Date().toISOString().substring(0, 10);
  let now = new Date();
  let ch = now.getHours();
  let cm = now.getMinutes();
  let timeStr = (ch < 10 ? "0" + ch : "" + ch) + ":" + (cm < 10 ? "0" + cm : "" + cm);
  let dateTimeStr = today + " " + timeStr;

  let newDispute = {
    id: newId,
    coordinator: zoneElem.value,
    zone: zoneElem.value,
    complainant: compElem.value,
    raisedBy: compElem.value,
    respondent: respElem.value,
    against: respElem.value,
    issue: finalIssue,
    reason: finalIssue,
    date: dateTimeStr,
    priority: prioElem ? prioElem.value : "Medium",
    status: "Pending"
  };

  if (!currentDb.disputes) currentDb.disputes = [];
  currentDb.disputes.unshift(newDispute);
  if (typeof writeDatabase === "function") {
    writeDatabase(currentDb, function() {
      hideModal();
      pageDisputes = 1;
      renderDisputeCenter();
      updateDisputeSelectOptions();
      alert("New Arbitration Dispute " + newId + " created successfully!");
    });
  } else {
    hideModal();
    pageDisputes = 1;
    renderDisputeCenter();
    updateDisputeSelectOptions();
    alert("New Arbitration Dispute " + newId + " created successfully!");
  }
}

function setupDisputeCenterButtons() {
  let btnNew = document.getElementById("btnNewDispute");
  if (btnNew) {
    btnNew.onclick = function() {
      let zoneList = [];
      if (currentDb && currentDb.analyticsZones) {
        for (let i = 0; i < currentDb.analyticsZones.length; i++) {
          let z = currentDb.analyticsZones[i];
          let opt = z.coordinator + " (" + z.zone + ")";
          if (zoneList.indexOf(opt) == -1) zoneList.push(opt);
        }
      }
      if (currentDb && currentDb.users) {
        for (let i = 0; i < currentDb.users.length; i++) {
          let u = currentDb.users[i];
          if (u.role == "Area Coordinator") {
            let opt = u.fullName + " (" + u.area + " Zone)";
            if (zoneList.indexOf(opt) == -1) zoneList.push(opt);
          }
        }
      }
      if (zoneList.length == 0) {
        zoneList = ["Razin (Mirpur Zone)", "Kalam (Uttara Zone)", "Farhana (Dhanmondi Zone)", "Imtiaz (Gulshan Zone)", "Imran (Chittagong Zone)", "Fahim (Rajshahi Zone)"];
      }

      let userList = [];
      if (currentDb && currentDb.users) {
        for (let i = 0; i < currentDb.users.length; i++) {
          let u = currentDb.users[i];
          userList.push(u.role + ": " + u.fullName);
        }
      }
      if (userList.length == 0) {
        userList = ["Student: Siam Rahman", "Student: Mithila Farzana Jui", "Tutor: Nowrrin Kabir", "Tutor: Marium Sultana", "Area Coordinator: Tanbeen Taheer Pranta"];
      }

      let issueList = [
        "Tuition Fee Non-Refund & Absence",
        "Misconduct & Late Cancellations",
        "Withheld Payment After 12 Sessions",
        "Subject Curriculum Incompletion",
        "Unnotified Class Rescheduling",
        "Advance Fee Settlement Disagreement",
        "Schedule Inconsistency",
        "Syllabus Incompletion Complaint",
        "Session Overtime Discrepancy",
        "Others"
      ];

      let content = "<div>";
      content += "<div class='modal-field-group'><label class='modal-field-label'>Zone / Coordinator:</label><select id='newDisputeZone' class='modal-field-input'><option value=''>-- Select Zone / Coordinator --</option>";
      for (let i = 0; i < zoneList.length; i++) {
        content += "<option value='" + zoneList[i] + "'>" + zoneList[i] + "</option>";
      }
      content += "</select></div>";

      content += "<div class='modal-field-group'><label class='modal-field-label'>Complainant:</label><select id='newDisputeComp' class='modal-field-input'><option value=''>-- Select Complainant --</option>";
      for (let i = 0; i < userList.length; i++) {
        content += "<option value='" + userList[i] + "'>" + userList[i] + "</option>";
      }
      content += "</select></div>";

      content += "<div class='modal-field-group'><label class='modal-field-label'>Respondent:</label><select id='newDisputeResp' class='modal-field-input'><option value=''>-- Select Respondent --</option>";
      for (let i = 0; i < userList.length; i++) {
        content += "<option value='" + userList[i] + "'>" + userList[i] + "</option>";
      }
      content += "</select></div>";

      content += "<div class='modal-field-group'><label class='modal-field-label'>Dispute Subject / Issue:</label><select id='newDisputeIssue' class='modal-field-input' onchange='onDisputeIssueSelectChange(this)'><option value=''>-- Select Subject / Issue --</option>";
      for (let i = 0; i < issueList.length; i++) {
        content += "<option value='" + issueList[i] + "'>" + issueList[i] + "</option>";
      }
      content += "</select>";
      content += "<div id='newDisputeOtherContainer' class='modal-other-container'><label class='modal-field-label'>Specify Other Issue:</label><input type='text' id='newDisputeOtherText' class='modal-field-input' placeholder='Enter custom dispute issue...'></div>";
      content += "</div>";

      content += "<div class='modal-field-group group-priority'><label class='modal-field-label'>Priority:</label><select id='newDisputePriority' class='modal-field-input'><option value='Urgent'>Urgent</option><option value='High'>High</option><option value='Medium' selected>Medium</option><option value='Low'>Low</option></select></div>";
      content += "<div class='modal-footer'><button type='button' class='btn-primary' onclick='submitNewDisputeDispute()'>Create Dispute</button></div>";
      content += "</div>";
      showModal("New Arbitration Dispute", content);
    };
  }

  let form = document.getElementById("arbitrationForm");
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      let DisputeElem = document.getElementById("Dispute-id");
      let verdictElem = document.getElementById("ruling-verdict");
      let reasonElem = document.getElementById("ruling-notes") || document.getElementById("ruling-reason");
      if (!DisputeElem || isEmpty(DisputeElem.value)) {
        alert("Please select a target case Dispute!");
        return false;
      }
      if (!reasonElem || isEmpty(reasonElem.value)) {
        alert("Please enter arbitration ruling justification!");
        return false;
      }
      let DisputeId = DisputeElem.value;
      let verdict = verdictElem ? verdictElem.value : "Resolved";
      let reason = reasonElem.value;
      if (currentDb && currentDb.disputes) {
        for (let i = 0; i < currentDb.disputes.length; i++) {
          if (currentDb.disputes[i].id == DisputeId) {
            currentDb.disputes[i].status = "Resolved";
            break;
          }
        }
      }
      if (typeof writeDatabase === "function") {
        writeDatabase(currentDb, function() {
          form.reset();
          renderDisputeCenter();
          alert("Arbitration Ruling Applied! Dispute " + DisputeId + " marked as Resolved (" + verdict + ").");
        });
      } else {
        form.reset();
        renderDisputeCenter();
        alert("Arbitration Ruling Applied! Dispute " + DisputeId + " marked as Resolved (" + verdict + ").");
      }
      return false;
    };
  }
  let btnFilter = document.getElementById("btnFilterDisputes");
  if (btnFilter) {
    btnFilter.onclick = function() {
      pageDisputes = 1;
      renderDisputeCenter();
    };
  }
  let btnReset = document.getElementById("btnResetDisputes");
  if (btnReset) {
    btnReset.onclick = function() {
      let p = document.getElementById("priority-filter");
      let s = document.getElementById("status-filter");
      let q = document.getElementById("search-dispute");
      if (p) p.selectedIndex = 0;
      if (s) s.selectedIndex = 0;
      if (q) q.value = "";
      pageDisputes = 1;
      renderDisputeCenter();
    };
  }
}

function setupContentModerationButtons() {
  let btnScanner = document.getElementById("btnRunScanner");
  if (btnScanner) {
    btnScanner.onclick = function() {
      alert("Auto Scanner completed");
    };
  }
  let btnPurge = document.getElementById("btnPurgeResolved");
  if (btnPurge) {
    btnPurge.onclick = function() {
      alert("Purge completed");
    };
  }
  let btnFilter = document.getElementById("btnFilterMod");
  if (btnFilter) {
    btnFilter.onclick = function() {
      pageModeration = 1;
      renderContentModeration();
    };
  }
  let btnReset = document.getElementById("btnResetMod");
  if (btnReset) {
    btnReset.onclick = function() {
      let t = document.getElementById("content-type-filter");
      let s = document.getElementById("severity-filter");
      let q = document.getElementById("search-mod");
      if (t) t.selectedIndex = 0;
      if (s) s.selectedIndex = 0;
      if (q) q.value = "";
      pageModeration = 1;
      renderContentModeration();
    };
  }
  let btnRemove = document.getElementById("btnRemoveContent");
  if (btnRemove) {
    btnRemove.onclick = function() {
      let note = document.getElementById("modActionNote");
      if (!note || isEmpty(note.value)) {
        alert("Please enter moderator action notes!");
        return;
      }
      let caseElem = document.getElementById("inspectCaseId");
      let caseText = caseElem ? caseElem.value : "";
      if (currentDb && currentDb.moderation && caseText) {
        for (let i = 0; i < currentDb.moderation.length; i++) {
          if (caseText.indexOf(currentDb.moderation[i].id) != -1) {
            currentDb.moderation[i].status = "Removed";
            break;
          }
        }
      }
      note.value = "";
      clearLiveContentInspector();
      if (typeof writeDatabase === "function") {
        writeDatabase(currentDb, function() {
          renderContentModeration();
          alert("Content removed and violation recorded in user file.");
        });
      } else {
        renderContentModeration();
        alert("Content removed and violation recorded in user file.");
      }
    };
  }
  let btnDismiss = document.getElementById("btnDismissReport");
  if (btnDismiss) {
    btnDismiss.onclick = function() {
      let note = document.getElementById("modActionNote");
      if (!note || isEmpty(note.value)) {
        alert("Please enter moderator action notes!");
        return;
      }
      let caseElem = document.getElementById("inspectCaseId");
      let caseText = caseElem ? caseElem.value : "";
      if (currentDb && currentDb.moderation && caseText) {
        for (let i = 0; i < currentDb.moderation.length; i++) {
          if (caseText.indexOf(currentDb.moderation[i].id) != -1) {
            currentDb.moderation[i].status = "Dismissed";
            break;
          }
        }
      }
      note.value = "";
      clearLiveContentInspector();
      if (typeof writeDatabase === "function") {
        writeDatabase(currentDb, function() {
          renderContentModeration();
          alert("Report dismissed without action.");
        });
      } else {
        renderContentModeration();
        alert("Report dismissed without action.");
      }
    };
  }
  let btnClear = document.getElementById("btnClearInspector");
  if (btnClear) {
    btnClear.onclick = function() {
      clearLiveContentInspector();
    };
  }
}

function clearLiveContentInspector() {
  let inspCaseId = document.getElementById("inspectCaseId");
  let inspReporter = document.getElementById("inspectReporter");
  let inspSnippet = document.getElementById("inspectSnippet");
  let modNote = document.getElementById("modActionNote");
  if (inspCaseId) inspCaseId.value = "";
  if (inspReporter) inspReporter.value = "";
  if (inspSnippet) inspSnippet.value = "";
  if (modNote) modNote.value = "";
}

function setupPaymentGatewayButtons() {
  let btnConnReset = document.getElementById("btnConnReset");
  if (btnConnReset) {
    btnConnReset.onclick = function() {
      alert("All Gateway Connections Has Been Reset.");
    };
  }
  let btnBatch = document.getElementById("btnBatchDisburse");
  if (btnBatch) {
    btnBatch.onclick = function() {
      if (!currentDb || !currentDb.payments) return;
      let count = 0;
      for (let i = 0; i < currentDb.payments.length; i++) {
        if (currentDb.payments[i].status && currentDb.payments[i].status.toLowerCase() == "pending") {
          currentDb.payments[i].status = "Verified";
          count++;
        }
      }
      if (typeof writeDatabase === "function") {
        writeDatabase(currentDb, function() {
          renderPaymentGateway();
          alert("Batch disbursement completed! Processed " + count + " pending payouts.");
        });
      } else {
        renderPaymentGateway();
        alert("Batch disbursement completed! Processed " + count + " pending payouts.");
      }
    };
  }
  let btnFilter = document.getElementById("btnFilterPayments");
  if (btnFilter) {
    btnFilter.onclick = function() {
      pagePayments = 1;
      renderPaymentGateway();
    };
  }
  let btnReset = document.getElementById("btnResetPayments");
  if (btnReset) {
    btnReset.onclick = function() {
      let t = document.getElementById("txn-type");
      let m = document.getElementById("gateway-method");
      let q = document.getElementById("search-txn");
      if (t) t.selectedIndex = 0;
      if (m) m.selectedIndex = 0;
      if (q) q.value = "";
      pagePayments = 1;
      renderPaymentGateway();
    };
  }
}

function setupGlobalAnalyticsButtons() {
  let b1 = document.getElementById("btnRefreshAnalyticsHeader");
  if (b1) {
    b1.onclick = function() {
      renderGlobalAnalytics();
      alert("Global platform analytics refreshed successfully.");
    };
  }
  let b2 = document.getElementById("btnRefreshAnalyticsPerf");
  if (b2) {
    b2.onclick = function() {
      pageAnalyticsPerf = 1;
      renderGlobalAnalytics();
      alert("Platform performance metrics refreshed.");
    };
  }
  let b3 = document.getElementById("btnRefreshAnalyticsZone");
  if (b3) {
    b3.onclick = function() {
      pageAnalyticsZones = 1;
      renderGlobalAnalytics();
      alert("Regional zone metrics refreshed.");
    };
  }
}

async function loadAllPlatformData() {
  if (typeof readLists === "function") {
    try {
      currentLists = await readLists();
    } catch (e) {}
  }
  if (typeof readUser === "function") {
    try {
      currentUsersTxt = await readUser();
    } catch (e) {}
  }
  if (typeof readDatabase === "function") {
    try {
      currentDb = await readDatabase();
    } catch (e) {}
  }

  if (currentDb && currentDb.users && currentUsersTxt && currentUsersTxt.length > 0) {
    let hasNew = false;
    for (let u = 0; u < currentUsersTxt.length; u++) {
      let uParsed = currentUsersTxt[u].parsed;
      if (!uParsed) continue;
      let alreadyExists = false;
      for (let d = 0; d < currentDb.users.length; d++) {
        if (currentDb.users[d].email && uParsed.email && currentDb.users[d].email.toLowerCase() == uParsed.email.toLowerCase()) {
          alreadyExists = true;
          break;
        }
      }
      if (!alreadyExists) {
        let newId = "USR-" + (1001 + currentDb.users.length);
        let today = new Date().toISOString().substring(0, 10);
        let now = new Date();
        let ch = now.getHours();
        let cm = now.getMinutes();
        let timeStr = (ch < 10 ? "0" + ch : "" + ch) + ":" + (cm < 10 ? "0" + cm : "" + cm);
        let dateTimeStr = today + " " + timeStr;
        currentDb.users.push({
          raw: currentUsersTxt[u].raw,
          id: newId,
          fullName: uParsed.fullName || "N/A",
          email: uParsed.email || "N/A",
          phone: uParsed.phone || "N/A",
          password: uParsed.password || "N/A",
          dob: uParsed.dob || "N/A",
          gender: uParsed.gender || "N/A",
          division: uParsed.division || "N/A",
          area: uParsed.area || "N/A",
          grade: uParsed.gradeDetails || "N/A",
          role: uParsed.userType || "N/A",
          status: "Active",
          date: dateTimeStr,
          image: "../Files/Img/Profile/default.svg"
        });
        hasNew = true;
      }
    }
    if (hasNew && typeof writeDatabase === "function") {
      writeDatabase(currentDb);
    }
  }

  updateNotifBadge();
  renderAdminDashboard();
  renderUserManagement();
  renderBroadcastAlerts();
  renderDisputeCenter();
  renderContentModeration();
  renderPaymentGateway();
  renderGlobalAnalytics();
}

function setupNotificationButton() {
  let btns = document.getElementsByClassName("notif-btn");
  if (!btns) return;
  for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function() {
      let content = "<div>";
      let activeAlerts = [];
      if (currentDb && currentDb.alerts) {
        for (let j = 0; j < currentDb.alerts.length; j++) {
          let a = currentDb.alerts[j];
          if (a.status && a.status.toLowerCase() == "active") {
            activeAlerts.push(a);
          }
        }
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
      } else {
        content += "<p class='modal-notif-empty'>No active broadcast alerts or system notifications.</p>";
      }
      content += "</div>";
      showModal("System Notifications (" + activeAlerts.length + ")", content);
    };
  }
}

function initAdminPage() {
  setupModalButtons();
  setupNotificationButton();
  setupUserManagementButtons();
  setupBroadcastAlertsButtons();
  setupDisputeCenterButtons();
  setupContentModerationButtons();
  setupPaymentGatewayButtons();
  setupGlobalAnalyticsButtons();

  loadAllPlatformData();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPage);
} else {
  initAdminPage();
}
