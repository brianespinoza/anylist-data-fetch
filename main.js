const AnyList = require('anylist');
const pgp = require('pg-promise')();
require('dotenv').config();

const any = new AnyList({ email: process.env.ANYLIST_EMAIL, password: process.env.ANYLIST_PASSWORD });
const connection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
const db = pgp(connection);

async function insertRecipes(recipes) {
  try {
    for (const recipe of recipes) {
      await db.none(`
        INSERT INTO recipes (
          name,
          note,
          preparation_steps,
          servings,
          source_name,
          source_url,
          scale_factor,
          rating,
          nutritional_info,
          cook_time,
          prep_time,
          creation_timestamp,
          "timestamp"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TO_TIMESTAMP($12), TO_TIMESTAMP($13))
      `, [
        recipe.name,
        recipe.note,
        recipe.preparationSteps,
        recipe.servings,
        recipe.sourceName,
        recipe.sourceUrl,
        recipe.scaleFactor,
        recipe.rating,
        recipe.nutritionalInfo,
        recipe.cookTime,
        recipe.prepTime,
        recipe.creationTimestamp,
        recipe.timestamp
      ]);
    }

    console.log('Recipes inserted successfully');
  } catch (error) {
    console.error('Unable to insert recipes', error);
    throw error;
  }
}

any.login()
  .then(async () => {
    const recipeData = await any.getRecipes();
    any.teardown();
    return recipeData;
  })
  .then(async (recipes) => {
    await insertRecipes(recipes);
    console.log('Recipes inserted successfully');
  })
  .catch((error) => {
    console.error('Error occurred:', error);
  });
