import { getTagsOrdered, tagsToString, getTrueTagsQuery } from "./helpers.js";
import searchTermsSet, { auth, viewCounts, entityDetailCountsGet } from "./firebase.js"
import { apiRequestRecommendatons } from "./apiRequest.js";
import favoriteEntity from "./favorites.js";
//Displays up to 50 search results for recordings/songs
//function used for to display search results, relevant js is functionsAll.js apiRequest.js
export default async function displayResultsRec(data) //DO NOT MAKE AN API REQUEST HERE FOR (artist or album data)
{
	//get tags of a search result item in decending order
	let tagsObject = getTagsOrdered(data); //object holding series of tags properties
    let tagsList = tagsToString(tagsObject);

	let results = document.getElementById("results-container");
	let itemdetails = document.createElement("div");

	var musicbrainzid = data.id;
	let detailsURL = 'entitydetails.html?recordingID=' + encodeURIComponent(musicbrainzid);

    let counts = await viewCounts(musicbrainzid);

	let coverArtUrl = `https://coverartarchive.org/release-group/${data.releases[0]['release-group'].id}/front`;
	let noCover = '../vinyl.png';

    itemdetails.innerHTML = 
		`<style>
			.results{
				display: flex;
				background: linear-gradient(rgb(27, 27, 31));
				border: 1px solid #2d2d3c;
				border-radius: 25px;
				padding: 16px;
				margin: 10px;
				gap: 16px;
				transition: transform 0.2s ease;
			}
                
			.results:hover{
				transform: scale(1.01);
			}

			.cover{
				width: 200px;
				height: 200px;
				object-fit: cover;
			}

			.wholeDetails{
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				flex: 1;
				color: #ffffff;
			}

			.nameDetails{
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				margin-bottom: 8px;
			}

			.nameDetails > div{
				flex: 1;
                text-align: center;
			}

			.nameDetails > div:first-child{
				text-align: left;
			}

			.nameDetails > div:last-child{
				text-align: right;
			}

			.tagsContainer{
				margin: 6px 0;
				font-size: 0.9rem;
				color: #c7c7d9;
			}

			.tags{
				background: rgba(255, 255, 255, 0.05);
				padding: 6px 10px;
				border-radius: 6px;
				display: inline-block;
			}

			.rest{
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 0.85rem;
				color: #aaaaaa;
				margin-top: 10px;
			}
		</style>
        <a style="text-decoration: none; color: #ffffff" href="${detailsURL}"><div class="results">
			<img class="cover" src="${coverArtUrl}" alt="Song Cover" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Song: ${data.title}</div>
					<div class="artist">Artist: ${data['artist-credit'][0].name} </div>
                    <div class="date">Album: ${data.releases[0]['release-group'].title} </div>
					<div class="date">Release Date: ${data['first-release-date']} </div>
				</div>
                <div class="tagsContainer">
					<div class="tags">Tags: ${tagsList} </div>
				</div>
				<div class="rest">
					<div class="userNum">${counts}</div>
				</div>
			</div>
		</div></a>`;

	results.appendChild(itemdetails);
}

