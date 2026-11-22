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

function isAllDigits(str) {
  if (!str || str.length == 0) return false;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 48 || c > 57) {
      return false;
    }
  }
  return true;
}

function calculateAge(dobStr) {
  if (!dobStr || dobStr.length < 10) return -1;
  const parts = dobStr.split("-");
  if (parts.length != 3) return -1;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10);
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return -1;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth == birthMonth && currentDay < birthDay)) {
    age--;
  }
  return age;
}

function setFieldError(fieldId, errId, message) {
  const errElem = document.getElementById(errId);
  if (errElem) {
    errElem.textContent = message;
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
    let classes = inputElem.className.split(" ");
    let kept = [];
    for (let i = 0; i < classes.length; i++) {
      if (classes[i] != "input-error" && classes[i].length > 0) {
        kept.push(classes[i]);
      }
    }
    inputElem.className = kept.join(" ");
  }
}

function clearAllFieldErrors() {
  const errors = [
    { field: "userType", err: "err-userType" },
    { field: "userStatus", err: "err-userStatus" },
    { field: "fullName", err: "err-fullName" },
    { field: "email", err: "err-email" },
    { field: "phone", err: "err-phone" },
    { field: "dob", err: "err-dob" },
    { field: "genderMale", err: "err-gender" },
    { field: "genderFemale", err: "err-gender" },
    { field: "division", err: "err-division" },
    { field: "area", err: "err-area" },
    { field: "grade", err: "err-grade" },
    { field: "detailedGrade", err: "err-detailedGrade" },
    { field: "password", err: "err-password" },
    { field: "confirmPassword", err: "err-confirmPassword" }
  ];
  for (let i = 0; i < errors.length; i++) {
    clearFieldError(errors[i].field, errors[i].err);
  }
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
  const genderRadios = document.getElementsByName("gender");
  const divisionSelect = document.getElementById("division");
  const areaSelect = document.getElementById("area");
  const gradeSection = document.getElementById("gradeSection");
  const gradeSelect = document.getElementById("grade");
  const detailedGradeInput = document.getElementById("detailedGrade");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const imgTogglePassword = document.getElementById("imgTogglePassword");
  const btnToggleConfirmPassword = document.getElementById("btnToggleConfirmPassword");
  const imgToggleConfirmPassword = document.getElementById("imgToggleConfirmPassword");
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
  if (fromAdminParam == "student" || (roleParam && roleParam.toLowerCase() == "student")) {
    isViewerAdmin = false;
  } else if (fromAdminParam == "admin" || (roleParam && roleParam.toLowerCase() == "admin")) {
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

    let fallbackUrl = "../Login/login.html";
    if (fromAdminParam == "student" || (roleParam && roleParam.toLowerCase() == "student")) {
      fallbackUrl = "../Student/profile.html";
    } else if (loggedInUser) {
      let r = loggedInUser.userType || loggedInUser.role;
      if (r == "Tutor") fallbackUrl = "../Tutor/tutor.html";
      else if (r == "Student") fallbackUrl = "../Student/profile.html";
      else if (r == "Area Coordinator") fallbackUrl = "../Coordinator/coordinator.html";
      if (r == "Tutor") fallbackUrl = "../Tutor/profile.html";
      else if (r == "Student") fallbackUrl = "../Student/student_portal.html";
      else if (r == "Area Coordinator") fallbackUrl = "../Coordinator/coordinator_portal.html";
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

  if (btnTogglePassword) {
    btnTogglePassword.addEventListener("click", function () {
      if (!passwordInput) return;
      if (passwordInput.type == "password") {
        passwordInput.type = "text";
        if (imgTogglePassword) {
          imgTogglePassword.src = "../Files/Img/Icon/eye-off.svg";
          imgTogglePassword.alt = "Hide Password";
        }
      } else {
        passwordInput.type = "password";
        if (imgTogglePassword) {
          imgTogglePassword.src = "../Files/Img/Icon/eye.svg";
          imgTogglePassword.alt = "Show Password";
        }
      }
    });
  }

  if (btnToggleConfirmPassword) {
    btnToggleConfirmPassword.addEventListener("click", function () {
      if (!confirmPasswordInput) return;
      if (confirmPasswordInput.type == "password") {
        confirmPasswordInput.type = "text";
        if (imgToggleConfirmPassword) {
          imgToggleConfirmPassword.src = "../Files/Img/Icon/eye-off.svg";
          imgToggleConfirmPassword.alt = "Hide Password";
        }
      } else {
        confirmPasswordInput.type = "password";
        if (imgToggleConfirmPassword) {
          imgToggleConfirmPassword.src = "../Files/Img/Icon/eye.svg";
          imgToggleConfirmPassword.alt = "Show Password";
        }
      }
    });
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
    try {
      currentDb = await readDatabase();
    } catch (e) {}
  }

  if (!currentDb || !currentDb.users || currentDb.users.length == 0) {
    currentDb = {
      users: [
        {
          id: "USR-1001",
          fullName: "System Admin",
          email: "simba@gmail.com",
          phone: "01711223344",
          dob: "1995-05-15",
          gender: "Male",
          division: "Dhaka",
          area: "Mirpur",
          grade: "PHD_Computer Science",
          role: "Admin",
          status: "Active",
          image: "../Files/Img/Profile/default.svg"
        },
        {
          id: "USR-1002",
          fullName: "Tariqul Islam",
          email: "tbn@gmail.com",
          phone: "01755667788",
          dob: "1998-03-20",
          gender: "Male",
          division: "Chittagong",
          area: "Feni",
          grade: "Graduate_BBA",
          role: "Area Coordinator",
          status: "Active",
          image: "../Files/Img/Profile/default.svg"
        },
        {
          id: "USR-1003",
          fullName: "Jerin Akter",
          email: "jerin@gmail.com",
          phone: "01822334455",
          dob: "2000-08-12",
          gender: "Female",
          division: "Dhaka",
          area: "Dhanmondi",
          grade: "Undergraduate_BSc",
          role: "Tutor",
          status: "Active",
          image: "../Files/Img/Profile/default.svg"
        },
        {
          id: "USR-1004",
          fullName: "Jui Sultana",
          email: "jui@gmail.com",
          phone: "01933445566",
          dob: "2006-11-25",
          gender: "Female",
          division: "Khulna",
          area: "Jashore",
          grade: "HSC-2nd Year_Science",
          role: "Student",
          status: "Active",
          image: "../Files/Img/Profile/default.svg"
        },
        {
          id: "USR-1005",
          fullName: "Nafis Ahmed",
          email: "nafis.ahmed@yahoo.com",
          phone: "01644556677",
          dob: "1999-07-18",
          gender: "Male",
          division: "Rajshahi",
          area: "Bogura",
          grade: "Undergraduate_EEE",
          role: "Tutor",
          status: "Pending Verification",
          image: "../Files/Img/Profile/default.svg"
        }
      ]
    };
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

  if (!targetUser && fromAdminParam == "student") {
    for (let i = 0; i < currentDb.users.length; i++) {
      if (currentDb.users[i].role == "Student") {
        targetUser = currentDb.users[i];
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

  if (userTypeSelect) {
    userTypeSelect.addEventListener("change", function () {
      clearFieldError("userType", "err-userType");
      const role = userTypeSelect.value;
      if (role == "Tutor" || role == "Student") {
        if (gradeSection) gradeSection.style.display = "block";
      } else {
        if (gradeSection) gradeSection.style.display = "none";
        if (gradeSelect) gradeSelect.value = "";
        if (detailedGradeInput) detailedGradeInput.value = "";
        clearFieldError("grade", "err-grade");
        clearFieldError("detailedGrade", "err-detailedGrade");
      }
    });
  }

  if (userStatusSelect) {
    userStatusSelect.addEventListener("change", function () {
      clearFieldError("userStatus", "err-userStatus");
    });
  }

  if (fullNameInput) {
    fullNameInput.addEventListener("input", function () {
      clearFieldError("fullName", "err-fullName");
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function () {
      clearFieldError("email", "err-email");
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      clearFieldError("phone", "err-phone");
    });
  }

  if (dobInput) {
    dobInput.addEventListener("input", function () {
      clearFieldError("dob", "err-dob");
    });
    dobInput.addEventListener("change", function () {
      clearFieldError("dob", "err-dob");
    });
  }

  if (genderRadios) {
    for (let i = 0; i < genderRadios.length; i++) {
      genderRadios[i].addEventListener("change", function () {
        clearFieldError("genderMale", "err-gender");
      });
    }
  }

  if (divisionSelect) {
    divisionSelect.addEventListener("change", function () {
      clearFieldError("division", "err-division");
      populateAreasForDivision(divisionSelect.value, "");
    });
  }

  if (areaSelect) {
    areaSelect.addEventListener("change", function () {
      clearFieldError("area", "err-area");
    });
  }

  if (gradeSelect) {
    gradeSelect.addEventListener("change", function () {
      clearFieldError("grade", "err-grade");
    });
  }

  if (detailedGradeInput) {
    detailedGradeInput.addEventListener("input", function () {
      clearFieldError("detailedGrade", "err-detailedGrade");
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      clearFieldError("password", "err-password");
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function () {
      clearFieldError("confirmPassword", "err-confirmPassword");
    });
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

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllFieldErrors();

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

      let isValid = true;

      if (isViewerAdmin) {
        if (!userType || userType == "") {
          setFieldError("userType", "err-userType", "Select User type");
          isValid = false;
        }
        if (!userStatus || userStatus == "") {
          setFieldError("userStatus", "err-userStatus", "Select account status");
          isValid = false;
        }
      }

      if (fullName.length == 0) {
        setFieldError("fullName", "err-fullName", "Enter full name");
        isValid = false;
      }

      if (email.length == 0) {
        setFieldError("email", "err-email", "Enter email address");
        isValid = false;
      } else {
        const atIdx = email.indexOf("@");
        const lastAtIdx = email.lastIndexOf("@");
        const dotIdx = email.lastIndexOf(".");
        if (atIdx <= 0 || atIdx != lastAtIdx || dotIdx <= atIdx + 1 || dotIdx >= email.length - 1) {
          setFieldError("email", "err-email", "Enter a valid email address (must contain @ and .)");
          isValid = false;
        }
      }

      if (phone.length == 0) {
        setFieldError("phone", "err-phone", "Enter phone number");
        isValid = false;
      } else if (phone.length != 11 || !isAllDigits(phone)) {
        setFieldError("phone", "err-phone", "Phone number must be 11 digits and contain only numbers");
        isValid = false;
      }

      if (!dob || dob.length == 0) {
        setFieldError("dob", "err-dob", "Select date of birth");
        isValid = false;
      } else {
        const age = calculateAge(dob);
        if (age < 5 || age > 80) {
          setFieldError("dob", "err-dob", "Age should be from 5 years to 80 years");
          isValid = false;
        }
      }

      if (!gender || gender.length == 0) {
        setFieldError("genderMale", "err-gender", "Select gender");
        isValid = false;
      }

      if (!division || division == "") {
        setFieldError("division", "err-division", "Select division");
        isValid = false;
      }

      if (!area || area == "") {
        setFieldError("area", "err-area", "Select area");
        isValid = false;
      }

      if (userType == "Tutor" || userType == "Student") {
        if (!grade || grade == "") {
          setFieldError("grade", "err-grade", "Select grade");
          isValid = false;
        }
        if (detailedGrade.length == 0) {
          setFieldError("detailedGrade", "err-detailedGrade", "Enter detailed grade");
          isValid = false;
        }
      }

      if (password.length == 0) {
        setFieldError("password", "err-password", "Enter password");
        isValid = false;
      }

      if (confirmPassword.length == 0) {
        setFieldError("confirmPassword", "err-confirmPassword", "Enter confirm password");
        isValid = false;
      } else if (password.length > 0 && password != confirmPassword) {
        setFieldError("confirmPassword", "err-confirmPassword", "Passwords do not match");
        isValid = false;
      }

      if (!isValid) {
        showAlert("Please resolve the highlighted errors below.", "error");
        return;
      }

      for (let i = 0; i < currentDb.users.length; i++) {
        let u = currentDb.users[i];
        if (u.id != targetUser.id) {
          if (u.email && u.email.toLowerCase() == email.toLowerCase()) {
            setFieldError("email", "err-email", "This email address is already used by another account.");
            showAlert("This email address is already used by another account.", "error");
            return;
          }
          if (u.phone && u.phone == phone) {
            setFieldError("phone", "err-phone", "This phone number is already used by another account.");
            showAlert("This phone number is already used by another account.", "error");
            return;
          }
        }
      }

      let gradeDetailedFormatted = "N/A";
      if (userType == "Tutor" || userType == "Student") {
        gradeDetailedFormatted = grade + "_" + detailedGrade;
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
        if (userType == "Tutor") nextUrl = "../Tutor/tutor.html";
        else if (userType == "Student") nextUrl = "../Student/profile.html";
        else if (userType == "Area Coordinator") nextUrl = "../Coordinator/coordinator.html";
        if (userType == "Tutor") nextUrl = "../Tutor/profile.html";
        else if (userType == "Student") nextUrl = "../Student/student_portal.html";
        else if (userType == "Area Coordinator") nextUrl = "../Coordinator/coordinator_portal.html";
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
