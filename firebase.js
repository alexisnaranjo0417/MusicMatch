import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js"
import { getDatabase, ref, push, set, query, update, limitToLast, limitToFirst, onValue, increment, get, child, orderByChild, equalTo, startAt, endAt } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js"
import { getAuth, setPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"

const appSettings = {
    databaseURL: "https://fir-auth-a9cfa-default-rtdb.firebaseio.com/",
    apiKey: "AIzaSyC4TNMeTZcs36TXvrpWKDQ30X6teBvx_w4",
    authDomain: "fir-auth-a9cfa.firebaseapp.com",
    projectId: "fir-auth-a9cfa",
    storageBucket: "fir-auth-a9cfa.firebasestorage.app",
    messagingSenderId: "794778571204",
    appId: "1:794778571204:web:7c1e95e57d9566a9839491",
    measurementId: "G-KDTYLE4946"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
export const auth = getAuth(app);
const searchesInDB = ref(database, "searches")
const entitiesInDB = ref(database, "entities")
const commentsInDB = ref(database, "comments")
const favoritesInDB = ref(database, "favorites")
const usersInDB = ref(database, "users")

export async function viewCounts(entityID)
{
    let views = await entityCountsGet(entityID);
    return views;
}

async function entityCountsGet(entityID)
{    
    return get(child(entitiesInDB, entityID)).then((snapshot) => {
        if(snapshot.exists()) {       
            const result = getCounts(snapshot.val());
            return result;
        }
        else {
            const result2 = "Views: 0 Favorites: 0 Comments: 0";
            return result2;
        }
    }, {
        onlyOnce: true
    }).catch((error) => {
        console.error(error);
    });
}

function getCounts(data)
{ 
    let info = `Views: ${data.views} Favorites: ${data.favorites} Comments: ${data.comments}`;
    return info;
}

export async function entityDetailCountsGet(entityID)
{ 
    var find = query(ref(database, '/entities/' + entityID));
		
	onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if(data.length == 0) {
            document.getElementById("counts").innerHTML = '';
            var countsSection = document.getElementById("counts");
            let counts = document.createElement("div");
            counts.innerHTML = "Views: 0 Favorites: 0 Comments: 0";
            countsSection.appendChild(counts);
        }
        else {
		    getDetailCounts(data);
        }
    })
}

function getDetailCounts(data)
{  
    document.getElementById("counts").innerHTML = '';
    document.getElementById("counts").innerHTML = `Views: ${data.views} Favorites: ${data.favorites} Comments: ${data.comments}`;
}

export function entityCountsSet(entityID)
{
    var find = query(ref(database, '/entities/' + entityID));
    
    onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if (data.length == 0) {
            set(ref(database, 'entities/' + entityID), {
                "views": 1,
                "favorites": 0,
                "comments": 0
            });
        }
        else { 
            const updates = {};           
            updates[`${entityID}/views`] = increment(1);          
            update(entitiesInDB, updates);
        }        
    }, {
        onlyOnce: true
    });    
}

export function recentSearches()
{    
    var recentSearch = query(ref(database, '/searches'), limitToLast(10));
    onValue(recentSearch, (snapshot) => {
        const data = snapshot.val();
        updateSearchView(data);      
    })
}

function updateSearchView(data)
{  
    var elem = document.getElementById("search-button");
    console.log(elem);
    document.getElementById("searches").innerHTML = '';  
    Object.keys(data).forEach(function (key) {	
        var searchSection = document.getElementById("searches");
        let listItem = document.createElement("li");
        //do not recommend inserting a linebreak on the innerhtml of listItem, can introduce newline and tab chars to text of button. This text is later refernced to update URL.
        listItem.innerHTML = `<button id="searchBtn" style="cursor: pointer; color: white; font-size: 12pt; font-weight: bold; background-color: rgb(61, 61, 61); border: 2px solid white; border-radius: 12px; padding 9px; margin: 5px;">${data[key].name}<span style="display: none;">,${data[key].type}</span></button>`; 
        listItem.className = 'searchItem';  
        searchSection.prepend(listItem);
    });

    document.querySelectorAll('li.searchItem').forEach(occurence => {
        occurence.addEventListener('click', (e) => {
            var terms = e.target.textContent;
            var arr = terms.split(",");
            document.searching.name.value = arr[0];
	        document.searching.type.value = arr[1];
            if (elem == null) {
                document.getElementById("searching").requestSubmit();
            }
            else {
                triggerEvent( elem, 'click');
            }
        });
    });
}

function triggerEvent (elem, event) {
    var clickEvent = new Event( event );
    elem.dispatchEvent( clickEvent );
}

export default function searchTermsSet(searchTerm, type)
{
    let info = ({
        "name": searchTerm,
        "type": type
    });
    push(searchesInDB, info);    
}


