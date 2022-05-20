const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController')
const BookController = require("../controller/bookController")
const ReviewController =require("../controller/reviewController")
const authenticate1 = require('../middlware/auth')

router.post("/register" , UserController.createUserData)

router.post("/login", UserController.loginUser)
 
router.post("/books",authenticate1.authentication, BookController.createBook)
router.get("/books",authenticate1.authentication, BookController.getBook)
router.get("/books/:bookId",authenticate1.authentication, BookController.getBookById)
router.put("/books/:bookId",authenticate1.authentication,authenticate1.authorize, BookController.updateBooks)
router.delete("/books/:bookId",authenticate1.authentication,authenticate1.authorize,BookController.deleteById)
 
router.post("/books/:bookId/review", ReviewController.createReview)
router.put("/books/:bookId/review/:reviewId", ReviewController.UpdateReview)
router.delete("/books/:bookId/review/:reviewId", ReviewController.deleteReview )



module.exports = router;