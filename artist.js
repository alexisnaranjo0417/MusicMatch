import { getTagsOrdered, tagsToString, getTrueTagsQuery } from "./helpers.js";
import searchTermsSet, {viewCounts, entityDetailCountsGet, auth } from "./firebase.js"
import { apiRequestRecommendatons } from "./apiRequest.js";
import favoriteEntity from "./favorites.js";

//function used for to display search results, relevant js is functionsAll.js apiRequest.js
export default async function displayResultsArt(data)
{	
	let tagsObject = getTagsOrdered(data);
	let tagsList = tagsToString(tagsObject);
	
	let results = document.getElementById("results-container");
	let itemdetails = document.createElement("div");

	var musicbrainzid = data.id;
	let detailsURL = 'entitydetails.html?artistID=' + encodeURIComponent(musicbrainzid);
	let counts = await viewCounts(musicbrainzid);

	let imageURL = await getArtistImage(musicbrainzid);	
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
		<a style="text-decoration: none; color: #ffffff" href="${detailsURL}">
		<div class="results">
  		 <img class="cover" src="${imageURL}" alt="Artist Image" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Artist: ${data.name}</div>
					<div class="country"> Country: ${data.country} </div>
					<div class="type"> Type: ${data.type} </div>
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

export async function generateArtDetailsHTML(data) {
	let tagsObject = getTagsOrdered(data);
	const tagStates = {}; //keep track if tag is selected or not, key is tag name & value is boolean
	let type = "Artist";
	
	let mainContent = document.getElementById("main-content");
	let artDetailsHTML = document.createElement("div");

	var musicbrainzid = data.id;
	let imageURL = await getArtistImage(musicbrainzid);		
	let noCover = '../vinyl.png';

	artDetailsHTML.innerHTML = `<style>
		.us-art-cover-tags {
			display: grid;
			grid-template-columns: 2fr 1fr;
			grid-template-rows: auto;
			margin: 20px;
		}

		.art-coverart {
			display: flex;
			max-width: 100%;
			justify-self: center;
    		border: 10px rgb(78, 79, 235) solid;
		}

		.alb-tags {
			display: flex;
			margin: 20px;
			font-size: 20px;
		}

		.art-tags-container {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin: 20px;
			height: 50px;
		}

		.art-tag {
			font-size: 12pt;
			font-weight: bold;
			background-color: rgb(61, 61, 61);
			border: 2px solid white;
			border-radius: 12px;
			padding: 9px;
			margin: 5px;
			
		}

		.ls-artDetailsListings-recs {
			display: grid;
			grid-template-columns: 2fr 1fr;
			grid-template-rows: auto;
			margin: 20px;
		}

		.art-details{
			justify-content: center;
			justify-self: center;
			display: flex;
			flex-direction: column;
			font-size: 20pt;
		}
		
		.art-stats{
			display: flex;
			flex-direction: row;
		}

		.alb-tracks{
			font-size: 15pt;
		}

		</style>
		<div class="us-art-cover-tags">
			<img class="art-coverart" src="${imageURL}" alt="Song Cover" onerror="this.src='${noCover}';">
			<div class="art-tags-container", id="art-tags-container">
                <h1 class="art-tags-title">Song Tags</h1>
  	       </div>
		</div>

		<div class="ls-artDetailsListings-recs">
			<div class="art-details-listings">
				<div class="art-details"> 
					<div id="entity-name" style="margin: 20px;">${data.name}</div>
     					<div id="favorites"></div>
					<div class="art-stats">
						<div style="margin: 20px;"> Country: ${data.country} </div>
						<div style="margin: 20px;"> Type: ${data.type} </div>
						<div style="margin: 20px;" id="counts"></div>
					</div>
				</div>
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
		</div>
		`;
	
	mainContent.appendChild(artDetailsHTML); 

	entityDetailCountsGet(musicbrainzid);

	const songTagsContainer = document.getElementById("art-tags-container");
    if (tagsObject !== undefined){

        Object.values(tagsObject).forEach((value) => {
            let tagDiv = document.createElement("div");
            tagDiv.className = "art-tag";
            tagDiv.textContent = value.name;

            tagStates[tagDiv.textContent] = false; //populate tagStates, initalize tag states as false
            //load or unload recommendations based on tags are marked as selected in tagStates
            tagDiv.addEventListener("click", () => {
                tagStates[tagDiv.textContent] = !tagStates[tagDiv.textContent];

                if (tagStates[tagDiv.textContent]) {
                    tagDiv.style.backgroundColor = "#068fff"; //TODO: choose a color scheme to use
                    
                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    apiRequestRecommendatons("artist", trueTagsQuery);
                }
                else {
                    tagDiv.style.backgroundColor = "rgb(61, 61, 61)";

                    let trueTagsQuery = getTrueTagsQuery(tagStates);
                    if (trueTagsQuery !== "") {
                        apiRequestRecommendatons("artist", trueTagsQuery);
                    }
                    else {
                        const recTracksContainer = document.getElementById("recommended-artists-container");
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
			favoriteEntity(musicbrainzid, user.uid, imageURL, data.name, type);
		}
	});
}

export async function getRecommendedArtists(data) {

    const recommendedTracksContainer = document.getElementById("recommended-artists-container")
    recommendedTracksContainer.innerHTML = ""; //empty container to load new recommendations
	//TODO: this loop needs be made async to get artist images
	/*
    data.artists.forEach(artistData => {			
        let artistName = artistData.name
        let artistURL = `entitydetails.html?artistID=${artistData.id}`;

		let imageURL = getArtistImage(artistData.id);	
        let noCover = '../vinyl.png';

        //create html to render a recommended track
        let trackContainer = document.createElement("div");
        trackContainer.class = "recommended-track";
        trackContainer.innerHTML = `
            <a style="text-decoration: none; color: #ffffff" href="${artistURL}">
                <img class="recommended-cover" src="${imageURL}" alt="Recommended Song Cover" onerror="this.src='${noCover}';">
                <h2 class="recommended-artist">${artistName}</h2>
            </a>
        `
        recommendedTracksContainer.appendChild(trackContainer);
    });
	*/
	
	for (const artistData of data.artists) {
        let artistName = artistData.name
        let artistURL = `entitydetails.html?artistID=${artistData.id}`;

		let imageURL = await getArtistImage(artistData.id);	
        let noCover = '../vinyl.png';

        //create html to render a recommended track
        let trackContainer = document.createElement("div");
        trackContainer.class = "recommended-track";
        trackContainer.innerHTML = `
            <a style="text-decoration: none; color: #ffffff" href="${artistURL}">
                <img class="rec-art-img" src="${imageURL}" alt="Recommended Song Cover" onerror="this.src='${noCover}';">
                <h2 class="recommended-artist">${artistName}</h2>
            </a>
        `
        recommendedTracksContainer.appendChild(trackContainer);
	}
}

async function getArtistImage(id) {	

	let requestURL = 'https://webservice.fanart.tv/v3/music/' + id + '?api_key=b381cbafc36adba780de5c77c14595d6';
	
	return fetch(requestURL)
    	.then((response) => response.json())
    	.then((data) => {
        	const result = artistImage(data);
			console.log(result);
			return result;
    	})
}

function artistImage(data) {
	let imageURL = data.artistbackground[0].url;
	console.log(imageURL);
	return imageURL;
}
