function showAlert(message, type) {
  const alertBox = document.getElementById("login-alert");
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

function getRedirectPage(userType) {
  if (!userType) return null;
  const s = userType.toLowerCase();
  if (s == "admin") return "../Admin/admin.html";
  if (s == "area coordinator" || s == "coordinator") return "../Coordinator/coordinator.html";
  if (s == "tutor") return "../Tutor/tutor.html";
  if (s == "student") return "../Student/student.html";
  return null;
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const identifierField = document.getElementById("identifier");
  const passwordField = document.getElementById("password");

  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") == "true") {
    showAlert("Registration successful! Please login with your email or phone number.", "success");
  }

  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const imgTogglePassword = document.getElementById("imgTogglePassword");
  if (btnTogglePassword) {
    btnTogglePassword.addEventListener("click", function () {
      if (!passwordField) return;
      if (passwordField.type == "password") {
        passwordField.type = "text";
        if (imgTogglePassword) {
          imgTogglePassword.src = "../Files/Img/Icon/eye-off.svg";
          imgTogglePassword.alt = "Hide Password";
        }
      } else {
        passwordField.type = "password";
        if (imgTogglePassword) {
          imgTogglePassword.src = "../Files/Img/Icon/eye.svg";
          imgTogglePassword.alt = "Show Password";
        }
      }
    });
  }

  if (identifierField) {
    identifierField.addEventListener("input", function () {
      clearFieldError("identifier", "err-identifier");
    });
  }

  if (passwordField) {
    passwordField.addEventListener("input", function () {
      clearFieldError("password", "err-password");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("reset", function () {
      const alertBox = document.getElementById("login-alert");
      if (alertBox) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
      }
      clearFieldError("identifier", "err-identifier");
      clearFieldError("password", "err-password");
      if (passwordField) passwordField.type = "password";
      if (imgTogglePassword) {
        imgTogglePassword.src = "../Files/Img/Icon/eye.svg";
        imgTogglePassword.alt = "Show Password";
      }
    });

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearFieldError("identifier", "err-identifier");
      clearFieldError("password", "err-password");

      const identifierInput = identifierField ? cleanInputText(identifierField.value) : "";
      const passwordInput = passwordField ? passwordField.value : "";

      let isValid = true;

      if (identifierInput.length == 0) {
        setFieldError("identifier", "err-identifier", "Enter email or phone number");
        isValid = false;
      } else if (identifierInput.indexOf("@") != -1) {
        const atIdx = identifierInput.indexOf("@");
        const lastAtIdx = identifierInput.lastIndexOf("@");
        const dotIdx = identifierInput.lastIndexOf(".");
        if (atIdx <= 0 || atIdx != lastAtIdx || dotIdx <= atIdx + 1 || dotIdx >= identifierInput.length - 1) {
          setFieldError("identifier", "err-identifier", "Enter a valid email address (must contain @ and .)");
          isValid = false;
        }
      } else if (isAllDigits(identifierInput)) {
        if (identifierInput.length != 11) {
          setFieldError("identifier", "err-identifier", "Phone number must be 11 digits and contain only numbers");
          isValid = false;
        }
      } else {
        setFieldError("identifier", "err-identifier", "Enter a valid email address or 11-digit phone number");
        isValid = false;
      }

      if (passwordInput.length == 0) {
        setFieldError("password", "err-password", "Enter password");
        isValid = false;
      }

      if (!isValid) {
        showAlert("Please fill in all required credentials correctly.", "error");
        return;
      }

      let matchedUser = null;

      const demoAccounts = [
        { id: "USR-1001", fullName: "System Admin", email: "simba@gmail.com", phone: "01629054073", password: "simba", userType: "Admin" },
        { id: "USR-1002", fullName: "Tariqul Islam", email: "tbn@gmail.com", phone: "01849239584", password: "tbn", userType: "Area Coordinator" },
        { id: "USR-1003", fullName: "Jerin Akter", email: "jerin@gmail.com", phone: "01957495765", password: "jerin", userType: "Tutor" },
        { id: "USR-1004", fullName: "Jui Sultana", email: "jui@gmail.com", phone: "01284039498", password: "jui", userType: "Student" }
      ];

      for (let i = 0; i < demoAccounts.length; i++) {
        let acc = demoAccounts[i];
        if (
          (acc.email.toLowerCase() == identifierInput.toLowerCase() || acc.phone == identifierInput) &&
          acc.password == passwordInput
        ) {
          matchedUser = acc;
          break;
        }
      }

      if (!matchedUser && typeof readDatabase == "function") {
        try {
          let db = await readDatabase();
          if (db && db.users) {
            for (let i = 0; i < db.users.length; i++) {
              let u = db.users[i];
              if (
                (u.email.toLowerCase() == identifierInput.toLowerCase() || u.phone == identifierInput) &&
                u.password == passwordInput
              ) {
                matchedUser = {
                  id: u.id,
                  fullName: u.fullName,
                  email: u.email,
                  phone: u.phone,
                  password: u.password,
                  dob: u.dob,
                  gender: u.gender,
                  division: u.division,
                  area: u.area,
                  grade: u.grade,
                  userType: u.role,
                  role: u.role
                };
                break;
              }
            }
          }
        } catch (err) {}
      }

      if (!matchedUser && typeof readUser == "function") {
        try {
          const accountsEntries = await readUser();
          for (let i = 0; i < accountsEntries.length; i++) {
            const acc = accountsEntries[i].parsed;
            if (
              acc &&
              (acc.email.toLowerCase() == identifierInput.toLowerCase() || acc.phone == identifierInput) &&
              acc.password == passwordInput
            ) {
              matchedUser = acc;
              break;
            }
          }
        } catch (err) {}
      }

      if (!matchedUser) {
        showAlert("Invalid email/phone number or password. Please try again.", "error");
        return;
      }

      const targetPage = getRedirectPage(matchedUser.userType);
      if (!targetPage) {
        showAlert("Unrecognized user role: " + matchedUser.userType, "error");
        return;
      }

      sessionStorage.setItem("lhtmp_current_user", JSON.stringify(matchedUser));
      showAlert("Welcome " + matchedUser.fullName + "! Redirecting to " + matchedUser.userType + " portal...", "success");

      setTimeout(function () {
        window.location.href = targetPage;
      }, 600);
    });
  }
});
