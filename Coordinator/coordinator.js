function hasText(str) {
  if (!str || str.length == 0) return false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 32) {
      return true;
    }
  }
  return false;
}

function cleanInputText(val) {
  if (val === null || val === undefined) return "";
  let str = "" + val;
  let start = 0;
  while (start < str.length && str.charCodeAt(start) <= 32) {
    start++;
  }
  let end = str.length - 1;
  while (end >= start && str.charCodeAt(end) <= 32) {
    end--;
  }
  let res = "";
  for (let i = start; i <= end; i++) {
    res += str.charAt(i);
  }
  return res;
}

function triggerAlert(msg) {
  if (typeof alert == "function") {
    alert(msg);
  } else if (typeof window != "undefined" && typeof window.alert == "function") {
    window.alert(msg);
  }
}

function setFieldError(fieldId, errId, msg) {
  const errElem = document.getElementById(errId);
  if (errElem) {
    errElem.textContent = msg;
    errElem.className = "field-error active";
  }
  const inputElem = document.getElementById(fieldId);
  if (inputElem) {
    if (inputElem.className.indexOf("input-error") == -1) {
      inputElem.className = inputElem.className ? inputElem.className + " input-error" : "input-error";
    }
  }
}

function clearFieldError(fieldId, errId) {
  const errElem = document.getElementById(errId);
  if (errElem) {
    errElem.textContent = "";
    errElem.className = "field-error";
  }
  const inputElem = document.getElementById(fieldId);
  if (inputElem && inputElem.className) {
    const parts = inputElem.className.split(" ");
    let kept = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] != "input-error" && parts[i].length > 0) {
        kept = kept.concat([parts[i]]);
      }
    }
    inputElem.className = kept.join(" ");
  }
}

function attachClearListener(fieldId, errId) {
  const el = document.getElementById(fieldId);
  if (el) {
    el.addEventListener("input", function () {
      clearFieldError(fieldId, errId);
    });
    el.addEventListener("change", function () {
      clearFieldError(fieldId, errId);
    });
  }
}

