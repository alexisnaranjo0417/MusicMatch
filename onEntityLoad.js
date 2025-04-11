import searchTermsSet, {entityCountsSet, recentSearches} from "./firebase.js"
import apiRequestSearch, {apiRequestDetails} from "./apiRequest.js"

//Check URL for entityID to pass to API request
document.addEventListener("DOMContentLoaded", function() {
    recentSearches();
    const urlParams = new URLSearchParams(window.location.search);
    const recordingID = urlParams.get('recordingID');
    const albumID = urlParams.get('albumID');
    const artistID = urlParams.get('artistID');
    entityCountsSet(recordingID);

    if (recordingID != null) {
        entityCountsSet(recordingID);
        apiRequestDetails('recording', recordingID);
    }
    else if (albumID != null) {
        entityCountsSet(albumID);
        apiRequestDetails('release-group', albumID);
    }
    else if (artistID != null) {
        entityCountsSet(artistID);
        apiRequestDetails('artist', artistID);
    }
    else {
        console.log("No details found");
        //fallbackDetails(); function is not currently defined.
    }
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
