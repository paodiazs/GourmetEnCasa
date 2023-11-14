const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


//crear review
router.post('/:recipeId/like', reviewController.createReview);
//quitar like
router.delete('/:recipeId/unlike', reviewController.deleteReview);
//number of likes
router.get('/:recipeId/likes-count', reviewController.getlikescount);
//likes
router.get('/users/likes', reviewController.likesReview);

module.exports = router;