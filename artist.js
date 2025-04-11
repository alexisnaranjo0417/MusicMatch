import { getTagsOrdered, tagsToString } from "./helpers.js";
import searchTermsSet, {viewCounts} from "./firebase.js"

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
		`<a style="text-decoration: none; color: #ffffff" href="${detailsURL}"><div class="results">
  		 <img class="cover" src="${imageURL}" alt="Artist Image" onerror="this.src='${noCover}';">
			<div class="wholeDetails">
				<div class="nameDetails">
					<div class="name">Artist: ${data.name} ${musicbrainzid}</div>
					<div class="details">
						<div class="country"> Country: ${data.country} </div>
						<div class="type"> Type: ${data.type} </div>
					</div>
				</div>
			</div>
			<div class="rest">
				<div class="tags">Tags: ${tagsList} </div>
				<div class="userNum"> ${counts} </div>
			</div>
		</div></a>`;
	
	results.appendChild(itemdetails);
}

export async function generateArtDetailsHTML(data) {
	let tagsObject = getTagsOrdered(data);
	let tagsList = tagsToString(tagsObject);
	
	let mainContent = document.getElementById("main-content");
	let artDetailsHTML = document.createElement("div");

	var musicbrainzid = data.id;
	let counts = await viewCounts(musicbrainzid);
	let imageURL = await getArtistImage(musicbrainzid);	
	let noCover = '../vinyl.png';
	
	artDetailsHTML.innerHTML = `<img class="cover" src="${imageURL}" alt="Artist Image" onerror="this.src='${noCover}';">
					<div>
						<div>
							<div>Artist: ${data.name}</div>
							<div>
								<div> Country: ${data.country} </div>
								<div> Type: ${data.type} </div>
							</div>
						</div>
					</div>
					<div>
						<div>Tags: ${tagsList} </div>
						<div> ${counts} </div>
					</div>`;
	
	mainContent.appendChild(artDetailsHTML); 
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
