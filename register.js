import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from './firebase_FR.js'

const register = document.getElementById("register")
register.addEventListener("click", function(e){
    e.preventDefault();
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const full_name = document.getElementById('full_name').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password does not meet the requirements. Email must be valid and password must be 8 characters long')
    return
    // Don't continue running the code
    }
    if (validate_field(full_name) == false) {
        alert('Please enter your full name')
        return
    }

    //Auth and register user
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      updateProfile(auth.currentUser, { displayName: full_name })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(error);
      });
      alert("ACCOUNT CREATED");
      window.location.href = 'landing.html'
    })
    .catch((error) => {
      const errorMessage = error.message;
      console.log(errorMessage);
    })     
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
  if (password < 8) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field == null) {
    return false
  }

  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}
