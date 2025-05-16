import { auth, setUserData } from './firebase.js'
import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'
import { downloadJSONResponse } from './helpers.js';

const register = document.getElementById("register")
register.addEventListener("click", function(e){
    e.preventDefault();
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const userName = document.getElementById('user-name').value
    const profilePhoto = "../placeholders/user.jpg"

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password does not meet the requirements. Email must be valid and password must be 8 characters long')
    return
    // Don't continue running the code
    }
    if (validate_field(userName) == false) {
        alert('Please enter a valid username')
        return
    }

    //Auth and register user
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      try {
        //downloadJSONResponse(userCredential); // Userdate For reference

        const user = userCredential.user;
        await updateProfile(auth.currentUser, { displayName: userName, photoURL: profilePhoto });
        await setUserData(user.uid, userName, user.email, profilePhoto);

        alert("ACCOUNT CREATED");
        window.location.href = 'landing.html';
      }
      catch (error) {
        const errorMessage = error.message;
        console.log(error);
      }
    })
    .catch((error) => {
      const errorMessage = error.message;
      console.log(errorMessage);
    });
});

function validate_email(email) {
  var expression = /^[^@]+@\w+(\.\w+)+\w$/
  if(expression.test(email) == true) {
    //email is good
    return true
  } else {
    //email is invalid
    return false
  }
}

function validate_password(password) {
  //password must be at least 8 charaters long
  if (password.length < 8) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field === null || field === undefined) {
    return false
  }

  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}
