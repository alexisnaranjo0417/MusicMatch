import { findFavorite, favoritesCountSet, favoritesCountRemove, userFavorite, userUnfavorite } from "./firebase.js";

export default async function favoriteEntity(entityID, userID, imageURL, name, type)
{
    var clicked = await findFavorite(entityID, userID);
    let star = document.getElementById('favorite');
    if(clicked){
        star.style.color = "gold";
    }   
        
    star.addEventListener('click',  () => {        
        if(!clicked){
            clicked = true;
            star.style.color = "gold";
            favoritesCountSet(entityID);
            userFavorite(entityID, userID, imageURL, name, type);
        }
        else{
            clicked = false;
            star.style.color = "lightgray";
            favoritesCountRemove(entityID);
            userUnfavorite(entityID, userID);
        }
    });   
}