//function used to generate entity deails, relevant js is onEntityLoad.js, apiRequest.js
export async function generateRecDetailsHTML(data) {
	let tagsObject = getTagsOrdered(data);
    var musicbrainzid = data.id;
    let type = "Song";

	let coverArtUrl = `https://coverartarchive.org/release-group/${data.releases[0]['release-group'].id}/front`;
	let noCover = '../vinyl.png';

    let albumURL = `entitydetails.html?albumID=${encodeURIComponent(data.releases[0]['release-group'].id)}`;
    let artistURL = `entitydetails.html?artistID=${encodeURIComponent(data['artist-credit'][0].artist.id)}`;

    let mainContent = document.getElementById("main-content");
    let recDetailsHTML = document.createElement("div");

    const tagStates = {}; //keep track if tag is selected or not, key is tag name & value is boolean

    if (data.rating.value == null) {
        data.rating.value = "No rating";
    }
    recDetailsHTML.innerHTML = `

        <div class="song-information-container">
            <div class="song-details-containter">
            <img class="cover-art" src="${coverArtUrl}" alt="Song Cover" onerror="this.src='${noCover}';">
                <div class="song-description">
                       <div id="entity-name">${data.title}</div>
                    <div class="album-artist-container">
                        <a style="text-decoration: none; color: #ffffff;" href="${albumURL}">
                            <div class="album-name">${data.releases[0]['release-group'].title}</div>
                        </a>
                        <div class="alb-art-divider"> - </div>
                        <a style="text-decoration: none; color: #ffffff;" href="${artistURL}">
                            <div class="artist-name">${data['artist-credit'][0].name}</div>
                        </a>
                    </div>
                    <div class="track-details">
                        <ul>
                            <li>Rating: ${data.rating.value}</li>
                            <li>Duration: ${data.length}</li>
                            <li>Release Date: ${data.releases[0].date}</li>
                            <li>Country: ${data.releases[0].country}</li>
                            <li id="counts"></li>
                        </ul>
                        <div id="favorites" style="font-size: 30px;"></div>
                    </div>
                </div>
            <div class="song-tags-container", id="song-tags-container">
                <h1 class="song-tags-title">Song Tags</h1>
            </div>
        </div>
        <div class="comments-recommendations-section">
			<div class="comments-section">
				<h1>Comments</h1>
				<div class="comments-container">
					<div class="input-comment-box", id="inputCommentBox"></div>
					<div class="display-comments-container", id="display-comments-container">
						<h2 id="default-comments-display">Loading...</h2>
					</div>
				</div>
			</div>
			<div class="additional-information-container">
					<h1>Recommended Artists</h1>
					<div class="recommended-artists-container", id="recommended-artists-container">
						<p>Select a tag to get recommendations</p>
					</div>
			</div>
        </div>`;
    mainContent.appendChild(recDetailsHTML);

    entityDetailCountsGet(musicbrainzid);

	const songTagsContainer = document.getElementById("song-tags-container");
    if (tagsObject !== undefined){

        Object.values(tagsObject).forEach((value) => {
            let tagDiv = document.createElement("div");
            tagDiv.className = "song-tag";
            tagDiv.textContent = value.name;

            tagStates[tagDiv.textContent] = false; //populate tagStates, initalize tag states as false
            //load or unload recommendations based on tags are marked as selected in tagStates
            tagDiv.addEventListener("click", () => {
                tagStates[tagDiv.textContent] = !tagStates[tagDiv.textContent];

                if (tagStates[tagDiv.textContent]) {
                    tagDiv.style.backgroundColor = "#068fff"; //TODO: choose a color scheme to use
                    
                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    apiRequestRecommendatons("recording", trueTagsQuery);
                }
                else {
                    tagDiv.style.backgroundColor = "rgb(61, 61, 61)";

                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    if (trueTagsQuery !== "") {
                        apiRequestRecommendatons("recording", trueTagsQuery);
                    }
                    else {
                        const recTracksContainer = document.getElementById("recommended-tracks-container");
                        recTracksContainer.innerHTML = "<p>Select a tag to get recommendations</p>";
                    }
                }
            });
            songTagsContainer.appendChild(tagDiv);
        });

    }
    else {
        let tagDiv = document.createElement("div");
        tagDiv.textContent = "NO TAGS";
        songTagsContainer.appendChild(tagDiv);
    }
    const favoritesContainer = document.getElementById("favorites");
        auth.onAuthStateChanged((user) => { 
            if(user) {		
                let favSpan = document.createElement("div");
                favSpan.innerHTML = 'Favorite <span class="favorite" id="favorite">★</span>'
                favoritesContainer.appendChild(favSpan);
                favoriteEntity(musicbrainzid, user.uid, coverArtUrl, data.title, type);
            }
        });
}

export function getRecommendedSongs(data) {

    const recommendedTracksContainer = document.getElementById("recommended-tracks-container")
    recommendedTracksContainer.innerHTML = ""; //empty container to load new recommendations
    data.recordings.forEach(recording => {			
        let songTitle = recording.title
        let release = recording.releases[0].title;
        let artist = recording['artist-credit'][0].name;
        let recordingURL = `entitydetails.html?recordingID=${recording.id}`;

        let coverArtUrl = `https://coverartarchive.org/release/${recording.releases?.[0]?.id}/front`;
        let noCover = '../vinyl.png';

        //create html to render a recommended track
        let trackContainer = document.createElement("div");
        trackContainer.class = "recommended-track";
        trackContainer.innerHTML = `
            <a style="text-decoration: none; color: #ffffff" href="${recordingURL}">
                <img class="recommended-cover" src="${coverArtUrl}" alt="Recommended Song Cover" onerror="this.src='${noCover}';">
                <h2 class="recommended-song-album">${songTitle} - ${release}</h2>
                <h3 class="recommended-artist-album-detial">${artist}</h3>
            </a>
        `
        recommendedTracksContainer.appendChild(trackContainer);
    });

}

/*
TODO: there is a bug here, it seems encodeURIComponent is not working as expected
    reproduce:
        1. url is entitydetails.html?recordingID=54da7b70-1715-44fb-8936-5d2308f89efe
        2. click on "dance pop" tag
        3. Song "Pop Pop Pop Pop" in album "Time to Rock da Show" has no tags but is displayed
*/
//examine tagStates Object, construct query from the ones that are selected/true
