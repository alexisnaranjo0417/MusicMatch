import searchTermsSet, {viewCounts} from "./firebase.js"
import { getTagsOrdered, tagsToString, getTrueTagsQuery } from "./helpers.js";
import { apiRequestRecommendatons } from "./apiRequest.js";

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
		`<a style="text-decoration: none; color: #ffffff" href="${detailsURL}"><div class="results">
			<img class="cover" src="${coverArtUrl}" alt="Album Cover" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Album: ${data.title} ${musicbrainzid}</div>
					<div class="details">
						<div class="artist">Artist: ${data['artist-credit'][0].name} </div>
						<div class="date">Release Date: ${data['first-release-date']} </div>
					</div>
				</div>
				<div class="rest">
					<div class="tags">Tags: ${tagsList}</div>
					<div class="userNum">${counts}</div>
				</div>
			</div>
		</div></a>`;
	
	results.appendChild(itemdetails);
}

//function used to generate entity deails, relevant js is onEntityLoad.js, apiRequest.js
export function generateAlbDetailsHTML(releaseGroupData, releaseData)
{
	let tagsObject = getTagsOrdered(releaseGroupData);
	const tagStates = {}; 
	
	//get track list
    let tracks = '';
    var trackItems = releaseData['media'][0].tracks;
    trackItems.forEach(function(obj) {
		let trackURL = `entitydetails.html?recordingID=${encodeURIComponent(obj.recording.id)}`;
		tracks += `<br><a href="${trackURL}" style="text-decoration: none; color: rgb(78, 79, 235);">${obj.title}</a>`;
	});

	let mainContent = document.getElementById("main-content");
    let albDetailsHTML = document.createElement("div");
	var musicbrainzid = releaseGroupData.id;

    let coverArtUrl = `https://coverartarchive.org/release-group/${musicbrainzid}/front`;
	let noCover = '../vinyl.png';

	let artistID = releaseGroupData['artist-credit'][0].artist.id;
    let artistURL = `entitydetails.html?artistID=${encodeURIComponent(artistID)}`;

	/*
    albDetailsHTML.innerHTML = 
		`<div class="results">
			<img class="cover" src="${coverArtUrl}" alt="Song Cover" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Album: ${releaseGroupData.title} </div>
					<div class="details">
						<div class="artist-name">Artist: <a href="${artistURL}" style="text-decoration: none; color: ;">
                            ${releaseGroupData['artist-credit'][0].name}
                        </a></div>
						<div class="date">Release Date: ${releaseGroupData['first-release-date']} </div>
						<div class="tracks">Track Count: ${releaseData['media'][0]['track-count']} </div>
                        <p>Tracks: ${tracks}</p>
					</div>
				</div>
				<div class="rest">
					<div class="tags">Tags: ${tagsList}</div>
					<div class="userNum">Views Comments Favorites</div>
				</div>
			</div>
		</div></a>`;
	*/

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
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto;
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
					<div style="margin: 20px;"> ${releaseGroupData.title} </div>
					<div style="margin-top: 20px; margin-bottom: 20px;"> - </div>
					<a style="text-decoration: none; color: #ffffff; margin: 20px" href=${artistURL}>
						<div class="artist-name"> ${releaseGroupData['artist-credit'][0].artist.name} </div>
					</a>
				</div>
				<div class="alb-tracks">
					<div class="date">Release Date: ${releaseGroupData['first-release-date']} </div>
					<div class="tracks">Track Count: ${releaseData['media'][0]['track-count']} </div>
					<p>Tracks: ${tracks}</p>
				</div>
			</div>
			<div class="additional-information-container">
				<h1>Recommended Albums</h1>
				<div class="recommended-tracks-container", id="recommended-tracks-container">
					<p>Select a tag to get recommendations</p>
				</div>
			</div>
		</div>
		`;
	
	mainContent.appendChild(albDetailsHTML);

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