export async function addComment(comment, entityID, entityName, type) {
    let commentData = ({
        "comment": comment,
        "userID": auth.currentUser.uid,
        "userDisplayName": auth.currentUser.displayName || auth.currentUser.email,
        "userPhotoURL": auth.currentUser.photoURL,
        "Timestamp": Date(Date.now())
    });
    let userdata = ({
        "comment": comment,
        "Timestamp": Date(Date.now()),
        "entityID": entityID,
        "entityName": entityName,
        "type": type
    })
    push(ref(database, "/comments/" + entityID), commentData);
    push(ref(database, "/users/" + auth.currentUser.uid + "/comments/"), userdata);

    var find = query(ref(database, '/entities/' + entityID));

    onValue(find, (snapshot) => {
        const updates = {};           
        updates[`${entityID}/comments`] = increment(1);          
        update(entitiesInDB, updates);
    }, {
        onlyOnce: true
    });
}

export async function retrieveEntityComments(entityID) {
    // add ordering by timestamp to rules 
    //const comments = query(ref(database, "/comments/" + entityID), orderByChild("Timestamp"))
    const commentsRef = query(ref(database, "/comments/" + entityID))
    return get(commentsRef)
    .then((snapshot) => {
        if(snapshot.exists()) {
            return Object.entries(snapshot.val()).map(([ id, data ]) => ({
                "node": id,
                "Timestamp": data.Timestamp,
                "comment": data.comment,
                "userDisplayName": data.userDisplayName,
                "userID": data.userID,
                "userPhotoURL": data.userPhotoURL
              }));
        }
        else {
            console.log("No comments for entity:", entityID);
            return null;
        }
    }, {
        onlyOnce: true
    }).catch((error) => {
        console.error(error);
        return null;
    });  
}

export async function retrieveUserComments() {
    if(auth.currentUser) {
        const userRef = query(ref(database, "/users/" + auth.currentUser.uid + "/comments/"))
        return get(userRef)
        .then((snapshot) => {
            if(snapshot.exists()){
                let recentComments =Object.entries(snapshot.val())
                    .map(([ id, data ]) => ({
                        "Timestamp": data.Timestamp,
                        "comment": data.comment,
                        "entityID": data.entityID,
                        "entityName": data.entityName,
                        "type": data.type
                    }))
                    .sort((a, b) => b.Timestamp - a.Timestamp)
                    .slice(0, 5);
                    return recentComments;
            }
            else {
                console.log("No comments for", auth.currentUser.userDisplayName)
                return null;
            }
        })
        .catch((error) => {
            console.log(error);
            return null;
        })
    }
}

export async function findFavorite(entityID, userID)
{
    let favorited = await isFavorited(entityID, userID);
    return favorited;
}

async function isFavorited(eid, uid)
{
    let id = uid + eid;
    return get(child(favoritesInDB, id)).then((snapshot) => {
        if(snapshot.exists()) {
            console.log("Exists!");
            return true;            
        }
        else {
            return false;
        }
    }, {
        onlyOnce: true
    }).catch((error) => {
        console.error(error);
    });
}

export function favoritesCountSet(entityID)
{
    var find = query(ref(database, '/entities/' + entityID));

    onValue(find, (snapshot) => {
        //let data = snapshot.val() === null ? [] : snapshot.val();
        const updates = {};           
        updates[`${entityID}/favorites`] = increment(1);          
        update(entitiesInDB, updates);
    }, {
        onlyOnce: true
    });
}

export function favoritesCountRemove(entityID)
{
    var find = query(ref(database, '/entities/' + entityID));

    onValue(find, (snapshot) => {
        //let data = snapshot.val() === null ? [] : snapshot.val();
        const updates = {};           
        updates[`${entityID}/favorites`] = increment(-1);          
        update(entitiesInDB, updates);
    }, {
        onlyOnce: true
    });
}

export function userFavorite(entityID, uid, imageURL, name, type)
{
    set(ref(database, 'favorites/' + uid + entityID), {
        "entityID": entityID,
        "userID": uid,
        "imageURL": imageURL,
        "name": name,
        "type": type,
        "entityTimestamp": uid + Date.now(),
    });
}

export function userUnfavorite(eid, uid)
{
    let id = uid + eid;
    var eref = ref(database, 'favorites/' + id);
    return set(eref, {
        "entityID": null,
        "userID": null,
        "imageURL": null,
        "name": null,
        "type": null,
        "entityTimestamp": null,
    });
}

export function displayFavorites(userID)
{   
    console.log(userID); 
    var favs = query(ref(database, '/favorites'), orderByChild("entityTimestamp"), startAt(userID), endAt(userID+"\uf8ff"), limitToLast(8));
	onValue(favs, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if(data.length == 0) {
            document.getElementById("faves").innerHTML = '';
            document.getElementById("faves").innerHTML = 'No Favorites Chosen';
        }
        else {
		    updateFavorites(data);
        }     
    })
}

