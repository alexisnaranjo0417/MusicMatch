import { auth } from './firebase.js'
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'
import { setNavigationElement} from './helpers.js';
import searchTermsSet, { recentSearches, displayFavorites, displayBanner, displayBio, editProfile, displayProfilePic, displayUserComments } from "./firebase.js"

document.addEventListener("DOMContentLoaded", function() {
    recentSearches();    
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        setNavigationElement(true);

        //this condional is responsible for displaying the profile page
        if (document.getElementById("faves") != null) 
        {
            displayBanner(user.uid);
            displayFavorites(user.uid);
            displayBio(user.uid);
            editProfile(user.uid);
            displayUserComments();
        }

        const display = user.displayName || user.email
        document.getElementById("user-email").textContent = display;

        const photoURL = user.photoURL || "../placeholders/user.jpg";
        document.getElementById("user-photo").style.backgroundImage = `url('${photoURL}')`;

        if(document.getElementById("profile-src")!= null)
        {
            displayProfilePic(user.uid);           
        }
            
        const logout = document.getElementById('logout-btn');
        logout.style.visibility = 'visible';
        logout.addEventListener('click', function(e) {
            signOut(auth).then(() => {
                // Sign-out successful.
                alert('SIGNED OUT');
                window.location.href = 'landing.html'; //redirect to landing
            }).catch((error) => {
                // An error happened.
                console.log(error);
            });
        });

            console.log("User object:", user);

    } 
});
