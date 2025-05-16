import { auth } from './firebase.js'
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'

const login = document.getElementById('login');
login.addEventListener('click', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    //alert('SIGNED IN');
    window.location.href = 'landing.html';
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
});

const provider = new GoogleAuthProvider();

const googleLogin = document.getElementById("google-signin-btn");
googleLogin.addEventListener("click", function(e) {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    alert("Signed in with Google")
    window.location.href = "landing.html"

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
});
