const email = document.getElementById("loginmail");
const passWord = document.getElementById("loginpass");
const logintn = document.getElementById("logtn");

logintn.addEventListener("click", () => {
  const userEmail = email.value;
  const userPass = passWord.value;

  const savedEmail = localStorage.getItem("userEmail");
  const savedPass = localStorage.getItem("userPassword");

  if (userEmail === savedEmail && userPass === savedPass) {
    alert("correct");
    window.location.href = "dashboard.html";
  } else {
    alert("incorrect");
  }
});

