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
  while (end >= start && end >= 0 && str.charCodeAt(end) <= 32) {
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

function initNotifications() {
  const btn = document.getElementById("btnNotification");
  const modal = document.getElementById("simpleModal");
  const closeBtn = document.getElementById("btnModalClose");
  const okBtn = document.getElementById("btnModalOk");

  if (btn && modal) {
    btn.addEventListener("click", function () {
      if (modal.style.display == "flex") {
        modal.style.display = "none";
      } else {
        modal.style.display = "flex";
      }
    });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }
  if (okBtn && modal) {
    okBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }
}

function initStudyMaterialsValidation() {
  const form = document.getElementById("studyMaterialUploadForm");
  if (!form) return;

  attachClearListener("material-title", "err-material-title");
  attachClearListener("material-subject", "err-material-subject");
  attachClearListener("material-grade", "err-material-grade");
  attachClearListener("material-type", "err-material-type");
  attachClearListener("material-notes", "err-material-notes");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const titleVal = cleanInputText(document.getElementById("material-title") ? document.getElementById("material-title").value : "");
    if (!hasText(titleVal)) {
      setFieldError("material-title", "err-material-title", "Material title is required.");
      valid = false;
    }

    const subEl = document.getElementById("material-subject");
    if (!subEl || !hasText(subEl.value)) {
      setFieldError("material-subject", "err-material-subject", "Subject is required.");
      valid = false;
    }

    const grEl = document.getElementById("material-grade");
    if (!grEl || !hasText(grEl.value)) {
      setFieldError("material-grade", "err-material-grade", "Target grade is required.");
      valid = false;
    }

    const typeEl = document.getElementById("material-type");
    if (!typeEl || !hasText(typeEl.value)) {
      setFieldError("material-type", "err-material-type", "Category is required.");
      valid = false;
    }

    const notesVal = cleanInputText(document.getElementById("material-notes") ? document.getElementById("material-notes").value : "");
    if (!hasText(notesVal)) {
      setFieldError("material-notes", "err-material-notes", "Description or notes are required.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    triggerAlert("Study material uploaded successfully! (Prototype)");
    form.reset();
  });
}

function initPayoutValidation() {
  const form = document.getElementById("payoutRequestForm");
  if (!form) return;

  attachClearListener("payout-amount", "err-payout-amount");
  attachClearListener("payout-method", "err-payout-method");
  attachClearListener("account-num", "err-account-num");
  attachClearListener("account-name", "err-account-name");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const amtEl = document.getElementById("payout-amount");
    const amt = amtEl ? parseInt(amtEl.value, 10) : 0;
    if (isNaN(amt) || amt < 1000) {
      setFieldError("payout-amount", "err-payout-amount", "Minimum payout amount is 1,000 taka.");
      valid = false;
    }

    const methEl = document.getElementById("payout-method");
    if (!methEl || !hasText(methEl.value)) {
      setFieldError("payout-method", "err-payout-method", "Please select payout method.");
      valid = false;
    }

    const accNum = cleanInputText(document.getElementById("account-num") ? document.getElementById("account-num").value : "");
    if (accNum.length < 11) {
      setFieldError("account-num", "err-account-num", "Account number must be at least 11 digits.");
      valid = false;
    }

    const accName = cleanInputText(document.getElementById("account-name") ? document.getElementById("account-name").value : "");
    if (!hasText(accName)) {
      setFieldError("account-name", "err-account-name", "Account holder name is required.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    triggerAlert("Payout request of ৳" + amt + " submitted successfully! (Prototype)");
    form.reset();
  });
}

function initProgressValidation() {
  const form = document.getElementById("progressLogForm");
  if (!form) return;

  attachClearListener("log-student", "err-log-student");
  attachClearListener("log-subject", "err-log-subject");
  attachClearListener("log-score", "err-log-score");
  attachClearListener("log-syllabus", "err-log-syllabus");
  attachClearListener("log-notes", "err-log-notes");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const studentVal = cleanInputText(document.getElementById("log-student") ? document.getElementById("log-student").value : "");
    if (!hasText(studentVal)) {
      setFieldError("log-student", "err-log-student", "Student name is required.");
      valid = false;
    }

    const subVal = cleanInputText(document.getElementById("log-subject") ? document.getElementById("log-subject").value : "");
    if (!hasText(subVal)) {
      setFieldError("log-subject", "err-log-subject", "Subject is required.");
      valid = false;
    }

    const scoreEl = document.getElementById("log-score");
    const score = scoreEl ? parseInt(scoreEl.value, 10) : 0;
    if (isNaN(score) || score < 0 || score > 100) {
      setFieldError("log-score", "err-log-score", "Valid test score (0-100) is required.");
      valid = false;
    }

    const sylVal = cleanInputText(document.getElementById("log-syllabus") ? document.getElementById("log-syllabus").value : "");
    if (!hasText(sylVal)) {
      setFieldError("log-syllabus", "err-log-syllabus", "Syllabus coverage is required.");
      valid = false;
    }

    const notesVal = cleanInputText(document.getElementById("log-notes") ? document.getElementById("log-notes").value : "");
    if (!hasText(notesVal)) {
      setFieldError("log-notes", "err-log-notes", "Remarks and feedback are required.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    triggerAlert("Student progress logged successfully! (Prototype)");
    form.reset();
  });
}

function initSubjectValidation() {
  const form = document.getElementById("subjectOfferingForm");
  if (!form) return;

  attachClearListener("sub-name", "err-sub-name");
  attachClearListener("sub-rate", "err-sub-rate");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const nameVal = cleanInputText(document.getElementById("sub-name") ? document.getElementById("sub-name").value : "");
    if (!hasText(nameVal)) {
      setFieldError("sub-name", "err-sub-name", "Subject title is required.");
      valid = false;
    }

    const rateEl = document.getElementById("sub-rate");
    const rate = rateEl ? parseInt(rateEl.value, 10) : 0;
    if (isNaN(rate) || rate < 1000) {
      setFieldError("sub-rate", "err-sub-rate", "Tuition fee must be at least 1,000 tk / month.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    triggerAlert("Subject offering added successfully! (Prototype)");
    form.reset();
  });
}

function initAvailabilityValidation() {
  const form = document.getElementById("availabilitySettingsForm");
  if (!form) return;

  attachClearListener("start-time", "err-start-time");
  attachClearListener("end-time", "err-end-time");
  attachClearListener("duration", "err-duration");
  attachClearListener("buffer", "err-buffer");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    const startVal = cleanInputText(document.getElementById("start-time") ? document.getElementById("start-time").value : "");
    if (!hasText(startVal)) {
      setFieldError("start-time", "err-start-time", "Start time is required.");
      valid = false;
    }

    const endVal = cleanInputText(document.getElementById("end-time") ? document.getElementById("end-time").value : "");
    if (!hasText(endVal)) {
      setFieldError("end-time", "err-end-time", "End time is required.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    triggerAlert("Working hours and availability schedule saved successfully! (Prototype)");
  });
}

function initTutorButtons() {
  const buttons = document.getElementsByTagName("button");
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const bid = btn.id || "";
    const txt = btn.textContent ? cleanInputText(btn.textContent) : "";

    if (bid == "btnNotification" || bid == "btnModalClose" || bid == "btnModalOk" || bid == "btnLogout") {
      continue;
    }

    btn.addEventListener("click", function (e) {
      if (btn.type == "submit") {
        return;
      }

      if (bid == "btnScrollToPayoutForm") {
        const target = document.getElementById("payoutRequestForm");
        if (target && target.scrollIntoView) {
          target.scrollIntoView();
        } else {
          triggerAlert("Navigating to Payout Request form...");
        }
        return;
      }

      if (bid == "btnScrollToAddSubject") {
        const target = document.getElementById("subjectOfferingForm");
        if (target && target.scrollIntoView) {
          target.scrollIntoView();
        } else {
          triggerAlert("Navigating to Subject Offering section...");
        }
        return;
      }

      if (bid == "btnScrollToProgressForm") {
        const target = document.getElementById("progressLogForm");
        if (target && target.scrollIntoView) {
          target.scrollIntoView();
        } else {
          triggerAlert("Navigating to Student Progress section...");
        }
        return;
      }

      if (bid == "btnEditProfile") {
        window.location.href = "../Registration/edit_profile.html?id=USR-1003&from=tutor";
        return;
      }

      if (bid == "btnDownloadID") {
        triggerAlert("Downloading Tutor ID Card (PDF)...");
        return;
      }

      if (bid == "btnExportEarningsPdf") {
        triggerAlert("Earnings statement downloaded as PDF successfully!");
        return;
      }

      if (bid == "btnSelectAllSlots") {
        triggerAlert("All weekly teaching slots marked as available.");
        return;
      }

      if (bid == "btnResetWeekendSlots") {
        triggerAlert("Weekend schedule reset to standard off-day.");
        return;
      }

      if (bid == "btnSaveSlots" || bid == "btnSaveSlotsBottom") {
        triggerAlert("Weekly availability time slots saved successfully!");
        return;
      }

      if (bid == "btnToggleReviewSort") {
        triggerAlert("Reviews sorted by newest rating.");
        return;
      }

      if (bid == "btnSearchBooking") {
        triggerAlert("Search query executed for booking requests.");
        return;
      }

      if (bid.indexOf("btnPage") == 0 || bid == "btnPrevBooking" || bid == "btnNextBooking" || bid == "btnPrevProgress" || bid == "btnNextProgress" || bid == "btnPrevMaterials" || bid == "btnNextMaterials") {
        triggerAlert("Navigated to requested records page.");
        return;
      }

      if (bid == "btnResetPayout" || bid == "btnResetProgress" || bid == "btnResetMaterial" || bid == "btnResetSubject") {
        triggerAlert("Form fields reset to default values.");
        return;
      }

      if (txt == "Confirm" || txt.indexOf("Confirm") != -1) {
        triggerAlert("Booking request confirmed successfully!");
        return;
      }
      if (txt == "Decline" || txt.indexOf("Decline") != -1) {
        triggerAlert("Booking request declined.");
        return;
      }
      if (txt == "Details" || txt.indexOf("Details") != -1 || txt == "View Details") {
        triggerAlert("Opening session details...");
        return;
      }
      if (txt == "Download" || txt.indexOf("Download") != -1) {
        triggerAlert("Downloading study material document...");
        return;
      }
      if (txt == "Delete" || txt.indexOf("Delete") != -1) {
        triggerAlert("Item deleted successfully.");
        return;
      }
      if (txt == "Edit" || txt.indexOf("Edit") != -1) {
        triggerAlert("Opening edit modal for subject offering...");
        return;
      }
      if (txt == "Remove" || txt.indexOf("Remove") != -1) {
        triggerAlert("Subject offering removed.");
        return;
      }
      if (txt == "View Report" || txt.indexOf("Report") != -1) {
        triggerAlert("Displaying full student progress evaluation...");
        return;
      }

      triggerAlert(txt + " button clicked.");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initNotifications();
  initStudyMaterialsValidation();
  initPayoutValidation();
  initProgressValidation();
  initSubjectValidation();
  initAvailabilityValidation();
  initTutorButtons();
});