function showModal(title, bodyHtml) {
  const modal = document.getElementById("simpleModal");
  const modalTitle = document.getElementById("simpleModalTitle");
  const modalBody = document.getElementById("simpleModalBody");
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = bodyHtml;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("simpleModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function viewAccountHistory(accId, userName, userRole, issueSummary) {
  let html = "<div class='modal-detail-row'><span class='modal-detail-label'>Account Reference:</span><span class='modal-detail-val'>" + accId + " - " + userName + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Account Classification:</span><span class='modal-detail-val'>" + userRole + "</span></div>";
  html += "<div class='modal-detail-row'><span class='modal-detail-label'>Primary Incident:</span><span class='modal-detail-val'>" + issueSummary + "</span></div>";
  html += "<div class='modal-content-panel panel-neutral'><strong>Compliance and Investigation Log:</strong><br />• 15-10-2026: Incident flag submitted by local student/guardian.<br />• 20-10-2026: Area Coordinator issued official verification notice.<br />• 28-10-2026: Disciplinary review docket archived in regional registry.</div>";
  showModal("Account Disciplinary History - " + accId, html);
  triggerAlert("Account Disciplinary History - " + accId + "\nUser: " + userName + " (" + userRole + ")\nIssue: " + issueSummary);
}

function bindBroadcastForm() {
  const form = document.getElementById("broadcastAlertForm") || document.getElementById("bcastForm");
  const alertBox = document.getElementById("broadcastAlertBox");
  if (!form) return;

  attachClearListener("target-audience", "err-target-audience");
  attachClearListener("alert-priority", "err-alert-priority");
  attachClearListener("alert-title", "err-alert-title");
  attachClearListener("delivery-channel", "err-delivery-channel");
  attachClearListener("alert-message", "err-alert-message");

  form.addEventListener("reset", function () {
    clearFieldError("target-audience", "err-target-audience");
    clearFieldError("alert-priority", "err-alert-priority");
    clearFieldError("alert-title", "err-alert-title");
    clearFieldError("delivery-channel", "err-delivery-channel");
    clearFieldError("alert-message", "err-alert-message");
    if (alertBox) {
      alertBox.style.display = "none";
      alertBox.textContent = "";
    }
  });

  form.onsubmit = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const aud = document.getElementById("target-audience");
    const pri = document.getElementById("alert-priority");
    const tit = document.getElementById("alert-title");
    const chan = document.getElementById("delivery-channel");
    const msg = document.getElementById("alert-message");

    const audVal = aud ? cleanInputText(aud.value) : "";
    const priVal = pri ? cleanInputText(pri.value) : "";
    const titleVal = tit ? cleanInputText(tit.value) : "";
    const chanVal = chan ? cleanInputText(chan.value) : "";
    const msgVal = msg ? cleanInputText(msg.value) : "";

    let hasError = false;
    let firstInvalid = null;

    let audValid = false;
    if (aud) {
      if (audVal.length > 0) {
        audValid = true;
      } else if (aud.options && aud.options.length > 0) {
        audValid = true;
      }
    }
    if (!audValid) {
      setFieldError("target-audience", "err-target-audience", "Select target audience");
      hasError = true;
      if (!firstInvalid) firstInvalid = aud;
    } else {
      clearFieldError("target-audience", "err-target-audience");
    }

    let priValid = false;
    if (pri) {
      if (priVal.length > 0) {
        priValid = true;
      } else if (pri.options && pri.options.length > 0) {
        priValid = true;
      }
    }
    if (!priValid) {
      setFieldError("alert-priority", "err-alert-priority", "Select alert priority");
      hasError = true;
      if (!firstInvalid) firstInvalid = pri;
    } else {
      clearFieldError("alert-priority", "err-alert-priority");
    }

    if (!tit || titleVal.length == 0) {
      setFieldError("alert-title", "err-alert-title", "Enter announcement subject");
      hasError = true;
      if (!firstInvalid) firstInvalid = tit;
    } else if (titleVal.length < 5) {
      setFieldError("alert-title", "err-alert-title", "Subject must be at least 5 characters long");
      hasError = true;
      if (!firstInvalid) firstInvalid = tit;
    } else {
      clearFieldError("alert-title", "err-alert-title");
    }

    let chanValid = false;
    if (chan) {
      if (chanVal.length > 0) {
        chanValid = true;
      } else if (chan.options && chan.options.length > 0) {
        chanValid = true;
      }
    }
    if (!chanValid) {
      setFieldError("delivery-channel", "err-delivery-channel", "Select delivery channel");
      hasError = true;
      if (!firstInvalid) firstInvalid = chan;
    } else {
      clearFieldError("delivery-channel", "err-delivery-channel");
    }

    if (!msg || msgVal.length == 0) {
      setFieldError("alert-message", "err-alert-message", "Enter announcement message body");
      hasError = true;
      if (!firstInvalid) firstInvalid = msg;
    } else if (msgVal.length < 15) {
      setFieldError("alert-message", "err-alert-message", "Announcement message body must contain at least 15 characters");
      hasError = true;
      if (!firstInvalid) firstInvalid = msg;
    } else {
      clearFieldError("alert-message", "err-alert-message");
    }

    if (hasError) {
      if (alertBox) {
        alertBox.textContent = "Please fill in all mandatory fields before dispatching announcement.";
        alertBox.className = "alert-box alert-error";
        alertBox.style.display = "block";
      }
      if (firstInvalid && firstInvalid.focus) {
        firstInvalid.focus();
      }
      return;
    }

    if (alertBox) {
      alertBox.textContent = "Announcement broadcast sent successfully!";
      alertBox.className = "alert-box alert-success";
      alertBox.style.display = "block";
    }

    let modalHtml = "<div class='modal-content-panel panel-success'><strong>Announcement Dispatched</strong><br />Subject: " + titleVal + "<br />Message: " + msgVal + "</div>";
    showModal("Announcement Dispatched", modalHtml);
    triggerAlert("Broadcast alert dispatched successfully to all targeted users in Dhaka - Mirpur Zone.");

    if (tit) tit.value = "";
    if (msg) msg.value = "";
  };
}

function verifyTutorAccount(tutorId) {
  triggerAlert("Tutor credentials verified successfully.");
}

function rejectTutorAccount(tutorId) {
  triggerAlert("Tutor credentials rejected. Notification sent to tutor.");
}

function viewTutorDossier(tutorId) {
  triggerAlert("Viewing educational certificates and NID documents.");
}

function reviewDisputeCase(caseId) {
  triggerAlert("Opening review case docket.");
}

