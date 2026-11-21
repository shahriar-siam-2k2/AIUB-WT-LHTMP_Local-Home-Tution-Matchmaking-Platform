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
    if (storedText && storedText.length > 0 && storedText.indexOf("[SESSIONS]") != -1) {
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
    tutorProfiles: [],
    sessions: [],
    studyMaterials: [],
    reviews: [],
    schedule: [],
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
    } else if (currentSection == "TUTOR_PROFILES") {
      db.tutorProfiles.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        userId: parts[1] || "N/A",
        name: parts[2] || "N/A",
        subjects: parts[3] || "N/A",
        rating: parts[4] || "5.0",
        reviewCount: parts[5] || "0",
        rate: parts[6] || "500",
        location: parts[7] || "N/A",
        experience: parts[8] || "N/A",
        image: parts[9] || "../Files/Img/Profile/tutor.svg"
      });
    } else if (currentSection == "SESSIONS") {
      db.sessions.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        studentId: parts[1] || "N/A",
        subject: parts[2] || "N/A",
        tutorName: parts[3] || "N/A",
        date: parts[4] || "N/A",
        time: parts[5] || "N/A",
        mode: parts[6] || "Online Video",
        status: parts[7] || "Confirmed",
        duration: parts[8] || "1.5 hrs"
      });
    } else if (currentSection == "STUDY_MATERIALS") {
      db.studyMaterials.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        title: parts[1] || "N/A",
        subject: parts[2] || "N/A",
        tutorName: parts[3] || "N/A",
        fileType: parts[4] || "PDF",
        fileSize: parts[5] || "N/A",
        date: parts[6] || "N/A",
        fileName: parts[7] || "material.pdf"
      });
    } else if (currentSection == "REVIEWS") {
      db.reviews.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        studentId: parts[1] || "N/A",
        tutorName: parts[2] || "N/A",
        subject: parts[3] || "N/A",
        rating: parts[4] || "5.0",
        headline: parts[5] || "N/A",
        feedback: parts[6] || "N/A",
        date: parts[7] || "N/A"
      });
    } else if (currentSection == "SCHEDULE") {
      db.schedule.push({
        raw: rawLine,
        id: parts[0] || "N/A",
        studentId: parts[1] || "N/A",
        day: parts[2] || "N/A",
        time: parts[3] || "N/A",
        subject: parts[4] || "N/A",
        tutorName: parts[5] || "N/A",
        mode: parts[6] || "Online Video",
        color: parts[7] || "#10b981"
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

  if (db.tutorProfiles && db.tutorProfiles.length > 0) {
    lines.push("\n[TUTOR_PROFILES]");
    for (let i = 0; i < db.tutorProfiles.length; i++) {
      let tp = db.tutorProfiles[i];
      lines.push("{" + tp.id + "}; {" + tp.userId + "}; {" + tp.name + "}; {" + tp.subjects + "}; {" + tp.rating + "}; {" + tp.reviewCount + "}; {" + tp.rate + "}; {" + tp.location + "}; {" + tp.experience + "}; {" + tp.image + "}");
    }
  }

  if (db.sessions && db.sessions.length > 0) {
    lines.push("\n[SESSIONS]");
    for (let i = 0; i < db.sessions.length; i++) {
      let s = db.sessions[i];
      lines.push("{" + s.id + "}; {" + s.studentId + "}; {" + s.subject + "}; {" + s.tutorName + "}; {" + s.date + "}; {" + s.time + "}; {" + s.mode + "}; {" + s.status + "}; {" + s.duration + "}");
    }
  }

  if (db.studyMaterials && db.studyMaterials.length > 0) {
    lines.push("\n[STUDY_MATERIALS]");
    for (let i = 0; i < db.studyMaterials.length; i++) {
      let sm = db.studyMaterials[i];
      lines.push("{" + sm.id + "}; {" + sm.title + "}; {" + sm.subject + "}; {" + sm.tutorName + "}; {" + sm.fileType + "}; {" + sm.fileSize + "}; {" + sm.date + "}; {" + sm.fileName + "}");
    }
  }

  if (db.reviews && db.reviews.length > 0) {
    lines.push("\n[REVIEWS]");
    for (let i = 0; i < db.reviews.length; i++) {
      let r = db.reviews[i];
      lines.push("{" + r.id + "}; {" + r.studentId + "}; {" + r.tutorName + "}; {" + r.subject + "}; {" + r.rating + "}; {" + r.headline + "}; {" + r.feedback + "}; {" + r.date + "}");
    }
  }

  if (db.schedule && db.schedule.length > 0) {
    lines.push("\n[SCHEDULE]");
    for (let i = 0; i < db.schedule.length; i++) {
      let sc = db.schedule[i];
      lines.push("{" + sc.id + "}; {" + sc.studentId + "}; {" + sc.day + "}; {" + sc.time + "}; {" + sc.subject + "}; {" + sc.tutorName + "}; {" + sc.mode + "}; {" + sc.color + "}");
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
