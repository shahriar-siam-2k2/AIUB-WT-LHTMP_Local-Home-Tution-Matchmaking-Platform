let existingDatabaseEntries = [];
let divisionAreaData = [];
let gradesData = [];

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

async function loadLists() {
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
          const division = line.substring(0, colonIndex);
          const rawAreas = line.substring(colonIndex + 1).split(",");
          let areas = [];
          for (let a = 0; a < rawAreas.length; a++) {
            let item = rawAreas[a];
            let start = 0;
            while (start < item.length && item.charAt(start) == " ") start++;
            let end = item.length - 1;
            while (end >= 0 && item.charAt(end) == " ") end--;
            if (start <= end) {
              areas.push(item.substring(start, end + 1));
            }
          }
          divisionAreaData.push({ division: division, areas: areas });
        }
      } else if (currentSection == "GRADES") {
        const rawGrades = line.split(",");
        for (let g = 0; g < rawGrades.length; g++) {
          let item = rawGrades[g];
          let start = 0;
          while (start < item.length && item.charAt(start) == " ") start++;
          let end = item.length - 1;
          while (end >= 0 && item.charAt(end) == " ") end--;
          if (start <= end) {
            gradesData.push(item.substring(start, end + 1));
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

document.addEventListener("DOMContentLoaded", async function () {
  const userTypeSelect = document.getElementById("userType");
  const divisionSelect = document.getElementById("division");
  const areaSelect = document.getElementById("area");
  const gradeSection = document.getElementById("gradeSection");
  const gradeSelect = document.getElementById("grade");
  const detailedGradeInput = document.getElementById("detailedGrade");
  const registrationForm = document.getElementById("registrationForm");

  let isFromAdmin = window.location.search.indexOf("source=user_management") != -1;
  if (!isFromAdmin && document.referrer.indexOf("user_management") != -1) {
    isFromAdmin = true;
  }
  if (isFromAdmin) {
    let cancelLink = document.getElementById("linkCancelReg");
    if (cancelLink) {
      cancelLink.href = "../Admin/user_management.html";
    }
    let cancelBtn = document.getElementById("btnCancelReg");
    if (cancelBtn) {
      cancelBtn.onclick = function () {
        window.location.href = "../Admin/user_management.html";
      };
    }
  }

  if (gradeSection) {
    gradeSection.style.display = "none";
  }

  await loadLists();

  if (divisionSelect) {
    let divHtml = '<option value="" disabled selected>Select Division</option>';
    for (let i = 0; i < divisionAreaData.length; i++) {
      divHtml += '<option value="' + divisionAreaData[i].division + '">' + divisionAreaData[i].division + '</option>';
    }
    divisionSelect.innerHTML = divHtml;
  }

  if (areaSelect) {
    areaSelect.disabled = true;
    areaSelect.innerHTML = '<option value="" disabled selected>Select Division First</option>';
  }

  if (gradeSelect) {
    let grHtml = '<option value="" disabled selected>Select Grade</option>';
    for (let i = 0; i < gradesData.length; i++) {
      grHtml += '<option value="' + gradesData[i] + '">' + gradesData[i] + '</option>';
    }
    gradeSelect.innerHTML = grHtml;
  }

  try {
    if (typeof readUser == "function") {
      existingDatabaseEntries = await readUser();
    }
  } catch (error) {
    showAlert("Could not read users.txt. Please run the project on a local server.");
  }

  if (divisionSelect && areaSelect) {
    divisionSelect.addEventListener("change", function () {
      const selectedDivision = divisionSelect.value;
      if (!selectedDivision) {
        areaSelect.disabled = true;
        areaSelect.innerHTML = '<option value="" disabled selected>Select Division First</option>';
        return;
      }

      let areaHtml = '<option value="" disabled selected>Select Area</option>';
      let foundAreas = [];

      for (let i = 0; i < divisionAreaData.length; i++) {
        if (divisionAreaData[i].division == selectedDivision) {
          foundAreas = divisionAreaData[i].areas;
          break;
        }
      }

      if (foundAreas.length > 0) {
        areaSelect.disabled = false;
        for (let i = 0; i < foundAreas.length; i++) {
          areaHtml += '<option value="' + foundAreas[i] + '">' + foundAreas[i] + '</option>';
        }
        areaSelect.innerHTML = areaHtml;
      } else {
        areaSelect.disabled = true;
      }
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

  const profileImageInput = document.getElementById("profileImage");
  const avatarPreview = document.getElementById("avatarPreview");
  let regAvatarDataUrl = "";

  if (profileImageInput && avatarPreview) {
    profileImageInput.addEventListener("change", function () {
      if (profileImageInput.files && profileImageInput.files.length > 0) {
        let file = profileImageInput.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
          regAvatarDataUrl = e.target.result;
          avatarPreview.src = regAvatarDataUrl;
        };
        reader.readAsDataURL(file);
      } else {
        regAvatarDataUrl = "";
        avatarPreview.src = "../Files/Img/Profile/default.svg";
      }
    });
  }

  if (registrationForm) {
    registrationForm.addEventListener("reset", function () {
      const alertBox = document.getElementById("reg-alert");
      if (alertBox) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
      }
      if (gradeSection) {
        gradeSection.style.display = "none";
      }
      if (gradeSelect) {
        gradeSelect.required = false;
        gradeSelect.value = "";
      }
      if (detailedGradeInput) {
        detailedGradeInput.required = false;
        detailedGradeInput.value = "";
      }
      if (areaSelect) {
        areaSelect.disabled = true;
        areaSelect.innerHTML = '<option value="" disabled selected>Select Division First</option>';
      }
      let profileImgField = document.getElementById("profileImage");
      if (profileImgField) {
        profileImgField.value = "";
      }
      if (avatarPreview) {
        avatarPreview.src = "../Files/Img/Profile/default.svg";
      }
      regAvatarDataUrl = "";
    });

    registrationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let profileImgName = "../Files/Img/Profile/default.svg";
      const profileImgInput = document.getElementById("profileImage");
      if (profileImgInput && profileImgInput.files && profileImgInput.files.length > 0) {
        profileImgName = "../Files/Img/Profile/" + profileImgInput.files[0].name;
      }

      const userType = userTypeSelect ? userTypeSelect.value : "";
      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const dob = document.getElementById("dob").value;

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
      const detailedGrade = detailedGradeInput ? detailedGradeInput.value : "";
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (userType == "" || fullName == "" || email == "" || phone == "" || dob == "" || gender == "" || division == "" || area == "" || password == "" || confirmPassword == "") {
        showAlert("Please fill in all required fields.");
        return;
      }

      if (phone.length != 11) {
        showAlert("Phone number must be exactly 11 digits.");
        return;
      }

      let gradeDetailedFormatted = "N/A";
      if (userType == "Tutor" || userType == "Student") {
        if (grade == "" || detailedGrade == "") {
          showAlert("Please select a Grade and enter your Detailed Grade.");
          return;
        }
        gradeDetailedFormatted = grade + "_" + detailedGrade;
      }

      if (password != confirmPassword) {
        showAlert("Password and Confirm Password do not match.");
        return;
      }

      try {
        const currentEntries = existingDatabaseEntries.length > 0
          ? existingDatabaseEntries
          : (typeof readUser == "function" ? await readUser() : []);

        for (let i = 0; i < currentEntries.length; i++) {
          let acc = currentEntries[i].parsed;
          if (acc) {
            if (acc.email.toLowerCase() == email.toLowerCase()) {
              showAlert("This email address is already registered. Please use a unique email.");
              return;
            }
            if (acc.phone == phone) {
              showAlert("This phone number is already registered. Please use a unique 11-digit phone number.");
              return;
            }
          }
        }

        const newRecordLine = "{" + fullName + "}; {" + email + "}; {" + phone + "}; {" + password + "}; {" + dob + "}; {" + gender + "}; {" + division + "}; {" + area + "}; {" + gradeDetailedFormatted + "}; {" + userType + "}";

        let lines = [];
        for (let i = 0; i < currentEntries.length; i++) {
          lines.push(currentEntries[i].raw);
        }
        lines.push(newRecordLine);
        const updatedText = lines.join("\n");

        if (typeof writeUser == "function") {
          await writeUser(updatedText);
        }

        if (typeof readDatabase == "function" && typeof writeDatabase == "function") {
          try {
            let db = await readDatabase();
            if (db && db.users) {
              let newId = "USR-" + (1001 + db.users.length);
              let now = new Date();
              let y = now.getFullYear();
              let m = now.getMonth() + 1;
              let d = now.getDate();
              let hr = now.getHours();
              let mn = now.getMinutes();
              let yStr = "" + y;
              let mStr = m < 10 ? "0" + m : "" + m;
              let dStr = d < 10 ? "0" + d : "" + d;
              let hrStr = hr < 10 ? "0" + hr : "" + hr;
              let mnStr = mn < 10 ? "0" + mn : "" + mn;
              let dateStr = yStr + "-" + mStr + "-" + dStr + " " + hrStr + ":" + mnStr;
              db.users.push({
                raw: "{" + newId + "}; {" + fullName + "}; {" + email + "}; {" + phone + "}; {" + password + "}; {" + dob + "}; {" + gender + "}; {" + division + "}; {" + area + "}; {" + gradeDetailedFormatted + "}; {" + userType + "}; {Active}; {" + dateStr + "}; {" + profileImgName + "}",
                id: newId,
                fullName: fullName,
                email: email,
                phone: phone,
                password: password,
                dob: dob,
                gender: gender,
                division: division,
                area: area,
                grade: gradeDetailedFormatted,
                role: userType,
                status: "Active",
                date: dateStr,
                image: profileImgName
              });
              writeDatabase(db);
              if (regAvatarDataUrl.length > 0) {
                localStorage.setItem("lhtmp_avatar_" + newId, regAvatarDataUrl);
                localStorage.setItem("lhtmp_avatar_" + email, regAvatarDataUrl);
              }
            }
          } catch (e) {}
        }

        let isFromAdmin = window.location.search.indexOf("source=user_management") != -1;
        if (!isFromAdmin && document.referrer.indexOf("user_management") != -1) {
          isFromAdmin = true;
        }

        if (isFromAdmin) {
          showAlert("Account registered successfully! Redirecting to user management...", "success");
          setTimeout(function () {
            window.location.href = "../Admin/user_management.html";
          }, 1000);
        } else {
          showAlert("Account registered and written to users.txt! Redirecting to login...", "success");
          setTimeout(function () {
            window.location.href = "../Login/login.html?registered=true";
          }, 1000);
        }
      } catch (error) {
        showAlert("Error accessing users.txt. Please run the project using a local server.");
      }
    });
  }
});