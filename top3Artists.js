export async function getTopArtists(limit = 3) {
    const db = getDatabase();
    const entitiesRef = ref(db, "entities");

    try {
        const snapshot = await get(entitiesRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const artists = Object.entries(data)
                .map(([id, entity]) => ({ id, ...entity }))
                .filter(e => e.type === "artist")
                .sort((a, b) => (b.views || 0) - (a.views || 0));

            return artists.slice(0, limit);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching top artists:", error);
        return [];
    }
}

