import apiRequestSearch from "./apiRequest.js"
import searchTermsSet, {recentSearches} from "./firebase.js"
import displayResultsAlb from "./album.js"
import displayResultsRec from "./recording.js"

document.addEventListener("DOMContentLoaded", function() {
	recentSearches();
	let params = getUrlParams();
	let name = params.get("name");
	let typeName = params.get("type");
	document.getElementById("name").value = name;
	document.getElementById("type").value = typeName;
	performUrlSearch();
});

function getUrlParams() {
	const params = new URLSearchParams(window.location.search);
	return params;
  }
  
  function performUrlSearch() {
	const params = getUrlParams();
	const name = params.get("name");
	const typeName = params.get("type");
  
	if (name && typeName) {
	  var output = document.getElementById("results-container");
	  output.innerHTML = "<p>Results</p>";
	  searchTermsSet(name, typeName);
	  apiRequestSearch(typeName, name);
	} else {
	  document.getElementById("results-container").innerHTML
	}
  }

const searchButton = document.getElementById("search-button")
searchButton.addEventListener("click", function(e){
	e.preventDefault();
	var output = document.getElementById("results-container");
	output.innerHTML = "<p>Results</p>";
	var name = document.searching.name.value;
	var typeName = document.searching.type.value;
			
	if(name.length>1) {
		searchTermsSet(name, typeName);
		apiRequestSearch(typeName, name);		
	}	
	else {
		//document.getElementById("displayWarning").innerHTML = "<p>Your search query: " + name + " is not long enough</p>";
		console.log("Too short");
	}
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

function displaySearches(data) {
	var output = document.getElementById("searches");
	let listItem = document.createElement("li");

	listItem.innerHTML = '<a href="">' + data.name + '</a>';			
	output.appendChild(listItem);
}
