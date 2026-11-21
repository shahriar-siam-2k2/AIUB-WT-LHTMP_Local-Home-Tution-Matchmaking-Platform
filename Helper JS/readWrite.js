const LISTS_STORAGE_KEY = "lhtmp_lists_txt";
const USER_STORAGE_KEY = "lhtmp_user_txt";
const DB_STORAGE_KEY = "lhtmp_database_txt";

function stripChars(str) {
  if (!str) return "";
  let clean = "";
  for (let i = 0; i < str.length; i++) {
    let c = str.charAt(i);
    if (c != "{" && c != "}" && c != "\r" && c != "\n") {
      clean += c;
    }
  }
  let start = 0;
  while (start < clean.length && (clean.charAt(start) == " " || clean.charAt(start) == "\t")) {
    start++;
  }
  let end = clean.length - 1;
  while (end >= start && (clean.charAt(end) == " " || clean.charAt(end) == "\t")) {
    end--;
  }
  let res = "";
  for (let i = start; i <= end; i++) {
    res += clean.charAt(i);
  }
  return res;
}

function parseUserLine(line) {
  if (!line || line.length == 0) return null;
  let rawParts = line.split(";");
  let parts = [];
  for (let i = 0; i < rawParts.length; i++) {
    parts.push(stripChars(rawParts[i]));
  }
  if (parts.length < 10) return null;
  return {
    fullName: parts[0] || "N/A",
    email: parts[1] || "N/A",
    phone: parts[2] || "N/A",
    password: parts[3] || "N/A",
    dob: parts[4] || "N/A",
    gender: parts[5] || "N/A",
    division: parts[6] || "N/A",
    area: parts[7] || "N/A",
    gradeDetails: parts[8] || "N/A",
    userType: parts[9] || "N/A"
  };
}

async function readLists() {
  let fileText = "";
  const candidatePaths = [
    "../Files/Data/lists.txt",
    "./Files/Data/lists.txt",
    "../../Files/Data/lists.txt",
    "Files/Data/lists.txt"
  ];

  for (let p = 0; p < candidatePaths.length; p++) {
    try {
      const response = await fetch(candidatePaths[p], { cache: "no-store" }).catch(() => null);
      if (response && response.ok) {
        fileText = await response.text();
        if (fileText.length > 0) break;
      }
    } catch (err) {}
  }

  if (fileText.length == 0 && typeof XMLHttpRequest !== "undefined") {
    for (let p = 0; p < candidatePaths.length; p++) {
      try {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", candidatePaths[p], false);
        xhr.send(null);
        if (xhr.status == 200 || xhr.status == 0) {
          if (xhr.responseText && xhr.responseText.length > 0) {
            fileText = xhr.responseText;
            break;
          }
        }
      } catch (e) {}
    }
  }

  if (fileText.length > 0) {
    localStorage.setItem(LISTS_STORAGE_KEY, fileText);
  } else {
    const storedText = localStorage.getItem(LISTS_STORAGE_KEY);
    if (storedText && storedText.length > 0) {
      fileText = storedText;
    }
  }

  const result = {
    divisions: {},
    grades: []
  };

  if (!fileText || fileText.length == 0) {
    return result;
  }

  const lines = fileText.split("\n");
  let currentSection = "";

  for (let i = 0; i < lines.length; i++) {
    let rawLine = lines[i];
    let line = stripChars(rawLine);
    if (line.length == 0) continue;

    if (line.charAt(0) == "[" && line.charAt(line.length - 1) == "]") {
      let secName = "";
      for (let s = 1; s < line.length - 1; s++) {
        secName += line.charAt(s);
      }
      currentSection = secName;
      continue;
    }

    if (currentSection == "DIVISIONS") {
      let colonIdx = line.indexOf(":");
      if (colonIdx != -1) {
        let divName = "";
        for (let d = 0; d < colonIdx; d++) {
          divName += line.charAt(d);
        }
        divName = stripChars(divName);
        let areasStr = "";
        for (let a = colonIdx + 1; a < line.length; a++) {
          areasStr += line.charAt(a);
        }
        let rawAreas = areasStr.split(",");
        let areas = [];
        for (let r = 0; r < rawAreas.length; r++) {
          let aName = stripChars(rawAreas[r]);
          if (aName.length > 0) {
            areas.push(aName);
          }
        }
        if (divName.length > 0) {
          result.divisions[divName] = areas;
        }
      }
    } else if (currentSection == "GRADES") {
      let rawGrades = line.split(",");
      for (let g = 0; g < rawGrades.length; g++) {
        let gName = stripChars(rawGrades[g]);
        if (gName.length > 0) {
          result.grades.push(gName);
        }
      }
    }
  }

  return result;
}

