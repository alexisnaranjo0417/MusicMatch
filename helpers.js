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