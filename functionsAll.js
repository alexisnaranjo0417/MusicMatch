import apiRequestSearch from "./apiRequest.js"
import searchTermsSet, {recentSearches} from "./firebase.js"
import displayResultsAlb from "./album.js"
import displayResultsRec from "./recording.js"
import { encodeSpacesToPlus } from "./helpers.js"

const searchButton = document.getElementById("search-button")

document.addEventListener("DOMContentLoaded", function() {
	recentSearches();
	let params = getUrlParams();
	let name = params.get("name");
	let typeName = params.get("type");
	if(name && typeName)
	{
		document.getElementById("name").value = name;
		document.getElementById("type").value = typeName;
		triggerEvent( searchButton, 'click');
	}
});

function getUrlParams() {
	const params = new URLSearchParams(window.location.search);
	return params;
}
  
function triggerEvent (elem, event) {
    var clickEvent = new Event( event );
    elem.dispatchEvent( clickEvent );
}

searchButton.addEventListener("click", function(e){
	e.preventDefault();
	var output = document.getElementById("results-container");
	output.innerHTML = "<p>Results</p>";
	var name = document.searching.name.value;
	var typeName = document.searching.type.value;
	//for checking if searching values equal param values to determine if to history.pushState()
	var urlparams = getUrlParams();
	var urlParamName = urlparams.get("name");
	var urlParamType = urlparams.get("type");
			
	if(name.length>1 && name !== undefined) {
		console.log(name !== urlParamName || typeName !== urlParamType)
		if (name !== urlParamName || typeName !== urlParamType) {
			var newUrlParamName = encodeSpacesToPlus(name); //using different var to not overwrite name var which is saved to rtdb
			const currentPage = window.location.pathname;
			const newURL = `${currentPage}?name=${newUrlParamName}&type=${typeName}`;
			history.pushState({}, '', newURL); //update url without reloading
		}

		searchTermsSet(name, typeName);
		apiRequestSearch(typeName, name);		
	}	
	else {
		document.getElementById("results-container").innerHTML = "<p>Please enter a search term.</p>";
		console.log("Too short");
	}
});

window.addEventListener("popstate", function() {
	//reload page when forward or back button is pressed with updated urlparams. 
	//this triggers the first DOMContentLoaded event listener
	this.location.reload(); 
});

const filterButton = document.getElementById("filter-button")
if (filterButton != null){
	filterButton.addEventListener("click", function(e){
		e.preventDefault();
		var output = document.getElementById("results-container");
		output.innerHTML = "<p>Results</p>";
		var filterName = document.getElementById("filterText").value;
		var radioValue = document.querySelector("input[type='radio'][name='type']:checked").value;
		console.log(radioValue);	
		var name = document.searching.name.value;
		var typeName = document.searching.type.value;
		var requestUrl = '';
		console.log("typeName: " + typeName + " name: " + name + " radioValue: " + radioValue + " filterName: " + filterName);
	
		switch(radioValue)
		{
			case 'artist':
				if(typeName == 'recording' || typeName == 'release'){
					requestUrl = 'https://musicbrainz.org/ws/2/' + typeName + '/?query=title:' + name + ' AND artist-credit[0].name:' + filterName + '&inc=tags+user-ratings&limit=50&fmt=json';
				}							
				break;
			case 'recording':
				if(typeName == 'artist'){
					requestUrl = 'https://musicbrainz.org/ws/2/' + radioValue + '/?query=title:' + filterName + ' AND artist-credit[0].name:' + name + '&inc=tags+user-ratings&limit=50&fmt=json';
				}
				else if(typeName == 'release') {
					requestUrl = 'https://musicbrainz.org/ws/2/' + radioValue + '/?query=title:' + filterName + ' AND releases[0].title:' + name + '&inc=tags+user-ratings&limit=50&fmt=json';
				}												
				break;
			case 'release':
				if(typeName == 'recording'){
					requestUrl = 'https://musicbrainz.org/ws/2/' + typeName + '/?query=title:' + name + ' AND releases[0].title:' + filterName + '&inc=tags+user-ratings&limit=50&fmt=json';
				}
				else if(typeName == 'artist'){
					requestUrl = 'https://musicbrainz.org/ws/2/' + radioValue + '/?query=title:' + filterName + ' AND artist-credit[0].name:' + name + '&inc=tags+user-ratings&limit=50&fmt=json';
				}								
				break;
		}
	
		if (requestUrl != '')
		{
			fetch(requestUrl, {
				headers: {
					'User-Agent': 'MusicMatch/1.0 ( nesha.salazar5749@coyote.csusb.edu )',
				},
				})
				.then((response) => response.json())
				.then((data) => {
					if (typeName == "recording" || (typeName == "release" && radioValue == "recording"))
					{
						console.log(data.recordings);			
						data.recordings.forEach(item => {			
							displayResultsRec(item);
						});
					}
					else if((typeName == "artist" && radioValue == "release") || (typeName == "release" && radioValue == "artist"))
					{
						console.log(data.releases);			
						data.releases.forEach(item => {			
							displayResultsAlb(item);
						});
					}
					else if(typeName == "artist" && radioValue == "recording")
					{
						console.log(data.recordings);			
						data.recordings.forEach(item => {			
							displayResultsRec(item);
						});
					}
				})
				.catch((error) => {
					console.error(error);
				});
		}
		else
		{
			let div = document.createElement("div");
			div.innerText = "The result of an " + radioValue + " search cannot be filtered by " + radioValue;
			output.appendChild(div);
		}
	});
}
		
function clearForm() {
	document.getElementById("searching").reset();
}
