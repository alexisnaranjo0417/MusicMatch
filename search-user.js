import { auth } from '../firebase_FR.js'
    import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'
    onAuthStateChanged(auth, (user) => {
        if (user) {
            
            //const display = user.displayName || user.email
            //document.getElementById("user-email").textContent = display;

            //const photoURL = user.photoURL || "../placeholders/user.png";
            //document.getElementById("user-photo").style.backgroundImage = `url('${photoURL}')`;
            
            //const logout = document.getElementById('logout-btn');
            //logout.style.visibility = 'visible';
            const log = document.getElementById("log");
            log.style.visibility = "hidden";
            
            const sign = document.getElementById("sign");
            sign.innerHTML = "Log Out";
            sign.addEventListener("click", function() {
                signOut(auth).then(() => {
                    // Sign-out successful.
                    window.location.href = 'nonuserlanding.html';
                    alert('SIGNED OUT');
                }).catch((error) => {
                    // An error happened.
                    console.log(error);
                });
            });

            

            console.log("User object:", user);

        } else {
            //document.getElementById("user-email").textContent = "Not signed in";
            //window.location.href = "login.html"; // Redirect if not logged in
            const logout = document.getElementById("logout-btn");
            logout.style.visibility = 'hidden';
        }
    });