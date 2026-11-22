document.addEventListener("DOMContentLoaded", function () {
  function hasText(str) {
    if (!str || str.length == 0) return false;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code != 32 && code != 9 && code != 10 && code != 13) {
        return true;
      }
    }
    return false;
  }

  function setError(inpId, errId, msg) {
    const inp = document.getElementById(inpId);
    const err = document.getElementById(errId);
    if (err) {
      err.innerText = msg;
      err.className = "field-error active";
    }
    if (inp) {
      if (inp.className.indexOf("input-error") == -1) {
        if (inp.className.length == 0) {
          inp.className = "input-error";
        } else {
          inp.className = inp.className + " input-error";
        }
      }
    }
  }

  function clearError(inpId, errId) {
    const inp = document.getElementById(inpId);
    const err = document.getElementById(errId);
    if (err) {
      err.innerText = "";
      err.className = "field-error";
    }
    if (inp && inp.className.indexOf("input-error") != -1) {
      const parts = inp.className.split(" ");
      let out = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] != "input-error" && parts[i].length > 0) {
          out = out.concat([parts[i]]);
        }
      }
      inp.className = out.join(" ");
    }
  }

  function attachClearListener(inpId, errId) {
    const el = document.getElementById(inpId);
    if (el) {
      el.addEventListener("input", function () {
        clearError(inpId, errId);
      });
      el.addEventListener("change", function () {
        clearError(inpId, errId);
      });
    }
  }

  const notifBtn = document.getElementById("btnNotification") || document.getElementById("btnNotif");
  const simpleModal = document.getElementById("simpleModal");
  const btnModalClose = document.getElementById("btnModalClose");
  const btnModalOk = document.getElementById("btnModalOk");

  if (notifBtn && simpleModal) {
    notifBtn.addEventListener("click", function () {
      simpleModal.className = "modal-overlay active";
    });
  }

  if (btnModalClose && simpleModal) {
    btnModalClose.addEventListener("click", function () {
      simpleModal.className = "modal-overlay";
    });
  }

  if (btnModalOk && simpleModal) {
    btnModalOk.addEventListener("click", function () {
      simpleModal.className = "modal-overlay";
    });
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      window.location.href = "../Login/login.html";
    });
  }

  function setupPagination(containerId, prevId, p1Id, p2Id, nextId, cardBaseClass) {
    const container = document.getElementById(containerId);
    const prevBtn = document.getElementById(prevId);
    const p1Btn = document.getElementById(p1Id);
    const p2Btn = document.getElementById(p2Id);
    const nextBtn = document.getElementById(nextId);

    if (!container || !p1Btn || !p2Btn) return;

    let currentPage = 1;

    function getItems() {
      if (container.tagName == "TBODY") {
        return container.getElementsByTagName("tr");
      }
      const allDivs = container.getElementsByTagName("div");
      let matched = [];
      for (let i = 0; i < allDivs.length; i++) {
        const item = allDivs[i];
        if (cardBaseClass) {
          if (item.className == cardBaseClass || item.className == cardBaseClass + " row-hidden") {
            matched = matched.concat([item]);
          }
        }
      }
      return matched;
    }

    function setPage(pageNum) {
      currentPage = pageNum;
      const items = getItems();
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (cardBaseClass) {
          if (pageNum == 1) {
            if (i < 5) {
              el.className = cardBaseClass;
            } else {
              el.className = cardBaseClass + " row-hidden";
            }
          } else {
            if (i < 5) {
              el.className = cardBaseClass + " row-hidden";
            } else {
              el.className = cardBaseClass;
            }
          }
        } else {
          if (pageNum == 1) {
            if (i < 5) {
              el.className = "";
            } else {
              el.className = "row-hidden";
            }
          } else {
            if (i < 5) {
              el.className = "row-hidden";
            } else {
              el.className = "";
            }
          }
        }
      }

      if (pageNum == 1) {
        p1Btn.className = "btn-primary";
        p2Btn.className = "btn-secondary";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = false;
      } else {
        p1Btn.className = "btn-secondary";
        p2Btn.className = "btn-primary";
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = true;
      }
    }

    p1Btn.addEventListener("click", function () {
      setPage(1);
    });

    p2Btn.addEventListener("click", function () {
      setPage(2);
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentPage == 2) {
          setPage(1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (currentPage == 1) {
          setPage(2);
        }
      });
    }

    setPage(1);
  }

  setupPagination("dashUpcomingSessionsBody", "btnPrevDashSessions", "btnPage1DashSessions", "btnPage2DashSessions", "btnNextDashSessions");
  setupPagination("dashStudyMaterialsBody", "btnPrevDashMaterials", "btnPage1DashMaterials", "btnPage2DashMaterials", "btnNextDashMaterials");
  setupPagination("findTutorsGrid", "btnPrevTutors", "btnPage1Tutors", "btnPage2Tutors", "btnNextTutors", "tutor-card");
  setupPagination("upcomingSessionsBody", "btnPrevUpcoming", "btnPage1Upcoming", "btnPage2Upcoming", "btnNextUpcoming");
  setupPagination("pastSessionsBody", "btnPrevPast", "btnPage1Past", "btnPage2Past", "btnNextPast");
  setupPagination("studyMaterialsBody", "btnPrevMaterials", "btnPage1Materials", "btnPage2Materials", "btnNextMaterials");
  setupPagination("reviewList", "btnPrevReviews", "btnPage1Reviews", "btnPage2Reviews", "btnNextReviews", "review-item-card");

  const btnSearchTutors = document.getElementById("btnSearchTutors");
  if (btnSearchTutors) {
    btnSearchTutors.addEventListener("click", function () {
      alert("Tutor directory filtered based on search criteria.");
    });
  }

  const btnResetTutors = document.getElementById("btnResetTutors");
  if (btnResetTutors) {
    btnResetTutors.addEventListener("click", function () {
      const searchTutor = document.getElementById("searchTutorInput");
      const filterSubject = document.getElementById("filterSubjectSelect");
      const filterRate = document.getElementById("filterRateSelect");
      if (searchTutor) searchTutor.value = "";
      if (filterSubject) filterSubject.value = "";
      if (filterRate) filterRate.value = "";
      alert("Tutor search filters reset to default.");
    });
  }

  const btnSearchMaterials = document.getElementById("btnSearchMaterials");
  if (btnSearchMaterials) {
    btnSearchMaterials.addEventListener("click", function () {
      alert("Study materials filtered based on search criteria.");
    });
  }

  const btnResetMaterials = document.getElementById("btnResetMaterials");
  if (btnResetMaterials) {
    btnResetMaterials.addEventListener("click", function () {
      const searchMat = document.getElementById("searchMaterialsInput");
      const filterMat = document.getElementById("filterMaterialsSubject");
      if (searchMat) searchMat.value = "";
      if (filterMat) filterMat.value = "";
      alert("Study material filters reset to default.");
    });
  }

  const btnRequestNotes = document.getElementById("btnRequestNotes");
  if (btnRequestNotes) {
    btnRequestNotes.addEventListener("click", function () {
      alert("Study notes request forwarded to your subject tutors.");
    });
  }

  const btnPrintRoutine = document.getElementById("btnPrintRoutine");
  if (btnPrintRoutine) {
    btnPrintRoutine.addEventListener("click", function () {
      alert("Weekly timetable routine sent to printer.");
    });
  }

  const btnDownloadID = document.getElementById("btnDownloadID");
  if (btnDownloadID) {
    btnDownloadID.addEventListener("click", function () {
      alert("Student ID card generated and downloaded.");
    });
  }

  function attachContainerAlerts(containerId, matchText, alertMsg) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btns = container.getElementsByTagName("button");
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const txt = b.innerText || b.textContent || "";
      if (txt.indexOf(matchText) != -1) {
        b.addEventListener("click", function () {
          alert(alertMsg);
        });
      }
    }
  }

  attachContainerAlerts("dashUpcomingSessionsBody", "Join Class", "Connecting to live interactive tuition class...");
  attachContainerAlerts("dashUpcomingSessionsBody", "Details", "Viewing tuition session details.");
  attachContainerAlerts("dashUpcomingSessionsBody", "Reschedule", "Session reschedule request submitted to tutor.");

  attachContainerAlerts("dashFeaturedTutorsGrid", "Book Session", "Session booking request submitted successfully.");

  attachContainerAlerts("dashStudyMaterialsBody", "Download", "Study material resource PDF downloaded successfully.");

  attachContainerAlerts("findTutorsGrid", "Book Session", "Session booking request submitted successfully.");

  attachContainerAlerts("upcomingSessionsBody", "Join Class", "Connecting to live interactive tuition class...");
  attachContainerAlerts("upcomingSessionsBody", "Details", "Viewing tuition session details.");
  attachContainerAlerts("upcomingSessionsBody", "Reschedule", "Session reschedule request submitted to tutor.");

  attachContainerAlerts("pastSessionsBody", "Details", "Viewing tuition session details.");

  attachContainerAlerts("studyMaterialsBody", "Download", "Study material resource PDF downloaded successfully.");

  attachContainerAlerts("scheduleGridContainer", "Class Link", "Connecting to live interactive tuition class...");
  attachContainerAlerts("scheduleGridContainer", "Details", "Viewing scheduled session details.");
  attachContainerAlerts("scheduleGridContainer", "Start Test", "Starting weekly preparation assessment test...");

  attachContainerAlerts("reviewList", "Edit Review", "Review opened for editing.");

  attachClearListener("selectTutor", "err-selectTutor");
  attachClearListener("ratingStars", "err-ratingStars");
  attachClearListener("reviewTitle", "err-reviewTitle");
  attachClearListener("reviewComments", "err-reviewComments");

  const btnClearReview = document.getElementById("btnClearReview");
  if (btnClearReview) {
    btnClearReview.addEventListener("click", function () {
      const tutor = document.getElementById("selectTutor");
      const rating = document.getElementById("ratingStars");
      const title = document.getElementById("reviewTitle");
      const comments = document.getElementById("reviewComments");
      if (tutor) tutor.value = "";
      if (rating) rating.value = "";
      if (title) title.value = "";
      if (comments) comments.value = "";
      clearError("selectTutor", "err-selectTutor");
      clearError("ratingStars", "err-ratingStars");
      clearError("reviewTitle", "err-reviewTitle");
      clearError("reviewComments", "err-reviewComments");
    });
  }

  const formReview = document.getElementById("formReview");
  if (formReview) {
    formReview.addEventListener("submit", function (e) {
      e.preventDefault();

      let hasError = false;
      let firstInvalid = null;

      const tutor = document.getElementById("selectTutor");
      const rating = document.getElementById("ratingStars");
      const title = document.getElementById("reviewTitle");
      const comments = document.getElementById("reviewComments");

      if (!tutor || !hasText(tutor.value)) {
        setError("selectTutor", "err-selectTutor", "Please select a tutor from the list.");
        hasError = true;
        if (!firstInvalid) firstInvalid = tutor;
      } else {
        clearError("selectTutor", "err-selectTutor");
      }

      if (!rating || !hasText(rating.value)) {
        setError("ratingStars", "err-ratingStars", "Please select a star rating.");
        hasError = true;
        if (!firstInvalid) firstInvalid = rating;
      } else {
        clearError("ratingStars", "err-ratingStars");
      }

      if (!title || !hasText(title.value)) {
        setError("reviewTitle", "err-reviewTitle", "Please provide a review headline.");
        hasError = true;
        if (!firstInvalid) firstInvalid = title;
      } else {
        clearError("reviewTitle", "err-reviewTitle");
      }

      if (!comments || !hasText(comments.value)) {
        setError("reviewComments", "err-reviewComments", "Please provide detailed feedback comments.");
        hasError = true;
        if (!firstInvalid) firstInvalid = comments;
      } else {
        let trimmedLen = 0;
        for (let i = 0; i < comments.value.length; i++) {
          const code = comments.value.charCodeAt(i);
          if (code != 32 && code != 9 && code != 10 && code != 13) {
            trimmedLen++;
          }
        }
        if (trimmedLen < 10) {
          setError("reviewComments", "err-reviewComments", "Feedback must contain at least 10 non-space characters.");
          hasError = true;
          if (!firstInvalid) firstInvalid = comments;
        } else {
          clearError("reviewComments", "err-reviewComments");
        }
      }

      if (hasError) {
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      alert("Thank you! Your review and rating have been submitted successfully.");

      if (tutor) tutor.value = "";
      if (rating) rating.value = "";
      if (title) title.value = "";
      if (comments) comments.value = "";
      clearError("selectTutor", "err-selectTutor");
      clearError("ratingStars", "err-ratingStars");
      clearError("reviewTitle", "err-reviewTitle");
      clearError("reviewComments", "err-reviewComments");
    });
  }
});