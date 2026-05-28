const signupname = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signpassWord = document.getElementById("spass");
const button = document.getElementById("signbtn");

button.addEventListener("click", () => {
  const username = signupname.value;
  const useremail = signupEmail.value;
  const userpass = signpassWord.value;

  localStorage.setItem("userName", username);
  localStorage.setItem("userEmail", useremail);
  localStorage.setItem("userPassword", userpass);

  alert("Account created!");
  window.location.href = "login.html";
});
