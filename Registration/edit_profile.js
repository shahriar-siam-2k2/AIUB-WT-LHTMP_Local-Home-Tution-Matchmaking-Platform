let currentDb = null;
let divisionAreaData = [];
let gradesData = [];
let targetUserId = "";
let targetUser = null;
let tempAvatarDataUrl = "";
let tempAvatarFileName = "";
let isViewerAdmin = false;

function showAlert(message, type) {
  const alertBox = document.getElementById("reg-alert");
  if (!alertBox) return;
  alertBox.textContent = message;
  if (type == "success") {
    alertBox.className = "alert-box alert-success";
  } else {
    alertBox.className = "alert-box alert-error";
  }
  alertBox.style.display = "block";
}

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

async function loadListsData() {
  let fileText = "";
  const candidatePaths = [
    "../Files/Data/lists.txt",
    "./Files/Data/lists.txt",
    "../../Files/Data/lists.txt",
    "Files/Data/lists.txt"
  ];

  for (let p = 0; p < candidatePaths.length; p++) {
    try {
      const response = await fetch(candidatePaths[p], { cache: "no-store" }).catch(function () { return null; });
      if (response && response.ok) {
        fileText = await response.text();
        if (fileText.length > 0) break;
      }
    } catch (err) {}
  }

  if (fileText.length > 0) {
    const lines = fileText.split("\n");
    let currentSection = "";
    divisionAreaData = [];
    gradesData = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line) continue;
      if (line.charAt(line.length - 1) == "\r") {
        line = line.substring(0, line.length - 1);
      }
      if (line.length == 0) continue;

      if (line.charAt(0) == "[" && line.charAt(line.length - 1) == "]") {
        currentSection = line.substring(1, line.length - 1).toUpperCase();
        continue;
      }

      if (currentSection == "DIVISIONS") {
        const colonIndex = line.indexOf(":");
        if (colonIndex != -1) {
          const division = cleanInputText(line.substring(0, colonIndex));
          const rawAreas = line.substring(colonIndex + 1).split(",");
          let areas = [];
          for (let a = 0; a < rawAreas.length; a++) {
            let item = cleanInputText(rawAreas[a]);
            if (item.length > 0) {
              areas.push(item);
            }
          }
          divisionAreaData.push({ division: division, areas: areas });
        }
      } else if (currentSection == "GRADES") {
        const rawGrades = line.split(",");
        for (let g = 0; g < rawGrades.length; g++) {
          let item = cleanInputText(rawGrades[g]);
          if (item.length > 0) {
            gradesData.push(item);
          }
        }
      }
    }
  }

  if (divisionAreaData.length == 0) {
    divisionAreaData = [
      { division: "Barisal", areas: ["Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"] },
      { division: "Chittagong", areas: ["Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"] },
      { division: "Dhaka", areas: ["Dhaka", "Mirpur", "Dhanmondi", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"] },
      { division: "Khulna", areas: ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"] },
      { division: "Mymensingh", areas: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"] },
      { division: "Rajshahi", areas: ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj", "Pabna", "Rajshahi", "Sirajganj"] },
      { division: "Rangpur", areas: ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"] },
      { division: "Sylhet", areas: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"] }
    ];
  }

  if (gradesData.length == 0) {
    gradesData = [
      "Class-01", "Class-02", "Class-03", "Class-04", "Class-05", "Class-06", "Class-07", "Class-08", "Class-09", "Class-10",
      "SSC", "HSC-1st Year", "HSC-2nd Year", "Admission", "Undergraduate", "Graduate", "PHD"
    ];
  }
}

function populateAreasForDivision(selectedDivision, currentAreaVal) {
  const areaSelect = document.getElementById("area");
  if (!areaSelect) return;
  if (!selectedDivision || selectedDivision == "") {
    areaSelect.disabled = true;
    areaSelect.innerHTML = '<option value="" disabled selected>Select Division First</option>';
    return;
  }

  let foundAreas = [];
  for (let i = 0; i < divisionAreaData.length; i++) {
    if (divisionAreaData[i].division.toLowerCase() == selectedDivision.toLowerCase()) {
      foundAreas = divisionAreaData[i].areas;
      break;
    }
  }

  if (foundAreas.length > 0) {
    areaSelect.disabled = false;
    let html = '<option value="" disabled>Select Area</option>';
    for (let i = 0; i < foundAreas.length; i++) {
      let isSel = (currentAreaVal && currentAreaVal.toLowerCase() == foundAreas[i].toLowerCase()) ? " selected" : "";
      html += '<option value="' + foundAreas[i] + '"' + isSel + '>' + foundAreas[i] + '</option>';
    }
    areaSelect.innerHTML = html;
  } else {
    areaSelect.disabled = false;
    areaSelect.innerHTML = '<option value="' + currentAreaVal + '" selected>' + currentAreaVal + '</option>';
  }
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

document.addEventListener("DOMContentLoaded", async function () {
  const userIdInput = document.getElementById("userId");
  const avatarPreview = document.getElementById("avatarPreview");
  const profileImageInput = document.getElementById("profileImage");
  const accountRoleStatusSection = document.getElementById("accountRoleStatusSection");
  const userTypeSelect = document.getElementById("userType");
  const userStatusSelect = document.getElementById("userStatus");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const dobInput = document.getElementById("dob");
  const divisionSelect = document.getElementById("division");
  const areaSelect = document.getElementById("area");
  const gradeSection = document.getElementById("gradeSection");
  const gradeSelect = document.getElementById("grade");
  const detailedGradeInput = document.getElementById("detailedGrade");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const editProfileForm = document.getElementById("editProfileForm");
  const linkCancelEdit = document.getElementById("linkCancelEdit");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  let loggedInUser = null;
  try {
    let sessionData = sessionStorage.getItem("lhtmp_current_user");
    if (sessionData) {
      loggedInUser = JSON.parse(sessionData);
    }
  } catch (e) {}

  let fromAdminParam = getQueryParam("from");
  let roleParam = getQueryParam("role");
  if (fromAdminParam == "admin" || (roleParam && roleParam.toLowerCase() == "admin")) {
    isViewerAdmin = true;
  } else if (loggedInUser) {
    let role = loggedInUser.userType || loggedInUser.role;
    if (role && role.toLowerCase() == "admin") {
      isViewerAdmin = true;
    }
  } else if (document.referrer.indexOf("Admin") != -1 || document.referrer.indexOf("user_management") != -1) {
    isViewerAdmin = true;
  }

  if (isViewerAdmin) {
    if (accountRoleStatusSection) {
      accountRoleStatusSection.style.display = "block";
    }
    if (userTypeSelect) userTypeSelect.required = true;
    if (userStatusSelect) userStatusSelect.required = true;
    if (linkCancelEdit) linkCancelEdit.href = "../Admin/user_management.html";
    if (btnCancelEdit) {
      btnCancelEdit.onclick = function () {
        window.location.href = "../Admin/user_management.html";
      };
    }
  } else {
    if (accountRoleStatusSection) {
      accountRoleStatusSection.style.display = "none";
    }
    if (userTypeSelect) userTypeSelect.required = false;
    if (userStatusSelect) userStatusSelect.required = false;

    let fallbackUrl = "../Login/login.html";
    if (loggedInUser) {
      let r = loggedInUser.userType || loggedInUser.role;
      if (r == "Tutor") fallbackUrl = "../Tutor/profile.html";
      else if (r == "Student") fallbackUrl = "../Student/student_portal.html";
      else if (r == "Area Coordinator") fallbackUrl = "../Coordinator/profile.html";
    } else if (document.referrer && document.referrer.length > 0) {
      fallbackUrl = document.referrer;
    }

    if (linkCancelEdit) linkCancelEdit.href = fallbackUrl;
    if (btnCancelEdit) {
      btnCancelEdit.onclick = function () {
        window.location.href = fallbackUrl;
      };
    }
  }

  targetUserId = getQueryParam("id");
  if (!targetUserId || targetUserId.length == 0) {
    if (loggedInUser) {
      targetUserId = loggedInUser.id || loggedInUser.email || "";
    }
  }

  await loadListsData();

  if (divisionSelect) {
    let divHtml = '<option value="" disabled selected>Select Division</option>';
    for (let i = 0; i < divisionAreaData.length; i++) {
      divHtml += '<option value="' + divisionAreaData[i].division + '">' + divisionAreaData[i].division + '</option>';
    }
    divisionSelect.innerHTML = divHtml;
  }

  if (gradeSelect) {
    let grHtml = '<option value="" disabled selected>Select Grade</option>';
    for (let i = 0; i < gradesData.length; i++) {
      grHtml += '<option value="' + gradesData[i] + '">' + gradesData[i] + '</option>';
    }
    gradeSelect.innerHTML = grHtml;
  }

  if (typeof readDatabase == "function") {
    currentDb = await readDatabase();
  }

  if (!currentDb || !currentDb.users || currentDb.users.length == 0) {
    showAlert("No database records found. Please ensure database.txt is accessible.", "error");
    return;
  }

  if (targetUserId && targetUserId.length > 0) {
    for (let i = 0; i < currentDb.users.length; i++) {
      let u = currentDb.users[i];
      if (u.id == targetUserId || (u.email && u.email.toLowerCase() == targetUserId.toLowerCase())) {
        targetUser = u;
        break;
      }
    }
  }

  if (!targetUser && currentDb.users.length > 0) {
    targetUser = currentDb.users[0];
  }

  if (!targetUser) {
    showAlert("User profile with ID '" + targetUserId + "' was not found in database.", "error");
    return;
  }

  userIdInput.value = targetUser.id || "USR-0000";
  fullNameInput.value = targetUser.fullName != "N/A" ? targetUser.fullName : "";
  emailInput.value = targetUser.email != "N/A" ? targetUser.email : "";
  phoneInput.value = targetUser.phone != "N/A" ? targetUser.phone : "";
  dobInput.value = targetUser.dob != "N/A" ? targetUser.dob : "";

  let userGender = targetUser.gender ? targetUser.gender.toLowerCase() : "";
  let maleRadio = document.getElementById("genderMale");
  let femaleRadio = document.getElementById("genderFemale");
  if (userGender == "male" && maleRadio) {
    maleRadio.checked = true;
  } else if (userGender == "female" && femaleRadio) {
    femaleRadio.checked = true;
  }

  if (userTypeSelect) {
    userTypeSelect.value = targetUser.role;
  }

  if (userStatusSelect) {
    userStatusSelect.value = targetUser.status || "Active";
  }

  if (divisionSelect) {
    divisionSelect.value = targetUser.division;
  }

  populateAreasForDivision(targetUser.division, targetUser.area);

  let initialRole = targetUser.role || "";
  if (initialRole == "Tutor" || initialRole == "Student") {
    if (gradeSection) gradeSection.style.display = "block";
    if (gradeSelect) gradeSelect.required = true;
    if (detailedGradeInput) detailedGradeInput.required = true;

    let rawGrade = targetUser.grade || "";
    let underIdx = rawGrade.indexOf("_");
    if (underIdx != -1) {
      if (gradeSelect) gradeSelect.value = rawGrade.substring(0, underIdx);
      if (detailedGradeInput) detailedGradeInput.value = rawGrade.substring(underIdx + 1);
    } else {
      if (gradeSelect) gradeSelect.value = rawGrade;
    }
  } else {
    if (gradeSection) gradeSection.style.display = "none";
    if (gradeSelect) gradeSelect.required = false;
    if (detailedGradeInput) detailedGradeInput.required = false;
  }

  if (passwordInput) {
    passwordInput.value = targetUser.password != "N/A" ? targetUser.password : "";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = targetUser.password != "N/A" ? targetUser.password : "";
  }

  if (avatarPreview) {
    avatarPreview.src = resolveUserAvatar(targetUser);
  }

  if (profileImageInput) {
    profileImageInput.addEventListener("change", function () {
      if (profileImageInput.files && profileImageInput.files.length > 0) {
        let file = profileImageInput.files[0];
        tempAvatarFileName = file.name;
        let reader = new FileReader();
        reader.onload = function (e) {
          tempAvatarDataUrl = e.target.result;
          if (avatarPreview) {
            avatarPreview.src = tempAvatarDataUrl;
          }
        };
        reader.readAsDataURL(file);
      } else {
        tempAvatarFileName = "";
        tempAvatarDataUrl = "";
        if (avatarPreview) {
          avatarPreview.src = resolveUserAvatar(targetUser);
        }
      }
    });
  }

  if (divisionSelect) {
    divisionSelect.addEventListener("change", function () {
      populateAreasForDivision(divisionSelect.value, "");
    });
  }

  if (userTypeSelect && gradeSection && gradeSelect && detailedGradeInput) {
    userTypeSelect.addEventListener("change", function () {
      const role = userTypeSelect.value;
      if (role == "Tutor" || role == "Student") {
        gradeSection.style.display = "block";
        gradeSelect.required = true;
        detailedGradeInput.required = true;
      } else {
        gradeSection.style.display = "none";
        gradeSelect.required = false;
        detailedGradeInput.required = false;
        gradeSelect.value = "";
        detailedGradeInput.value = "";
      }
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let userType = targetUser.role;
      let userStatus = targetUser.status || "Active";

      if (isViewerAdmin) {
        userType = userTypeSelect ? userTypeSelect.value : targetUser.role;
        userStatus = userStatusSelect ? userStatusSelect.value : (targetUser.status || "Active");
      }

      const fullName = cleanInputText(fullNameInput.value);
      const email = cleanInputText(emailInput.value);
      const phone = cleanInputText(phoneInput.value);
      const dob = dobInput.value;

      let gender = "";
      const genderRadios = document.getElementsByName("gender");
      for (let i = 0; i < genderRadios.length; i++) {
        if (genderRadios[i].checked) {
          gender = genderRadios[i].value;
          break;
        }
      }

      const division = divisionSelect ? divisionSelect.value : "";
      const area = areaSelect ? areaSelect.value : "";
      const grade = gradeSelect ? gradeSelect.value : "";
      const detailedGrade = detailedGradeInput ? cleanInputText(detailedGradeInput.value) : "";
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (userType == "" || fullName == "" || email == "" || phone == "" || dob == "" || gender == "" || division == "" || area == "" || password == "" || confirmPassword == "") {
        showAlert("Please fill in all required fields.", "error");
        return;
      }

      if (phone.length != 11) {
        showAlert("Phone number must be exactly 11 digits.", "error");
        return;
      }

      let gradeDetailedFormatted = "N/A";
      if (userType == "Tutor" || userType == "Student") {
        if (grade == "" || detailedGrade == "") {
          showAlert("Please select a Grade and enter your Detailed Grade.", "error");
          return;
        }
        gradeDetailedFormatted = grade + "_" + detailedGrade;
      }

      if (password != confirmPassword) {
        showAlert("Password and Confirm Password do not match.", "error");
        return;
      }

      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.id != targetUser.id) {
          if (u.email && u.email.toLowerCase() == email.toLowerCase()) {
            showAlert("This email address is already used by another account.", "error");
            return;
          }
          if (u.phone && u.phone == phone) {
            showAlert("This phone number is already used by another account.", "error");
            return;
          }
        }
      }

      let savedImg = targetUser.image && targetUser.image.length > 0 ? targetUser.image : "../Files/Img/Profile/default.svg";
      if (tempAvatarFileName.length > 0) {
        savedImg = "../Files/Img/Profile/" + tempAvatarFileName;
        if (tempAvatarDataUrl.length > 0) {
          localStorage.setItem("lhtmp_avatar_" + targetUser.id, tempAvatarDataUrl);
          localStorage.setItem("lhtmp_avatar_" + email, tempAvatarDataUrl);
        }
      }

      targetUser.fullName = fullName;
      targetUser.email = email;
      targetUser.phone = phone;
      targetUser.dob = dob;
      targetUser.gender = gender;
      targetUser.division = division;
      targetUser.area = area;
      targetUser.grade = gradeDetailedFormatted;
      targetUser.role = userType;
      targetUser.status = userStatus;
      targetUser.password = password;
      targetUser.image = savedImg;

      if (loggedInUser && (loggedInUser.id == targetUser.id || (loggedInUser.email && loggedInUser.email.toLowerCase() == email.toLowerCase()))) {
        loggedInUser.fullName = fullName;
        loggedInUser.email = email;
        loggedInUser.phone = phone;
        loggedInUser.userType = userType;
        sessionStorage.setItem("lhtmp_current_user", JSON.stringify(loggedInUser));
      }

      let nextUrl = "../Admin/user_management.html";
      if (!isViewerAdmin) {
        if (userType == "Tutor") nextUrl = "../Tutor/profile.html";
        else if (userType == "Student") nextUrl = "../Student/student_portal.html";
        else if (userType == "Area Coordinator") nextUrl = "../Coordinator/profile.html";
        else nextUrl = "../Login/login.html";
      }

      if (typeof writeDatabase == "function") {
        writeDatabase(currentDb, function () {
          showAlert("Profile updated successfully! Redirecting...", "success");
          setTimeout(function () {
            window.location.href = nextUrl;
          }, 900);
        });
      } else {
        showAlert("Profile updated! Redirecting...", "success");
        setTimeout(function () {
          window.location.href = nextUrl;
        }, 900);
      }
    });
  }
});