function writeLists(updatedText) {
  localStorage.setItem(LISTS_STORAGE_KEY, updatedText);
}

async function readUser() {
  let fileText = "";
  if (typeof localStorage !== "undefined") {
    const storedText = localStorage.getItem(USER_STORAGE_KEY);
    if (storedText && storedText.length > 0) {
      fileText = storedText;
    }
  }

  if (fileText.length == 0) {
    const candidatePaths = [
      "../Files/Data/users.txt",
      "./Files/Data/users.txt",
      "../../Files/Data/users.txt",
      "Files/Data/users.txt"
    ];

    for (let p = 0; p < candidatePaths.length; p++) {
      try {
        const response = await fetch(candidatePaths[p], { cache: "no-store" }).catch(() => null);
        if (response && response.ok) {
          fileText = await response.text();
          if (fileText.length > 0) break;
        }
      } catch (err) {}
    }

    if (fileText.length == 0 && typeof XMLHttpRequest !== "undefined") {
      for (let p = 0; p < candidatePaths.length; p++) {
        try {
          let xhr = new XMLHttpRequest();
          xhr.open("GET", candidatePaths[p], false);
          xhr.send(null);
          if (xhr.status == 200 || xhr.status == 0) {
            if (xhr.responseText && xhr.responseText.length > 0) {
              fileText = xhr.responseText;
              break;
            }
          }
        } catch (e) {}
      }
    }

    if (fileText.length > 0 && typeof localStorage !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, fileText);
    }
  }

  const combinedEntries = [];
  const seenKeys = new Set();

  if (!fileText || fileText.length == 0) {
    return combinedEntries;
  }

  const addFromText = (text) => {
    if (!text) return;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const parsed = parseUserLine(lines[i]);
      if (parsed) {
        const key = parsed.email.toLowerCase() + "|" + parsed.phone;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combinedEntries.push({ raw: lines[i], parsed: parsed });
        }
      }
    }
  };

  addFromText(fileText);
  return combinedEntries;
}

function writeUser(updatedText) {
  localStorage.setItem(USER_STORAGE_KEY, updatedText);
}

function parseBrackets(line) {
  if (!line || line.length == 0) return [];
  let sIdx = 0;
  while (sIdx < line.length && (line.charAt(sIdx) == " " || line.charAt(sIdx) == "\t" || line.charAt(sIdx) == "\r")) {
    sIdx++;
  }
  let eIdx = line.length - 1;
  while (eIdx >= sIdx && (line.charAt(eIdx) == " " || line.charAt(eIdx) == "\t" || line.charAt(eIdx) == "\r")) {
    eIdx--;
  }
  if (sIdx > eIdx) return [];
  let cleanLine = "";
  for (let k = sIdx; k <= eIdx; k++) {
    cleanLine += line.charAt(k);
  }
  if (cleanLine.length == 0) return [];
  if (cleanLine.charAt(0) == "[" && cleanLine.charAt(cleanLine.length - 1) == "]") return [];

  let rawParts = cleanLine.split(";");
  let parts = [];
  for (let i = 0; i < rawParts.length; i++) {
    parts.push(stripChars(rawParts[i]));
  }
  return parts;
}

