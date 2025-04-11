import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, set, query, update, limitToLast, onValue, increment, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://music-match-3d105-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const searchesInDB = ref(database, "searches")
const entitiesInDB = ref(database, "entities")

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

export function entityCountsSet(entityID)
{
    var find = query(ref(database, '/entities/' + entityID));
    
    onValue(find, (snapshot) => {
        let data = snapshot.val() === null ? [] : snapshot.val();
        
        console.log(data);
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
    document.getElementById("searches").innerHTML = '';  
    Object.keys(data).forEach(function (key) {	
        var searchSection = document.getElementById("searches");
        let listItem = document.createElement("li");	
        listItem.innerHTML = 
            `<a href="">${data[key].name}</a>`;
        searchSection.prepend(listItem);
    });
}

export default function searchTermsSet(searchTerm, type)
{
    let info = ({
        "name": searchTerm,
        "type": type
    });
    push(searchesInDB, info);    
}