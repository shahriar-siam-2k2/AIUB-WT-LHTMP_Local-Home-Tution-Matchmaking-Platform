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

  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") == "true") {
    showAlert("Registration successful! Please login with your email or phone number.", "success");
  }

  if (loginForm) {
    loginForm.addEventListener("reset", function () {
      const alertBox = document.getElementById("login-alert");
      if (alertBox) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
      }
    });

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const identifierInput = document.getElementById("identifier").value;
      const passwordInput = document.getElementById("password").value;

      if (identifierInput == "" || passwordInput == "") {
        showAlert("Please enter both your email/phone number and password.");
        return;
      }

      try {
        let matchedUser = null;

        if (typeof readDatabase == "function") {
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
          } catch (e) {}
        }

        if (!matchedUser && typeof readUser == "function") {
          const accountsEntries = await readUser();
          for (let i = 0; i < accountsEntries.length; i++) {
            const acc = accountsEntries[i].parsed;
            if (
              (acc.email.toLowerCase() == identifierInput.toLowerCase() ||
                acc.phone == identifierInput) &&
              acc.password == passwordInput
            ) {
              matchedUser = acc;
              break;
            }
          }
        }

        if (!matchedUser) {
          showAlert("Invalid email/phone number or password. Please try again.");
          return;
        }

        const targetPage = getRedirectPage(matchedUser.userType);
        if (!targetPage) {
          showAlert("Unrecognized user role: " + matchedUser.userType);
          return;
        }

        sessionStorage.setItem("lhtmp_current_user", JSON.stringify(matchedUser));
        showAlert("Welcome " + matchedUser.fullName + "! Redirecting to " + matchedUser.userType + " dashboard...", "success");

        setTimeout(function () {
          window.location.href = targetPage;
        }, 600);
      } catch (error) {
        showAlert("Error reading users.txt. Please run the project using a local server.");
      }
    });
  }
});