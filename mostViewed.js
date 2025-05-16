
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

export async function getTopViewedEntities(limit = 10) {
  const db = getDatabase();
  const entitiesRef = ref(db, "entities");

  try {
    const snapshot = await get(entitiesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const entitiesArray = Object.entries(data).map(([id, stats]) => ({
        id,
        views: stats.views || 0,
        favorites: stats.favorites || 0,
        comments: stats.comments || 0
      }));

      // Sorting
      entitiesArray.sort((a, b) => b.views - a.views);

      return entitiesArray.slice(0, limit); 
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching top viewed entities:", error);
    return [];
  }
}