function resolveDisputeCase(caseId) {
  triggerAlert("Dispute case marked as resolved by coordinator mediation.");
}

function escalateDisputeCase(caseId) {
  triggerAlert("Case escalated to platform administration.");
}

function writeDatabase(db, cb) {
  if (typeof cb == "function") cb();
}

function readDatabase() {
  return null;
}

function renderDashboard() {}
function renderVerifyTutors() {}
function renderApproveProfiles() {}
function renderDisputes() {}
function renderTutorQuality() {}
function renderSuspendAccounts() {}
function renderAreaReports() {}
function renderBroadcastAlerts() {}
function renderProfilePage() {}
function initEditProfilePage() {}

document.addEventListener("DOMContentLoaded", function () {
  const notifBtn = document.getElementById("btnNotification") || document.getElementById("btnNotif");
  const simpleModal = document.getElementById("simpleModal");
  const btnModalClose = document.getElementById("btnModalClose");
  const btnModalOk = document.getElementById("btnModalOk");

  if (notifBtn && simpleModal) {
    notifBtn.addEventListener("click", function () {
      simpleModal.style.display = "flex";
    });
  }

  if (btnModalClose && simpleModal) {
    btnModalClose.addEventListener("click", function () {
      simpleModal.style.display = "none";
    });
  }

  if (btnModalOk && simpleModal) {
    btnModalOk.addEventListener("click", function () {
      simpleModal.style.display = "none";
    });
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      window.location.href = "../Login/login.html";
    });
  }

  const btnDownloadID = document.getElementById("btnDownloadID");
  if (btnDownloadID) {
    btnDownloadID.addEventListener("click", function () {
      triggerAlert("Coordinator ID card generated and downloaded.");
    });
  }

  bindBroadcastForm();

  const allButtons = document.getElementsByTagName("button");
  for (let i = 0; i < allButtons.length; i++) {
    const btn = allButtons[i];
    const bId = btn.id || "";
    const bType = btn.type || "";
    const bText = cleanInputText(btn.innerText || btn.textContent || "");

    if (bId == "btnLogout" || bId == "btnNotification" || bId == "btnNotif" || bId == "btnModalClose" || bId == "btnModalOk") {
      continue;
    }
    if (bId.indexOf("btnPage") != -1 || bId.indexOf("btnPrev") != -1 || bId.indexOf("btnNext") != -1) {
      continue;
    }
    if (bType == "submit" || bType == "reset") {
      continue;
    }
    if (btn.onclick) {
      continue;
    }

    btn.addEventListener("click", function () {
      if (bText.indexOf("Verify") != -1) {
        triggerAlert("Tutor credentials verified successfully.");
      } else if (bText.indexOf("Reject") != -1) {
        triggerAlert("Tutor credentials rejected. Notification sent to tutor.");
      } else if (bText.indexOf("View Docs") != -1 || bText.indexOf("Audit Docs") != -1) {
        triggerAlert("Viewing educational certificates and NID documents.");
      } else if (bText.indexOf("Filter") != -1) {
        triggerAlert("Filtering records based on selected criteria...");
      } else if (bText.indexOf("Refresh") != -1) {
        triggerAlert("Refreshing record listing...");
      } else if (bText.indexOf("Resolve") != -1) {
        triggerAlert("Dispute case marked as resolved by coordinator mediation.");
      } else if (bText.indexOf("Review") != -1) {
        triggerAlert("Opening review case docket.");
      } else if (bText.indexOf("Escalate") != -1) {
        triggerAlert("Case escalated to platform administration.");
      } else if (bText.indexOf("Revoke") != -1) {
        triggerAlert("Broadcast announcement has been revoked from user noticeboards.");
      } else if (bText.indexOf("History") != -1) {
        triggerAlert("Viewing disciplinary incident history.");
      } else if (bText.indexOf("Suspend") != -1) {
        triggerAlert("Account suspended under coordinator compliance policy.");
      } else if (bText.indexOf("Reinstate") != -1) {
        triggerAlert("Account reinstated to active standing.");
      } else if (bText.indexOf("Export") != -1 || bText.indexOf("Download") != -1) {
        triggerAlert("Audit docket summary exported successfully.");
      } else {
        triggerAlert("Action performed: " + bText);
      }
    });
  }
});