async function readDatabase() {
  let fileText = "";
  if (typeof localStorage !== "undefined") {
    const storedText = localStorage.getItem(DB_STORAGE_KEY);
    if (storedText && storedText.length > 0 && storedText.indexOf("[TUTOR_SUBJECTS]") != -1) {
      fileText = storedText;
    }
  }

  if (fileText.length == 0) {
    const candidatePaths = [
      "../Files/Data/database.txt",
      "./Files/Data/database.txt",
      "../../Files/Data/database.txt",
      "Files/Data/database.txt"
    ];

    for (let p = 0; p < candidatePaths.length; p++) {
      try {
        const response = await fetch(candidatePaths[p], { cache: "no-store" }).catch(() => null);
        if (response && response.ok) {
          fileText = await response.text();
          if (fileText.length > 0) break;
        }
      } catch (err) {}
    }

    if (fileText.length == 0 && typeof XMLHttpRequest !== "undefined") {
      for (let p = 0; p < candidatePaths.length; p++) {
        try {
          let xhr = new XMLHttpRequest();
          xhr.open("GET", candidatePaths[p], false);
          xhr.send(null);
          if (xhr.status == 200 || xhr.status == 0) {
            if (xhr.responseText && xhr.responseText.length > 0) {
              fileText = xhr.responseText;
              break;
            }
          }
        } catch (e) {}
      }
    }

    if (fileText.length > 0 && typeof localStorage !== "undefined") {
      localStorage.setItem(DB_STORAGE_KEY, fileText);
    }
  }

  const db = {
    users: [],
    disputes: [],
    payments: [],
    moderation: [],
    alerts: [],
    analytics: [],
    analyticsMonthly: [],
    analyticsZones: [],
    stats: {},
    tutorSubjects: [],
    bookingRequests: [],
    studentProgress: [],
    studyMaterials: [],
    tutorReviews: [],
    tutorAvailability: [],
    tutorEarnings: [],
    raw: fileText
  };

  if (!fileText || fileText.length == 0) {
    return db;
  }

  const lines = fileText.split("\n");
  let currentSection = "";

  for (let i = 0; i < lines.length; i++) {
    let rawLine = lines[i];
    let sIdx = 0;
    while (sIdx < rawLine.length && (rawLine.charAt(sIdx) == " " || rawLine.charAt(sIdx) == "\t" || rawLine.charAt(sIdx) == "\r")) {
      sIdx++;
    }
    let eIdx = rawLine.length - 1;
    while (eIdx >= sIdx && (rawLine.charAt(eIdx) == " " || rawLine.charAt(eIdx) == "\t" || rawLine.charAt(eIdx) == "\r")) {
      eIdx--;
    }
    let line = "";
    for (let k = sIdx; k <= eIdx; k++) {
      line += rawLine.charAt(k);
    }
    if (line.length == 0) continue;

    if (line.charAt(0) == "[" && line.charAt(line.length - 1) == "]") {
      let secName = "";
      for (let s = 1; s < line.length - 1; s++) {
        secName += line.charAt(s);
      }
      currentSection = secName;
      continue;
    }

    let parts = parseBrackets(line);
    if (parts.length == 0) continue;

    if (currentSection == "USERS") {
      let id = "N/A";
      let fullName = "N/A";
      let email = "N/A";
      let phone = "N/A";
      let password = "N/A";
      let dob = "N/A";
      let gender = "N/A";
      let division = "N/A";
      let area = "N/A";
      let grade = "N/A";
      let role = "N/A";
      let status = "Active";
      let date = "N/A";
      let image = "../Files/Img/Profile/default.svg";

      if (parts[0].indexOf("USR-") == 0) {
        id = parts[0] || "N/A";
        fullName = parts[1] || "N/A";
        email = parts[2] || "N/A";
        phone = parts[3] || "N/A";
        password = parts[4] || "N/A";
        dob = parts[5] || "N/A";
        gender = parts[6] || "N/A";
        division = parts[7] || "N/A";
        area = parts[8] || "N/A";
        grade = parts[9] || "N/A";
        role = parts[10] || "N/A";
        status = parts[11] || "Active";
        date = parts[12] || "N/A";
        if (parts.length >= 14 && parts[13] && parts[13].length > 0) {
          image = parts[13];
        }
      } else {
        id = "USR-" + (1001 + db.users.length);
        fullName = parts[0] || "N/A";
        email = parts[1] || "N/A";
        phone = parts[2] || "N/A";
        password = parts[3] || "N/A";
        dob = parts[4] || "N/A";
        gender = parts[5] || "N/A";
        division = parts[6] || "N/A";
        area = parts[7] || "N/A";
        grade = parts[8] || "N/A";
        role = parts[9] || "N/A";
        status = parts[10] || "Active";
        date = parts[11] || "N/A";
        if (parts.length >= 13 && parts[12] && parts[12].length > 0) {
          image = parts[12];
        }
      }

      db.users.push({
        raw: rawLine,
        id: id,
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        dob: dob,
        gender: gender,
        division: division,
        area: area,
        grade: grade,
        role: role,
        status: status,
        date: date,
        image: image
      });
    } else if (currentSection == "DISPUTES") {
      let did = parts[0] || "N/A";
      let zone = parts[1] || "N/A";
      let raisedBy = parts[2] || "N/A";
      let against = parts[3] || "N/A";
      let reason = parts[4] || "N/A";
      let dDate = parts[5] || "N/A";
      let priority = parts[6] || "Medium";
      let dStatus = parts[7] || "Pending";
      db.disputes.push({
        raw: rawLine,
        id: did,
        zone: zone,
        coordinator: zone,
        raisedBy: raisedBy,
        complainant: raisedBy,
        against: against,
        respondent: against,
        reason: reason,
        issue: reason,
        date: dDate,
        priority: priority,
        status: dStatus
      });
    } else if (currentSection == "PAYMENTS") {
      db.payments.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        from: parts[1] || "N/A",
        to: parts[2] || "N/A",
        type: parts[3] || "N/A",
        amount: parts[4] || "0",
        commission: parts[5] || "0",
        method: parts[6] || "N/A",
        date: parts[7] || "N/A",
        status: parts[8] || "Verified"
      });
    } else if (currentSection == "MODERATION") {
      db.moderation.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        contentType: parts[1] || "N/A",
        reportedUser: parts[2] || "N/A",
        reportedBy: parts[3] || "N/A",
        snippet: parts[4] || "N/A",
        category: parts[5] || "N/A",
        date: parts[6] || "N/A",
        severity: parts[7] || "Medium",
        status: parts[8] || "Pending"
      });
    } else if (currentSection == "ALERTS") {
      db.alerts.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        title: parts[1] || "N/A",
        category: parts[2] || "Global",
        target: parts[3] || "All Users",
        date: parts[4] || "N/A",
        sentBy: parts[5] || "Admin",
        reach: parts[6] || "0 Users",
        status: parts[7] || "Active"
      });
    } else if (currentSection == "ANALYTICS") {
      db.analytics.push({
        metric: parts[0] || "N/A",
        current: parts[1] || "0",
        previous: parts[2] || "0",
        growth: parts[3] || "0%",
        target: parts[4] || "0",
        status: parts[5] || "On Track"
      });
    } else if (currentSection == "ANALYTICS_MONTHLY") {
      db.analyticsMonthly.push({
        month: parts[0] || "N/A",
        users: parts[1] || "0",
        tutors: parts[2] || "0",
        sessions: parts[3] || "0",
        gross: parts[4] || "0",
        commission: parts[5] || "0",
        rate: parts[6] || "0%"
      });
    } else if (currentSection == "ANALYTICS_ZONES") {
      if (parts.length >= 7) {
        db.analyticsZones.push({
          zone: parts[0] || "N/A",
          coordinator: parts[1] || "N/A",
          inquiries: parts[2] || "0",
          finalized: parts[3] || "0",
          successRate: parts[5] || "0%",
          rating: parts[6] || "0"
        });
      } else {
        db.analyticsZones.push({
          zone: parts[0] || "N/A",
          coordinator: parts[1] || "N/A",
          inquiries: parts[2] || "0",
          finalized: parts[3] || "0",
          successRate: parts[4] || "0%",
          rating: parts[5] || "0"
        });
      }
    } else if (currentSection == "STATS") {
      if (parts.length >= 2) {
        db.stats[parts[0]] = {
          value: parts[1] || "0",
          sub: parts[2] || "N/A"
        };
      }
    } else if (currentSection == "TUTOR_SUBJECTS") {
      db.tutorSubjects.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        name: parts[2] || "N/A",
        level: parts[3] || "N/A",
        curriculum: parts[4] || "N/A",
        rate: parts[5] || "৳0/hr",
        mode: parts[6] || "Home & Online",
        maxStudents: parts[7] || "1",
        status: parts[8] || "Active",
        description: parts[9] || "N/A"
      });
    } else if (currentSection == "BOOKING_REQUESTS") {
      db.bookingRequests.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        studentName: parts[2] || "N/A",
        studentPhone: parts[3] || "N/A",
        subject: parts[4] || "N/A",
        grade: parts[5] || "N/A",
        dateTime: parts[6] || "N/A",
        mode: parts[7] || "N/A",
        rate: parts[8] || "৳0/hr",
        status: parts[9] || "Pending",
        details: parts[10] || "N/A"
      });
    } else if (currentSection == "STUDENT_PROGRESS") {
      db.studentProgress.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        studentName: parts[2] || "N/A",
        studentId: parts[3] || "N/A",
        subject: parts[4] || "N/A",
        grade: parts[5] || "N/A",
        sessionsCompleted: parts[6] || "0 Sessions",
        attendanceRate: parts[7] || "0%",
        latestScore: parts[8] || "0",
        syllabusDone: parts[9] || "0%",
        remarks: parts[10] || "N/A"
      });
    } else if (currentSection == "STUDY_MATERIALS") {
      db.studyMaterials.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        title: parts[2] || "N/A",
        subject: parts[3] || "N/A",
        targetLevel: parts[4] || "N/A",
        category: parts[5] || "N/A",
        fileName: parts[6] || "N/A",
        uploadDate: parts[7] || "N/A",
        fileSize: parts[8] || "0 KB",
        downloads: parts[9] || "0",
        description: parts[10] || "N/A"
      });
    } else if (currentSection == "TUTOR_REVIEWS") {
      db.tutorReviews.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        studentName: parts[2] || "N/A",
        studentGrade: parts[3] || "N/A",
        rating: parts[4] || "5",
        subject: parts[5] || "N/A",
        date: parts[6] || "N/A",
        reviewText: parts[7] || "N/A",
        replyText: parts[8] || "N/A"
      });
    } else if (currentSection == "TUTOR_AVAILABILITY") {
      db.tutorAvailability.push({
        raw: rawLine,
        tutorId: parts[0] || "N/A",
        startTime: parts[1] || "09:00",
        endTime: parts[2] || "20:30",
        sessionDuration: parts[3] || "90",
        bufferMinutes: parts[4] || "15",
        workdays: parts[5] || "Sun,Mon,Tue,Wed,Thu,Fri",
        vacationNote: parts[6] || "",
        totalHours: parts[7] || "28 hrs",
        workingDaysCount: parts[8] || "6 Days",
        bookedSlotsCount: parts[9] || "16",
        openSlotsCount: parts[10] || "8"
      });
    } else if (currentSection == "TUTOR_EARNINGS") {
      db.tutorEarnings.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        tutorId: parts[1] || "N/A",
        month: parts[2] || "N/A",
        sessions: parts[3] || "0",
        hours: parts[4] || "0 hrs",
        gross: parts[5] || "৳0",
        commission: parts[6] || "৳0",
        net: parts[7] || "৳0",
        status: parts[8] || "Available for Payout"
      });
    }
  }

  return db;
}

