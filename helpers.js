import { addComment, retrieveEntityComments, displayUserInfo } from "./firebase.js";
/*
gets tags from current entity (rec, alb, art), resulting object has properties,
    key is position starting from 0
    value is an object
        property 1: key is "name", value is tag name
        property 2: key is "count", value is number of votes for tag
*/
export function getTagsOrdered(data) {
	if (typeof data.tags !== 'undefined' && data.tags.length !== 0 ) //need to also deal with if data.tags is empty
	{
		var sorted = data.tags.sort(function(a,b) {return b.count-a.count});	//in deceding order of count value
        return sorted;
	}	
    else {
        return undefined;
    }
}

//extract tag names from the tagsObject property values into a string
export function tagsToString(tagsObject) {
    let tagsList = "";
    if (typeof tagsObject !== 'undefined') {
        tagsObject.forEach(function(obj) { tagsList += " | " + obj.name; });
    }
    else {
        tagsList = "NO TAGS";
    }
	return tagsList;
}

export function getTrueTagsQuery(tagStates) {
    let tagsQuery = "";
    let trueTags = [];

    Object.entries(tagStates).forEach(([tagName, tagBool]) => {
        if (tagBool === true) {
            trueTags.push(tagName);

            if (trueTags.length > 1) {
                tagsQuery += `+AND+tag:${encodeURIComponent(trueTags[trueTags.length - 1])}`;
            }
            else {
                tagsQuery = `tag:${encodeURIComponent(trueTags[0])}`;
            }
        }
    })
    return tagsQuery;
}


export function encodeSpacesToPlus(string) {
    return string.replace(/ /g, '+');
}

//Testing function: download json reponse to check it
export function downloadJSONResponse(data) {
    const downloadJSON = document.createElement("a");
    downloadJSON.href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        })
    );
    downloadJSON.setAttribute("download", "Data.json");
    document.body.appendChild(downloadJSON);
    downloadJSON.click();
    document.body.removeChild(downloadJSON); 
}

export function setNavigationElement(isAuthenticated) {
    if (isAuthenticated) {
        const navElement = document.getElementById("navigation");
        navElement.innerHTML = `
            <div class="user">
                <div class="usercontainer">
                    <div class="userphoto" id="user-photo" style="background-image: url('../placeholders/user.jpg'); background-size: cover"><a href="profile.html" style="display: block"></a></div>
                    <span class="useremail" id="user-email"></span>
                </div>
                <div class="logoutcontainer">
                    <button class="logoutbtn" id="logout-btn">Log Out</button>
                </div>
            </div>`;

    }
}

export async function setComments(isAuthenticated, userID, entityID, entityName, type) {
    if (true) {
        let inputCommentBox = document.getElementById("inputCommentBox");
        let displayComments = document.getElementById("display-comments-container");
        let entityComments = await retrieveEntityComments(entityID);
        let noCommentText = document.getElementById("default-comments-display");
        let userInfo = await displayUserInfo(userID);

        if (isAuthenticated) {

            inputCommentBox.innerHTML = `
                <style>
                .input-comment-box {
                    border: 5px rgb(78, 79, 235) solid;
                    padding: 10px;
                }
                .submit-comment:active {
                    background-color: #068fff;
                }
                </style>
                <div class="comment-current-userdisplay">
                    <div class="userphoto" id="user-photo" style="background-image: url(${userInfo.profile_picture}); background-size: cover"><a href="profile.html" style="display: block"></a></div>
                    <div class="user-name">${userInfo.username}</div>
                </div>
                <div class="comment-current-userinput">
                    <textarea class="comment-input" id="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="submit-comment" id="submit-comment">Submit</button>
                </div>`;
            
            displayUserInfo(userID);
            const submitButton = document.getElementById("submit-comment");
            submitButton.addEventListener("click", async function() {
                const commentInput = document.getElementById("comment-input");

                if(commentInput.value) {
                    addComment(commentInput.value, entityID, entityName, type);
                    commentInput.value = ""; // Clear the input field
                }
            });
        }

        if(entityComments !== null) {
            noCommentText.remove();

            const formatter = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            entityComments.forEach(item => {
                let pic = "";
                if(item.userPhotoURL != null){
                    pic = item.userPhotoURL;
                }
                else {
                    pic = '../placeholders/user.jpg';
                }
                let parsedDate = new Date(item.Timestamp);
                let formattedTime = formatter.format(parsedDate);
                let comment = document.createElement("div");

                comment.innerHTML = `
                    <div class="comment-userdisplay">
                        <div class="userphoto" id="user-photo" style="background-image: url(${pic}); background-size: cover"><a href="profile.html" style="display: block"></a></div>
                        <div class="user-name">${item.userDisplayName} : ${formattedTime}</div>
                    </div>
                    <div class="comment-text">
                        <p>${item.comment}</p>
                    </div>`;
                
                displayComments.appendChild(comment);
            });
        }
        else {
            noCommentText.innerHTML = "No comments to display";
        }
    }
}
