import searchTermsSet, { auth, viewCounts, entityDetailCountsGet} from "./firebase.js"
import { getTagsOrdered, tagsToString, getTrueTagsQuery } from "./helpers.js";
import { apiRequestRecommendatons } from "./apiRequest.js";
import favoriteEntity from "./favorites.js";

//function used for to display search results, relevant js is functionsAll.js apiRequest.js
export default async function displayResultsAlb(data)
{
	//get tags of a search result item in decending order
	let tagsObject = getTagsOrdered(data); //object holding series of tags properties
	let tagsList = tagsToString(tagsObject);

	//make div that will eventually contain results called itemdetails
	let results = document.getElementById("results-container");
	let itemdetails = document.createElement("div");

	var musicbrainzid = data.id;
	let detailsURL = 'entitydetails.html?albumID=' + encodeURIComponent(musicbrainzid);
	let counts = await viewCounts(musicbrainzid);

	let coverArtUrl = `https://coverartarchive.org/release-group/${musicbrainzid}/front`;
	let noCover = '../vinyl.png';
	
	/*
	using xpath notation to refer to elements
		//a : makes entire div clickable
	*/
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
			<img class="cover" src="${coverArtUrl}" alt="Album Cover" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Album: ${data.title}</div>
					<div class="artist">Artist: ${data['artist-credit'][0].name} </div>
					<div class="date">Release Date: ${data['first-release-date']} </div>
				</div>
				<div class="tagsContainer">
					<div class="tags">Tags: ${tagsList} </div>
				</div>
				<div class="rest">
					<div class="userNum">${counts}</div>
				</div>
			</div>
		</div>
		</a>`;
	
	results.appendChild(itemdetails);
}

//function used to generate entity deails, relevant js is onEntityLoad.js, apiRequest.js
export function generateAlbDetailsHTML(releaseGroupData, releaseData)
{
	let tagsObject = getTagsOrdered(releaseGroupData);
	const tagStates = {}; 
	let type = "Album";
	
	//get track list
    let tracks = '';
    var trackItems = releaseData['media'][0].tracks;
    trackItems.forEach(function(obj) {
		let trackURL = `entitydetails.html?recordingID=${encodeURIComponent(obj.recording.id)}`;
		tracks += `<br><div class = "trackLinks"><a href="${trackURL}" style="text-decoration: none; color: white;">${obj.title}</a></div>`;
	});

	let mainContent = document.getElementById("main-content");
    let albDetailsHTML = document.createElement("div");
	var musicbrainzid = releaseGroupData.id;

    let coverArtUrl = `https://coverartarchive.org/release-group/${musicbrainzid}/front`;
	let noCover = '../vinyl.png';

	let artistID = releaseGroupData['artist-credit'][0].artist.id;
    let artistURL = `entitydetails.html?artistID=${encodeURIComponent(artistID)}`;

    albDetailsHTML.innerHTML = `<style>
		.us-alb-cover-tags {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto;
			margin: 20px;
		}

		.alb-coverart {
			display: flex;
			max-width: 50%;
			justify-self: center;
    		border: 10px rgb(78, 79, 235) solid;
		}

		.alb-tags {
			display: flex;
			margin: 20px;
			font-size: 20px;
		}

		.alb-tags-container {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin: 20px;
			height: 50px;
		}

		.alb-tag {
			font-size: 12pt;
			font-weight: bold;
			background-color: rgb(61, 61, 61);
			border: 2px solid white;
			border-radius: 12px;
			padding: 9px;
			margin: 5px;
			
		}

		.ls-albDetailsTracks-recs {
			display: flex;
			flex-direction: column;
			margin: 20px;
		}

		.alb-details{
			justify-content: center;
			display: flex;
			flex-direction: row;
			font-size: 20pt;
		}

		.alb-tracks{
			font-size: 15pt;
		}

		#tracks{
			font-weight: bold;
			color: white;
			text-decoration: none;
		}

		.trackLinks {
			color: white;
			background-color: rgb(78, 79, 235);
			display: inline-block;
			margin: 5px;
			padding: 9px;
		}

		</style>
		<div class="us-alb-cover-tags">
			<img class="alb-coverart" src="${coverArtUrl}" alt="Song Cover" onerror="this.src='${noCover}';">
			<div class="alb-tags-container", id="alb-tags-container">
                <h1 class="alb-tags-title">Song Tags</h1>
  	       </div>
		</div>

		<div class="ls-albDetailsTracks-recs">
			<div class="alb-details-tracks">
				<div class="alb-details"> 
					<div id="entity-name" style="margin: 20px;">${releaseGroupData.title}</div>
					<div style="margin-top: 20px; margin-bottom: 20px;"> - </div>
					<a style="text-decoration: none; color: #ffffff; margin: 20px" href=${artistURL}>
						<div class="artist-name"> ${releaseGroupData['artist-credit'][0].artist.name} </div>
					</a>
					<div style="margin:20px;" id="counts"></div>
				</div>
				<div id="favorites" style="font-size: 30px;"></div>
				<div class="alb-tracks">
					<div class="date">Release Date: ${releaseGroupData['first-release-date']} </div>
					<div class="tracks">Track Count: ${releaseData['media'][0]['track-count']} </div>
					<p>Tracks: <span id = "tracks">${tracks}</span></p>
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
	
	mainContent.appendChild(albDetailsHTML);

	entityDetailCountsGet(musicbrainzid);

	//TODO: USE BETTER VARIABLE NAMES, songtagscontainer is not an accurate name here
	const songTagsContainer = document.getElementById("alb-tags-container");
    if (tagsObject !== undefined){

        Object.values(tagsObject).forEach((value) => {
            let tagDiv = document.createElement("div");
            tagDiv.className = "alb-tag";
            tagDiv.textContent = value.name;

            tagStates[tagDiv.textContent] = false; //populate tagStates, initalize tag states as false
            //load or unload recommendations based on tags are marked as selected in tagStates
            tagDiv.addEventListener("click", () => {
                tagStates[tagDiv.textContent] = !tagStates[tagDiv.textContent];

                if (tagStates[tagDiv.textContent]) {
                    tagDiv.style.backgroundColor = "#068fff"; //TODO: choose a color scheme to use
                    
                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    apiRequestRecommendatons("release-group", trueTagsQuery);
                }
                else {
                    tagDiv.style.backgroundColor = "rgb(61, 61, 61)";

                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    if (trueTagsQuery !== "") {
                        apiRequestRecommendatons("release-group", trueTagsQuery);
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
                favoriteEntity(musicbrainzid, user.uid, coverArtUrl, releaseGroupData.title, type);
            }
        });
}

export function getRecommendedAlbums(data) {

    const recommendedTracksContainer = document.getElementById("recommended-tracks-container")
    recommendedTracksContainer.innerHTML = ""; //empty container to load new recommendations
    data['release-groups'].forEach(releaseGroupData => {			
        let albumTitle = releaseGroupData.title
        let artist = releaseGroupData['artist-credit'][0].name;
        let albumURL = `entitydetails.html?albumID=${releaseGroupData.id}`;

        let coverArtUrl = `https://coverartarchive.org/release-group/${releaseGroupData.id}/front`;
        let noCover = '../vinyl.png';

        //create html to render a recommended track
        let trackContainer = document.createElement("div");
        trackContainer.class = "recommended-track";
        trackContainer.innerHTML = `
            <a style="text-decoration: none; color: #ffffff" href="${albumURL}">
                <img class="recommended-cover" src="${coverArtUrl}" alt="Recommended Song Cover" onerror="this.src='${noCover}';">
                <h2 class="recommended-album">$${albumTitle}</h2>
                <h3 class="recommended-artist-album-detial">${artist}</h3>
            </a>
        `
        recommendedTracksContainer.appendChild(trackContainer);
    });

}