function serializeDatabase(db) {
  let lines = [];

  lines.push("[USERS]");
  for (let i = 0; i < db.users.length; i++) {
    let u = db.users[i];
    let uid = u.id || ("USR-" + (1001 + i));
    let uimg = u.image || "../Files/Img/Profile/default.svg";
    lines.push("{" + uid + "}; {" + u.fullName + "}; {" + u.email + "}; {" + u.phone + "}; {" + u.password + "}; {" + u.dob + "}; {" + u.gender + "}; {" + u.division + "}; {" + u.area + "}; {" + u.grade + "}; {" + u.role + "}; {" + u.status + "}; {" + u.date + "}; {" + uimg + "}");
  }

  lines.push("\n[DISPUTES]");
  for (let i = 0; i < db.disputes.length; i++) {
    let d = db.disputes[i];
    let did = d.id || ("DISP-" + (i < 9 ? "00" : "0") + (i + 1));
    let zone = d.zone || d.coordinator || "N/A";
    let raisedBy = d.raisedBy || d.complainant || "N/A";
    let against = d.against || d.respondent || "N/A";
    let reason = d.reason || d.issue || "N/A";
    lines.push("{" + did + "}; {" + zone + "}; {" + raisedBy + "}; {" + against + "}; {" + reason + "}; {" + d.date + "}; {" + d.priority + "}; {" + d.status + "}");
  }

  lines.push("\n[PAYMENTS]");
  for (let i = 0; i < db.payments.length; i++) {
    let p = db.payments[i];
    let pid = p.id || ("TXN-" + (9081 + i));
    lines.push("{" + pid + "}; {" + p.from + "}; {" + p.to + "}; {" + p.type + "}; {" + p.amount + "}; {" + p.commission + "}; {" + p.method + "}; {" + p.date + "}; {" + p.status + "}");
  }

  lines.push("\n[MODERATION]");
  for (let i = 0; i < db.moderation.length; i++) {
    let m = db.moderation[i];
    let mid = m.id || ("MOD-" + (101 + i));
    lines.push("{" + mid + "}; {" + m.contentType + "}; {" + m.reportedUser + "}; {" + m.reportedBy + "}; {" + m.snippet + "}; {" + m.category + "}; {" + m.date + "}; {" + m.severity + "}; {" + m.status + "}");
  }

  lines.push("\n[ALERTS]");
  for (let i = 0; i < db.alerts.length; i++) {
    let a = db.alerts[i];
    let aid = a.id || ("ALT-" + (401 + i));
    lines.push("{" + aid + "}; {" + a.title + "}; {" + a.category + "}; {" + a.target + "}; {" + a.date + "}; {" + a.sentBy + "}; {" + a.reach + "}; {" + a.status + "}");
  }

  lines.push("\n[ANALYTICS]");
  for (let i = 0; i < db.analytics.length; i++) {
    let a = db.analytics[i];
    lines.push("{" + a.metric + "}; {" + a.current + "}; {" + a.previous + "}; {" + a.growth + "}; {" + a.target + "}; {" + a.status + "}");
  }

  lines.push("\n[ANALYTICS_MONTHLY]");
  for (let i = 0; i < db.analyticsMonthly.length; i++) {
    let m = db.analyticsMonthly[i];
    lines.push("{" + m.month + "}; {" + m.users + "}; {" + m.tutors + "}; {" + m.sessions + "}; {" + m.gross + "}; {" + m.commission + "}; {" + m.rate + "}");
  }

  lines.push("\n[ANALYTICS_ZONES]");
  for (let i = 0; i < db.analyticsZones.length; i++) {
    let z = db.analyticsZones[i];
    lines.push("{" + z.zone + "}; {" + z.coordinator + "}; {" + z.inquiries + "}; {" + z.finalized + "}; {" + z.successRate + "}; {" + z.rating + "}");
  }

  lines.push("\n[STATS]");
  let statKeys = Object.keys(db.stats);
  for (let i = 0; i < statKeys.length; i++) {
    let k = statKeys[i];
    lines.push("{" + k + "}; {" + db.stats[k].value + "}; {" + db.stats[k].sub + "}");
  }

  if (db.tutorSubjects && db.tutorSubjects.length > 0) {
    lines.push("\n[TUTOR_SUBJECTS]");
    for (let i = 0; i < db.tutorSubjects.length; i++) {
      let s = db.tutorSubjects[i];
      let sid = s.id || ("SUB-" + (101 + i));
      lines.push("{" + sid + "}; {" + s.tutorId + "}; {" + s.name + "}; {" + s.level + "}; {" + s.curriculum + "}; {" + s.rate + "}; {" + s.mode + "}; {" + s.maxStudents + "}; {" + s.status + "}; {" + s.description + "}");
    }
  }

  if (db.bookingRequests && db.bookingRequests.length > 0) {
    lines.push("\n[BOOKING_REQUESTS]");
    for (let i = 0; i < db.bookingRequests.length; i++) {
      let b = db.bookingRequests[i];
      let bid = b.id || ("REQ-" + (1040 + i));
      lines.push("{" + bid + "}; {" + b.tutorId + "}; {" + b.studentName + "}; {" + b.studentPhone + "}; {" + b.subject + "}; {" + b.grade + "}; {" + b.dateTime + "}; {" + b.mode + "}; {" + b.rate + "}; {" + b.status + "}; {" + b.details + "}");
    }
  }

  if (db.studentProgress && db.studentProgress.length > 0) {
    lines.push("\n[STUDENT_PROGRESS]");
    for (let i = 0; i < db.studentProgress.length; i++) {
      let sp = db.studentProgress[i];
      let spid = sp.id || ("PROG-" + (201 + i));
      lines.push("{" + spid + "}; {" + sp.tutorId + "}; {" + sp.studentName + "}; {" + sp.studentId + "}; {" + sp.subject + "}; {" + sp.grade + "}; {" + sp.sessionsCompleted + "}; {" + sp.attendanceRate + "}; {" + sp.latestScore + "}; {" + sp.syllabusDone + "}; {" + sp.remarks + "}");
    }
  }

  if (db.studyMaterials && db.studyMaterials.length > 0) {
    lines.push("\n[STUDY_MATERIALS]");
    for (let i = 0; i < db.studyMaterials.length; i++) {
      let m = db.studyMaterials[i];
      let mid = m.id || ("MAT-" + (301 + i));
      lines.push("{" + mid + "}; {" + m.tutorId + "}; {" + m.title + "}; {" + m.subject + "}; {" + m.targetLevel + "}; {" + m.category + "}; {" + m.fileName + "}; {" + m.uploadDate + "}; {" + m.fileSize + "}; {" + m.downloads + "}; {" + m.description + "}");
    }
  }

  if (db.tutorReviews && db.tutorReviews.length > 0) {
    lines.push("\n[TUTOR_REVIEWS]");
    for (let i = 0; i < db.tutorReviews.length; i++) {
      let r = db.tutorReviews[i];
      let rid = r.id || ("REV-" + (501 + i));
      lines.push("{" + rid + "}; {" + r.tutorId + "}; {" + r.studentName + "}; {" + r.studentGrade + "}; {" + r.rating + "}; {" + r.subject + "}; {" + r.date + "}; {" + r.reviewText + "}; {" + r.replyText + "}");
    }
  }

  if (db.tutorAvailability && db.tutorAvailability.length > 0) {
    lines.push("\n[TUTOR_AVAILABILITY]");
    for (let i = 0; i < db.tutorAvailability.length; i++) {
      let a = db.tutorAvailability[i];
      lines.push("{" + a.tutorId + "}; {" + a.startTime + "}; {" + a.endTime + "}; {" + a.sessionDuration + "}; {" + a.bufferMinutes + "}; {" + a.workdays + "}; {" + a.vacationNote + "}; {" + a.totalHours + "}; {" + a.workingDaysCount + "}; {" + a.bookedSlotsCount + "}; {" + a.openSlotsCount + "}");
    }
  }

  if (db.tutorEarnings && db.tutorEarnings.length > 0) {
    lines.push("\n[TUTOR_EARNINGS]");
    for (let i = 0; i < db.tutorEarnings.length; i++) {
      let e = db.tutorEarnings[i];
      let eid = e.id || ("EARN-" + (601 + i));
      lines.push("{" + eid + "}; {" + e.tutorId + "}; {" + e.month + "}; {" + e.sessions + "}; {" + e.hours + "}; {" + e.gross + "}; {" + e.commission + "}; {" + e.net + "}; {" + e.status + "}");
    }
  }

  return lines.join("\n");
}

function writeDatabase(updatedDb, callback) {
  let text = "";
  if (typeof updatedDb === "string") {
    text = updatedDb;
  } else {
    text = serializeDatabase(updatedDb);
  }
  localStorage.setItem(DB_STORAGE_KEY, text);
  if (typeof callback === "function") {
    callback();
  }
}
