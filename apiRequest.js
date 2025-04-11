import displayResultsArt, {generateArtDetailsHTML} from "./artist.js"
import displayResultsAlb, {generateAlbDetailsHTML, getRecommendedAlbums} from "./album.js"
import displayResultsRec, {generateRecDetailsHTML, getRecommendedSongs} from "./recording.js"
import { encodeSpacesToPlus } from "./helpers.js"

//handles api request for search and displays results, relevant js functionsAll.js
export default function apiRequestSearch(typeName, name)
{
	//requests 50 entities for search results
    //TODO: changed to 5, change back to 50 when done testing
    name = encodeSpacesToPlus(name);
    const requestUrl = 'https://musicbrainz.org/ws/2/' + typeName + '?query=' + name + '&inc=tags+user-ratings&limit=50&fmt=json';

		fetch(requestUrl, {
		headers: {
			'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
		},
		})
		.then((response) => response.json())
		.then((data) => {
			downloadJSONResponse(data); //uncomment if you want to see json for results returned used by search
			if (typeName == "recording")
			{
				console.log(data.recordings);			
				data.recordings.forEach(item => {			
					displayResultsRec(item);
				});
			}
			else if(typeName == "artist")
			{
				console.log(data.artists);			
				data.artists.forEach(item => {			
					displayResultsArt(item);
				});				
			}
			else
			{
				console.log(data["release-groups"]);			
				data["release-groups"].forEach(item => {			
					displayResultsAlb(item);
				});
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

export async function apiRequestDetails(type, ID) 
{

    var info = "";
    if (type == 'recording') {
        info = '?inc=artist-credits+release-groups+releases+tags+ratings&fmt=json';
    }
    else if (type == 'release-group'){
        info = '?inc=artist-credits+releases+tags&fmt=json';
    }
    else {
        info = '?inc=artist-credits+recordings+tags&fmt=json';
    }

    const requestUrl = 'http://musicbrainz.org/ws/2/' + type + '/' + ID + info;
    try{
        let response = await fetch(requestUrl, {
            headers: {
                'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
            }
        })
        let data = await response.json();
        //downloadJSONResponse(data); //uncomment line if want to download respective JSON for entity
        if (type == 'recording') {
            generateRecDetailsHTML(data);
        }
        else if (type == 'release-group'){
            let releaseGroupData = data;
            let releaseData = await apiRequestReleaseData(releaseGroupData.releases[0].id);
            await new Promise(resolve => setTimeout(resolve, 1000)); //'sleeping' for 1 second for API rate limit
            generateAlbDetailsHTML(releaseGroupData, releaseData);
        }
        else {
            generateArtDetailsHTML(data);
        }

    }
    catch (error) {
        console.error(error);
    }
}


//extract information about a release from release group
export async function apiRequestReleaseData(releaseID) {

    const requestURL = 'https://musicbrainz.org/ws/2/release/' + releaseID + '?inc=recordings&fmt=json';
    try {
        const response = await fetch(requestURL, {
            headers: {
                'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
            }
        });

        const data = await response.json();
        // downloadJSONResponse(data); //uncomment if you want to see json for results returned used by search
        return data;
    }
    catch (error) {
        //hope it doesn't go here
        console.error(error);
    }
}

export async function apiRequestReleaseGroupData(releaseGroupID) {

    const requestURL = 'https://musicbrainz.org/ws/2/release-group/' + releaseGroupID + '?inc=artist-credits+releases+tags&fmt=json';
    try {
        const response = await fetch(requestURL, {
            headers: {
                'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
            }
        });

        const data = await response.json();
        // downloadJSONResponse(data); //uncomment if you want to see json for results returned used by search
        return data;
    }
    catch (error) {
        console.error(error);
    }
}

export function apiRequestRecommendatons(type, tagsQuery){
    const requestUrl = 'https://musicbrainz.org/ws/2/' + type + '?query=' + tagsQuery + '&limit=4&fmt=json';

    fetch(requestUrl, {
        headers: {
            'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
        },
    })
    .then((response) => response.json())
    .then((data) => {
        //downloadJSONResponse(data); //uncomment if you want to see json for results returned used by search
        if (type == "recording")
        {
            getRecommendedSongs(data);
        }
        else if (type == "release-group")
        {
            getRecommendedAlbums(data);
        }
    })
}

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