function updateFavorites(data)
{
    document.getElementById("faves").innerHTML = '';  
    Object.keys(data).forEach(function (key) {	
        let image = data[key].imageURL;
        let eid = data[key].entityID;        
        let type = "";
        if (data[key].type == "Artist") {
            type = "artist";
        }
        else if (data[key].type == "Song") {
            type = "recording";
        }
        else {
            type = "album";
        }
        let noCover = '../vinyl.png';
        var favoritesSection = document.getElementById("faves");
        let listItem = document.createElement("li");
        listItem.innerHTML =
            `<a href="../pages/entitydetails.html?${type}ID=${eid}"><img class="fave-art-img" src="${image}" alt="Recommended Song Cover" onerror="this.src='${noCover}'">
             <p>${data[key].name}</p><p>${data[key].type}</p></a>`; 
        listItem.className = 'favItem';  
        favoritesSection.append(listItem);
    });
}

export function setUserData(userID, name, email, imageUrl)
{   
    let bannerURL =  "../placeholders/crowd.jpg";
    let bio = "Welcome to MusicMatch!"
    const userRef = ref(database, 'users/' + userID);
    
    return set(userRef, {
        "username": name,
        "email": email,
        "profile_picture": imageUrl,
        "bio": bio,
        "bannerURL": bannerURL,
    });
}

export function editProfile(userID)
{
    document.getElementById("change-image-button").addEventListener("click", function(){
        var imgSrc = prompt("Enter the URL for your new profile image:", "");
        
        if (imgSrc != null) {
            console.log(auth.currentUser.photoURL);
            const updates = {};           
            updates[`${userID}/profile_picture`] = imgSrc;	
            update(usersInDB, updates);

            updateProfile(auth.currentUser, { photoURL: imgSrc });

            displayProfilePic(userID);
        }
    });

    document.getElementById("change-bio-button").addEventListener("click", function(){
        var find = query(ref(database, '/users/' + userID));
        onValue(find, (snapshot) => {
            var text = "";
            let data = snapshot.val();
            text = data.bio;  
            var bioInfo = prompt("Edit your biography details:", text);
        
            if (bioInfo != null) {
                const updates = {};           
                updates[`${userID}/bio`] = bioInfo;	
                update(usersInDB, updates);

                displayBio(userID);
            }          
        })
    });

    document.getElementById("change-banner-button").addEventListener("click", function(){
        var bannerInfo = prompt("Enter the URL for your banner: ", "");
        
        if (bannerInfo != null) {
            const updates = {};           
            updates[`${userID}/bannerURL`] = bannerInfo;	
            update(usersInDB, updates);

            displayBanner(userID);
        }
    });
}

export function displayBio(userID)
{
    document.getElementById("bio-data").innerHTML = '';
    var find = query(ref(database, '/users/' + userID));
    onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if(data == 0) {            
            console.log("No bio exists");
            document.getElementById("bio-data").innerHTML = "No user biography exists.";           
        }
        else {
            console.log("bio exists");
            document.getElementById("bio-data").innerHTML = `<h1>${data.username} Biography</h1><p>${data.bio}</p>`;
        }
    })

}

export function displayBanner(userID)
{
    var find = query(ref(database, '/users/' + userID));
    onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if(data == 0) {            
            console.log("No banner data exists");
        }            
        else {
            console.log("Banner exists");
            document.getElementById('banner-content').style.backgroundImage = `url(${data.bannerURL})`;
        }
    })
}

export function displayProfilePic(userID)
{
    var find = query(ref(database, '/users/' + userID));
    onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        if(data == 0) {            
            console.log("No profile photo exists");
        }            
        else {
            document.getElementById("profile-src").innerHTML = `<img src="${data.profile_picture}" alt="../placeholders/user.jpg" id="profile-src"/>`;
        }
    })    
}

export async function displayUserComments() {
    let displayComments = document.getElementById("display-comments-container");
    let userComments = await retrieveUserComments();
    let noCommentText = document.getElementById("default-comments-display");
     const formatter = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if(userComments !== null) {
        noCommentText.remove();

        userComments.forEach(item => {
            let comment = document.createElement("div");
            let parsedDate = new Date(item.Timestamp);
            let formattedTime = formatter.format(parsedDate);

            comment.innerHTML = `
                <div class="comment-userdisplay">
                    <div>${item.entityName}, ${item.type}: ${formattedTime}</div>
                </div>
                <div class="comment-text">
                    <p>${item.comment}</p>
                </div>`;
            
            displayComments.prepend(comment);
        });
    }
    else {
        noCommentText.innerHTML = "No comments to display";
    }
}

export async function displayUserInfo(userID) 
{
    const userInfoRef = query(ref(database, "/users/" + userID))
    return get(userInfoRef)
    .then((snapshot) => {
        if(snapshot.exists()) {
            var data = snapshot.val();
            console.log(data.profile_picture);
            return data;
        }
        else {
            console.log("No userdata found");
            return null;
        }
    }, {
        onlyOnce: true
    }).catch((error) => {
        console.error(error);
        return null;
    }); 
}
