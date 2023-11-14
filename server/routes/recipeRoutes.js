const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.post('/create-recipe', recipeController.createRecipe);
router.put('/update-recipe/:id', recipeController.updateRecipe);
router.delete('/delete-recipe/:id', recipeController.deleteRecipe);
router.get('/recipe/:id', recipeController.getRecipebyId);
router.post('/category/create',recipeController.insertCategory);

module.exports = router;