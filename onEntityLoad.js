import searchTermsSet, {entityCountsSet, recentSearches} from "./firebase.js"
import apiRequestSearch, {apiRequestDetails} from "./apiRequest.js"
import { auth } from './firebase.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'
import { setComments } from "./helpers.js";

//Check URL for entityID to pass to API request
document.addEventListener("DOMContentLoaded", async function() {
    recentSearches();
    const urlParams = new URLSearchParams(window.location.search);
    const recordingID = urlParams.get('recordingID');
    const albumID = urlParams.get('albumID');
    const artistID = urlParams.get('artistID');
    let entityID = undefined;
    let type = "";
    //entityCountsSet(recordingID);

    if (recordingID != null) {
        entityCountsSet(recordingID);
        await apiRequestDetails('recording', recordingID);
        entityID = recordingID;
        type = "Song";
    }
    else if (albumID != null) {
        entityCountsSet(albumID);
        await apiRequestDetails('release-group', albumID);
        entityID = albumID;
        type = "Album";
    }
    else if (artistID != null) {
        entityCountsSet(artistID);
        await apiRequestDetails('artist', artistID);
        entityID = artistID;
        type = "Artist";
    }
    else {
        console.log("No details found");
        //fallbackDetails(); function is not currently defined.
    }

    var entityName = document.getElementById("entity-name").innerHTML;
    console.log(entityName + type);

    //check if user is logged in
    onAuthStateChanged(auth, (user) => {
        const checkUser = Boolean(user);
		if(checkUser) {
			setComments(checkUser, user.uid, entityID, entityName, type);
		}
		else {
			setComments(checkUser, null, entityID, entityName, type);
		}
    })
})


//Testing function: download json reponse to check it
function downloadJSONResponse(data) {
    const downloadJSON = document.createElement("a");
    downloadJSON.href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        })
    );
    downloadJSON.setAttribute("download", "recordingData.json");
    document.body.appendChild(downloadJSON);
    downloadJSON.click();
    document.body.removeChild(downloadJSON); 
}
