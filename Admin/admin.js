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

  const notifBtn = document.getElementById("btnNotif");
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

  function setupPagination(tbodyId, prevId, p1Id, p2Id, nextId) {
    let tbody = document.getElementById(tbodyId);
    if (!tbody && tbodyId == "disputeTableBody") {
      tbody = document.getElementById("disputeCenterBody");
    }
    if (!tbody && tbodyId == "modQueueBody") {
      tbody = document.getElementById("moderationTableBody");
    }
    const prevBtn = document.getElementById(prevId);
    const p1Btn = document.getElementById(p1Id);
    const p2Btn = document.getElementById(p2Id);
    const nextBtn = document.getElementById(nextId);

    if (!tbody || !p1Btn || !p2Btn) return;

    let currentPage = 1;

    function setPage(pageNum) {
      currentPage = pageNum;
      const rows = tbody.getElementsByTagName("tr");
      for (let i = 0; i < rows.length; i++) {
        if (pageNum == 1) {
          if (i < 5) {
            rows[i].className = "";
          } else {
            rows[i].className = "row-hidden";
          }
        } else {
          if (i < 5) {
            rows[i].className = "row-hidden";
          } else {
            rows[i].className = "";
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

  setupPagination("analyticsOverviewBody", "btnPrevDashAnalytics", "btnPage1DashAnalytics", "btnPage2DashAnalytics", "btnNextDashAnalytics");
  setupPagination("escalatedDisputesBody", "btnPrevDashDisputes", "btnPage1DashDisputes", "btnPage2DashDisputes", "btnNextDashDisputes");

  const userTbody = document.getElementById("userTableBody");
  if (userTbody) {
    const userBtns = userTbody.getElementsByTagName("button");
    for (let i = 0; i < userBtns.length; i++) {
      const btn = userBtns[i];
      const cls = btn.className || "";
      const txt = btn.innerText || btn.textContent || "";
      if (cls.indexOf("btn-user-suspend") != -1 || txt == "Suspend") {
        btn.addEventListener("click", function () {
          alert("User account status update requested.");
        });
      }
    }
  }

  setupPagination("userTableBody", "btnPrevUsers", "btnPage1Users", "btnPage2Users", "btnNextUsers");

  const btnFilterUsers = document.getElementById("btnFilterUsers");
  if (btnFilterUsers) {
    btnFilterUsers.addEventListener("click", function () {
      alert("User directory filtered.");
    });
  }

  const btnResetUsers = document.getElementById("btnResetUsers");
  if (btnResetUsers) {
    btnResetUsers.addEventListener("click", function () {
      const search = document.getElementById("search-user");
      const roleFilter = document.getElementById("role-filter");
      const statusFilter = document.getElementById("status-filter");
      if (search) search.value = "";
      if (roleFilter) roleFilter.value = "all";
      if (statusFilter) statusFilter.value = "all";
      alert("User filters reset to default.");
    });
  }

  const payTbody = document.getElementById("paymentTableBody");
  if (payTbody) {
    const payBtns = payTbody.getElementsByTagName("button");
    for (let i = 0; i < payBtns.length; i++) {
      const btn = payBtns[i];
      const cls = btn.className || "";
      const txt = btn.innerText || btn.textContent || "";
      if (cls.indexOf("btn-receipt-action") != -1 || txt == "Receipt") {
        btn.addEventListener("click", function () {
          alert("Transaction receipt PDF generated and downloaded.");
        });
      } else if (cls.indexOf("btn-audit-action") != -1 || txt == "Audit Log") {
        btn.addEventListener("click", function () {
          alert("Audit log ledger displayed for selected transaction.");
        });
      } else if (cls.indexOf("btn-verify-action") != -1 || txt == "Verify") {
        btn.addEventListener("click", function () {
          alert("Transaction verification completed via payment gateway.");
        });
      }
    }
  }

  setupPagination("paymentTableBody", "btnPrevPayments", "btnPage1Payments", "btnPage2Payments", "btnNextPayments");

  const btnConnReset = document.getElementById("btnConnReset");
  if (btnConnReset) {
    btnConnReset.addEventListener("click", function () {
      alert("Gateway connection status refreshed.");
    });
  }

  const btnBatchDisburse = document.getElementById("btnBatchDisburse");
  if (btnBatchDisburse) {
    btnBatchDisburse.addEventListener("click", function () {
      alert("Batch payout disbursed.");
    });
  }

  const btnFilterPayments = document.getElementById("btnFilterPayments");
  if (btnFilterPayments) {
    btnFilterPayments.addEventListener("click", function () {
      alert("Payment transactions filtered.");
    });
  }

  const btnResetPayments = document.getElementById("btnResetPayments");
  if (btnResetPayments) {
    btnResetPayments.addEventListener("click", function () {
      const searchTxn = document.getElementById("search-txn");
      const txnType = document.getElementById("txn-type");
      const gatewayMethod = document.getElementById("gateway-method");
      if (searchTxn) searchTxn.value = "";
      if (txnType) txnType.value = "all";
      if (gatewayMethod) gatewayMethod.value = "all";
      alert("Payment filters reset to default.");
    });
  }

  const btnNewDispute = document.getElementById("btnNewDispute");
  const newDisputeModal = document.getElementById("newDisputeModal");
  if (btnNewDispute && newDisputeModal) {
    btnNewDispute.addEventListener("click", function () {
      newDisputeModal.className = "modal-overlay active";
    });
  }

  const btnDisputeModalClose = document.getElementById("btnDisputeModalClose");
  const btnCancelNewDispute = document.getElementById("btnCancelNewDispute");
  if (btnDisputeModalClose && newDisputeModal) {
    btnDisputeModalClose.addEventListener("click", function () {
      newDisputeModal.className = "modal-overlay";
    });
  }
  if (btnCancelNewDispute && newDisputeModal) {
    btnCancelNewDispute.addEventListener("click", function () {
      newDisputeModal.className = "modal-overlay";
    });
  }

  const newDisputeSubject = document.getElementById("newDisputeSubject");
  const newDisputeOtherBox = document.getElementById("newDisputeOtherBox");
  if (newDisputeSubject && newDisputeOtherBox) {
    newDisputeSubject.addEventListener("change", function () {
      if (newDisputeSubject.value == "Others") {
        newDisputeOtherBox.className = "modal-other-container active";
      } else {
        newDisputeOtherBox.className = "modal-other-container";
        const otherText = document.getElementById("newDisputeOtherText");
        if (otherText) otherText.value = "";
        clearError("newDisputeOtherText", "err-newDisputeOtherText");
      }
    });
  }

  attachClearListener("newDisputeZone", "err-newDisputeZone");
  attachClearListener("newDisputeComplainant", "err-newDisputeComplainant");
  attachClearListener("newDisputeRespondent", "err-newDisputeRespondent");
  attachClearListener("newDisputeSubject", "err-newDisputeSubject");
  attachClearListener("newDisputeOtherText", "err-newDisputeOtherText");
  attachClearListener("newDisputePriority", "err-newDisputePriority");

  const newDisputeForm = document.getElementById("newDisputeForm");
  if (newDisputeForm) {
    newDisputeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const zone = document.getElementById("newDisputeZone");
      const comp = document.getElementById("newDisputeComplainant");
      const resp = document.getElementById("newDisputeRespondent");
      const subj = document.getElementById("newDisputeSubject");
      const other = document.getElementById("newDisputeOtherText");
      const prio = document.getElementById("newDisputePriority");

      if (!zone || !hasText(zone.value)) {
        setError("newDisputeZone", "err-newDisputeZone", "Please select Zone / Coordinator");
        valid = false;
      }
      if (!comp || !hasText(comp.value)) {
        setError("newDisputeComplainant", "err-newDisputeComplainant", "Please select Complainant");
        valid = false;
      }
      if (!resp || !hasText(resp.value)) {
        setError("newDisputeRespondent", "err-newDisputeRespondent", "Please select Respondent");
        valid = false;
      }
      if (!subj || !hasText(subj.value)) {
        setError("newDisputeSubject", "err-newDisputeSubject", "Please select Dispute Subject / Issue");
        valid = false;
      } else if (subj.value == "Others") {
        if (!other || !hasText(other.value)) {
          setError("newDisputeOtherText", "err-newDisputeOtherText", "Please specify custom dispute subject");
          valid = false;
        }
      }
      if (!prio || !hasText(prio.value)) {
        setError("newDisputePriority", "err-newDisputePriority", "Please select Priority level");
        valid = false;
      }

      if (!valid) return;

      alert("New arbitration dispute docket initiated successfully!");
      newDisputeForm.reset();
      if (newDisputeOtherBox) newDisputeOtherBox.className = "modal-other-container";
      if (newDisputeModal) newDisputeModal.className = "modal-overlay";
    });
  }

  const dispTbody = document.getElementById("disputeTableBody") || document.getElementById("disputeCenterBody");
  const viewRulingModal = document.getElementById("viewRulingModal");
  const btnRulingModalClose = document.getElementById("btnRulingModalClose");
  const btnRulingModalOk = document.getElementById("btnRulingModalOk");

  if (btnRulingModalClose && viewRulingModal) {
    btnRulingModalClose.addEventListener("click", function () {
      viewRulingModal.className = "modal-overlay";
    });
  }
  if (btnRulingModalOk && viewRulingModal) {
    btnRulingModalOk.addEventListener("click", function () {
      viewRulingModal.className = "modal-overlay";
    });
  }

  if (dispTbody) {
    const dRows = dispTbody.getElementsByTagName("tr");
    for (let r = 0; r < dRows.length; r++) {
      const row = dRows[r];
      const tds = row.getElementsByTagName("td");
      const btns = row.getElementsByTagName("button");
      for (let b = 0; b < btns.length; b++) {
        const btn = btns[b];
        const cls = btn.className || "";
        const txt = btn.innerText || btn.textContent || "";
        if (cls.indexOf("btn-select-case") != -1 || txt == "Select Case") {
          btn.addEventListener("click", function () {
            let caseId = btn.value;
            if (!caseId && tds && tds.length > 0) {
              caseId = tds[0].innerText || tds[0].textContent;
            }
            if (caseId) {
              alert("Case " + caseId + " selected for arbitration ruling.");
            } else {
              alert("Case selected for arbitration ruling.");
            }
          });
        } else if (cls.indexOf("btn-view-ruling") != -1 || txt == "View Ruling") {
          btn.addEventListener("click", function () {
            const rCase = document.getElementById("viewRulingCase");
            const rParties = document.getElementById("viewRulingParties");
            const rVerdict = document.getElementById("viewRulingVerdict");
            const rNotes = document.getElementById("viewRulingNotes");

            if (rCase) rCase.innerText = "DSP-2026-002";
            if (rParties) rParties.innerText = "Tariqul Islam vs Asif Mahmud";
            if (rVerdict) rVerdict.innerText = "Split Tuition Fee 50/50 Amicably";
            if (rNotes) rNotes.innerText = "Both parties agreed to share the session cancellation cost amicably. Coordinator verified.";

            if (viewRulingModal) {
              viewRulingModal.className = "modal-overlay active";
            }
          });
        }
      }
    }
  }

  setupPagination("disputeTableBody", "btnPrevDisputes", "btnPage1Disputes", "btnPage2Disputes", "btnNextDisputes");

  const btnFilterDisputes = document.getElementById("btnFilterDisputes");
  if (btnFilterDisputes) {
    btnFilterDisputes.addEventListener("click", function () {
      alert("Dispute list filtered.");
    });
  }

  const btnResetDisputes = document.getElementById("btnResetDisputes");
  if (btnResetDisputes) {
    btnResetDisputes.addEventListener("click", function () {
      const search = document.getElementById("search-dispute");
      const priority = document.getElementById("priority-filter");
      const status = document.getElementById("status-filter");
      if (search) search.value = "";
      if (priority) priority.value = "all";
      if (status) status.value = "all";
      alert("Dispute filters reset to default.");
    });
  }

  attachClearListener("Dispute-id", "err-disputeId");
  attachClearListener("ruling-verdict", "err-rulingVerdict");
  attachClearListener("ruling-notes", "err-rulingNotes");

  const arbitrationForm = document.getElementById("arbitrationForm");
  if (arbitrationForm) {
    arbitrationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const caseInp = document.getElementById("Dispute-id");
      const verdInp = document.getElementById("ruling-verdict");
      const noteInp = document.getElementById("ruling-notes");

      if (!caseInp || !hasText(caseInp.value)) {
        setError("Dispute-id", "err-disputeId", "Please select a Target Case ID");
        valid = false;
      }
      if (!verdInp || !hasText(verdInp.value)) {
        setError("ruling-verdict", "err-rulingVerdict", "Please select an arbitration ruling verdict");
        valid = false;
      }
      if (!noteInp || !hasText(noteInp.value)) {
        setError("ruling-notes", "err-rulingNotes", "Please enter arbitration ruling notes & justification");
        valid = false;
      }

      if (!valid) return;

      alert("Arbitration ruling recorded successfully for case " + caseInp.value + ".");
      arbitrationForm.reset();
    });
  }

  const btnClearRuling = document.getElementById("btnClearRuling");
  if (btnClearRuling) {
    btnClearRuling.addEventListener("click", function () {
      clearError("Dispute-id", "err-disputeId");
      clearError("ruling-verdict", "err-rulingVerdict");
      clearError("ruling-notes", "err-rulingNotes");
    });
  }

  const modTbody = document.getElementById("modQueueBody") || document.getElementById("moderationTableBody");
  if (modTbody) {
    const mRows = modTbody.getElementsByTagName("tr");
    for (let r = 0; r < mRows.length; r++) {
      const row = mRows[r];
      const tds = row.getElementsByTagName("td");
      const btns = row.getElementsByTagName("button");
      for (let b = 0; b < btns.length; b++) {
        const btn = btns[b];
        const cls = btn.className || "";
        const txt = btn.innerText || btn.textContent || "";
        if (cls.indexOf("btn-inspect-queue") != -1 || txt == "Inspect") {
          btn.addEventListener("click", function () {
            if (btn.disabled) return;
            let cCase = btn.value || "";
            let cReporter = "";
            let cSnippet = "";
            if (tds && tds.length > 4) {
              if (!cCase) {
                cCase = tds[0].innerText || tds[0].textContent;
              }
              cReporter = tds[3].innerText || tds[3].textContent;
              cSnippet = tds[4].innerText || tds[4].textContent;
            }
            const cId = document.getElementById("inspectCaseId");
            const rep = document.getElementById("inspectReporter");
            const snip = document.getElementById("inspectSnippet");
            if (cId && cCase) {
              cId.value = cCase;
              clearError("inspectCaseId", "err-inspectCase");
            }
            if (rep && cReporter) {
              rep.value = cReporter;
              clearError("inspectReporter", "err-inspectReporter");
            }
            if (snip && cSnippet) {
              snip.value = cSnippet;
              clearError("inspectSnippet", "err-inspectSnippet");
            }
            alert("Inspecting flagged case " + cCase + " in Live Content Inspector.");
          });
        }
      }
    }
  }

  setupPagination("modQueueBody", "btnPrevMod", "btnPage1Mod", "btnPage2Mod", "btnNextMod");

  const btnRunScanner = document.getElementById("btnRunScanner");
  if (btnRunScanner) {
    btnRunScanner.addEventListener("click", function () {
      alert("Auto Scanner completed. No new severe violations detected.");
    });
  }

  const btnPurgeResolved = document.getElementById("btnPurgeResolved");
  if (btnPurgeResolved) {
    btnPurgeResolved.addEventListener("click", function () {
      alert("Resolved moderation logs purged from active queue.");
    });
  }

  const btnFilterMod = document.getElementById("btnFilterMod");
  if (btnFilterMod) {
    btnFilterMod.addEventListener("click", function () {
      alert("Content moderation queue filtered.");
    });
  }

  const btnResetMod = document.getElementById("btnResetMod");
  if (btnResetMod) {
    btnResetMod.addEventListener("click", function () {
      const search = document.getElementById("search-mod");
      const typeFilter = document.getElementById("content-type-filter");
      const sevFilter = document.getElementById("severity-filter");
      if (search) search.value = "";
      if (typeFilter) typeFilter.value = "all";
      if (sevFilter) sevFilter.value = "all";
      alert("Moderation filters reset to default.");
    });
  }

  attachClearListener("inspectCaseId", "err-inspectCase");
  attachClearListener("inspectReporter", "err-inspectReporter");
  attachClearListener("inspectSnippet", "err-inspectSnippet");
  attachClearListener("modActionNote", "err-modActionNote");

  function validateInspector() {
    let valid = true;
    const cId = document.getElementById("inspectCaseId");
    const rep = document.getElementById("inspectReporter");
    const snip = document.getElementById("inspectSnippet");
    const note = document.getElementById("modActionNote");

    if (!cId || !hasText(cId.value)) {
      setError("inspectCaseId", "err-inspectCase", "Please select a flagged content case from the queue to inspect");
      valid = false;
    }
    if (!rep || !hasText(rep.value)) {
      setError("inspectReporter", "err-inspectReporter", "Reported by information is required");
      valid = false;
    }
    if (!snip || !hasText(snip.value)) {
      setError("inspectSnippet", "err-inspectSnippet", "Flagged text content is required");
      valid = false;
    }
    if (!note || !hasText(note.value)) {
      setError("modActionNote", "err-modActionNote", "Please enter moderator action notes & justification");
      valid = false;
    }
    return valid;
  }

  function clearInspectorFields() {
    const cId = document.getElementById("inspectCaseId");
    const rep = document.getElementById("inspectReporter");
    const snip = document.getElementById("inspectSnippet");
    const note = document.getElementById("modActionNote");
    if (cId) cId.value = "";
    if (rep) rep.value = "";
    if (snip) snip.value = "";
    if (note) note.value = "";
    clearError("inspectCaseId", "err-inspectCase");
    clearError("inspectReporter", "err-inspectReporter");
    clearError("inspectSnippet", "err-inspectSnippet");
    clearError("modActionNote", "err-modActionNote");
  }

  const btnRemoveContent = document.getElementById("btnRemoveContent");
  if (btnRemoveContent) {
    btnRemoveContent.addEventListener("click", function () {
      if (!validateInspector()) return;
      const cId = document.getElementById("inspectCaseId");
      alert("Flagged content for case " + (cId ? cId.value : "") + " removed from platform.");
      clearInspectorFields();
    });
  }

  const btnDismissReport = document.getElementById("btnDismissReport");
  if (btnDismissReport) {
    btnDismissReport.addEventListener("click", function () {
      if (!validateInspector()) return;
      const cId = document.getElementById("inspectCaseId");
      alert("Flagged content report for case " + (cId ? cId.value : "") + " dismissed.");
      clearInspectorFields();
    });
  }

  const btnClearInspector = document.getElementById("btnClearInspector");
  if (btnClearInspector) {
    btnClearInspector.addEventListener("click", function () {
      clearInspectorFields();
      alert("Live Content Inspector cleared.");
    });
  }

  const bcaTbody = document.getElementById("broadcastTableBody");
  if (bcaTbody) {
    const bcaBtns = bcaTbody.getElementsByTagName("button");
    for (let i = 0; i < bcaBtns.length; i++) {
      const btn = bcaBtns[i];
      const cls = btn.className || "";
      const txt = btn.innerText || btn.textContent || "";
      if (cls.indexOf("btn-archive-alert") != -1 || txt == "Archive") {
        btn.addEventListener("click", function () {
          alert("Broadcast alert archived.");
        });
      } else if (cls.indexOf("btn-report-alert") != -1 || txt == "View Report") {
        btn.addEventListener("click", function () {
          alert("Broadcast dispatch audit report displayed.");
        });
      }
    }
  }

  setupPagination("broadcastTableBody", "btnPrevAlerts", "btnPage1Alerts", "btnPage2Alerts", "btnNextAlerts");

  attachClearListener("alert-title-input", "err-alertTitle");
  attachClearListener("alert-category-input", "err-alertCategory");
  attachClearListener("target-audience-select", "err-targetAudience");
  attachClearListener("alert-channels", "err-alertChannels");
  attachClearListener("alert-body-text", "err-alertBody");

  const broadcastForm = document.getElementById("broadcastForm");
  if (broadcastForm) {
    broadcastForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const title = document.getElementById("alert-title-input");
      const cat = document.getElementById("alert-category-input");
      const aud = document.getElementById("target-audience-select");
      const chn = document.getElementById("alert-channels");
      const body = document.getElementById("alert-body-text");

      if (!title || !hasText(title.value)) {
        setError("alert-title-input", "err-alertTitle", "Please enter an alert headline / title");
        valid = false;
      }
      if (!cat || !hasText(cat.value)) {
        setError("alert-category-input", "err-alertCategory", "Please select an alert category / severity");
        valid = false;
      }
      if (!aud || !hasText(aud.value)) {
        setError("target-audience-select", "err-targetAudience", "Please select a target audience");
        valid = false;
      }
      if (!chn || !hasText(chn.value)) {
        setError("alert-channels", "err-alertChannels", "Please select a dispatch channel");
        valid = false;
      }
      if (!body || !hasText(body.value)) {
        setError("alert-body-text", "err-alertBody", "Please enter the alert message body");
        valid = false;
      }

      if (!valid) return;

      alert("Global broadcast alert dispatched to selected target audience!");
      broadcastForm.reset();
    });
  }

  const btnPreviewAlert = document.getElementById("btnPreviewAlert");
  if (btnPreviewAlert) {
    btnPreviewAlert.addEventListener("click", function () {
      alert("Broadcast alert preview generated for active user sessions.");
    });
  }

  const btnClearAlert = document.getElementById("btnClearAlert");
  if (btnClearAlert) {
    btnClearAlert.addEventListener("click", function () {
      clearError("alert-title-input", "err-alertTitle");
      clearError("alert-category-input", "err-alertCategory");
      clearError("target-audience-select", "err-targetAudience");
      clearError("alert-channels", "err-alertChannels");
      clearError("alert-body-text", "err-alertBody");
      alert("Broadcast alert composer cleared.");
    });
  }

  const btnRefreshAlerts = document.getElementById("btnRefreshAlerts");
  if (btnRefreshAlerts) {
    btnRefreshAlerts.addEventListener("click", function () {
      alert("Broadcast dispatch history refreshed.");
    });
  }

  setupPagination("analyticsPerformanceBody", "btnPrevAnalyticsPerf", "btnPage1AnalyticsPerf", "btnPage2AnalyticsPerf", "btnNextAnalyticsPerf");
  setupPagination("analyticsMonthlyBody", "btnPrevAnalyticsMonthly", "btnPage1AnalyticsMonthly", "btnPage2AnalyticsMonthly", "btnNextAnalyticsMonthly");
  setupPagination("analyticsZonesBody", "btnPrevAnalyticsZones", "btnPage1AnalyticsZones", "btnPage2AnalyticsZones", "btnNextAnalyticsZones");

  const btnRefreshAnalyticsPerf = document.getElementById("btnRefreshAnalyticsPerf");
  if (btnRefreshAnalyticsPerf) {
    btnRefreshAnalyticsPerf.addEventListener("click", function () {
      alert("Platform performance telemetry refreshed.");
    });
  }

  const btnRefreshAnalyticsZone = document.getElementById("btnRefreshAnalyticsZone");
  if (btnRefreshAnalyticsZone) {
    btnRefreshAnalyticsZone.addEventListener("click", function () {
      alert("Regional zone matching analytics refreshed.");
    });
  }
});
