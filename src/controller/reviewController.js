const reviewModel = require("../models/reviewModel.js")
const bookModel = require("../models/bookModel")
const objectId = require('mongoose').Types.ObjectId



const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim.length === 0) return false
    return true

}




const createReview = async function (req, res) {
  
        try {
            let bookId = req.params.bookId
            let reviewData = req.body
            if (!isValid(bookId)) {
                return res.status(400).send({ status: false, msg: "bookId is required" })
    
            }
            if (!objectId.isValid(bookId)) {
                return res.status(400).send({ status: false, msg: "bookId params is invalid" })
    
            }
            let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
    
            if (!book) {
                return res.status(400).send({ status: false, msg: "this book id is not present in database" })
            }
            //body data================================
            if (!isValid(reviewData.bookId)) {
                return res.status(400).send({ status: false, msg: "bookId is required" })
    
            }
            if (!objectId.isValid(reviewData.bookId)) {
                return res.status(400).send({ status: false, msg: "bookId  is invalid" })
    
            }
            if(reviewData.bookId != bookId){
                return res.status(400).send({status:false,msg:"params bookId and body bookId is not same "})
            }
            const bookData = await bookModel.findOne({ _id: reviewData.bookId, isDeleted: false })
            if (!bookData) {
                return res.status(404).send({ status: false, msg: "this book id is not present in database" })
            }
            if (!bookId == reviewData.bookId) {
                return res.status(404).send({ status: false, msg: "params bookId and body bookId  is not same" })
    
            }
    
            if (!isValid(reviewData.reviewedBy)) {
                return res.status(400).send({ status: false, msg: "reviewer name  is required" })
    
            }
    
            if (!isValid(reviewData.rating)) {
                return res.status(400).send({ status: false, msg: "rating is required" })
            }
            if(!(reviewData.rating > 0 && reviewData.rating <=5) ){
                return res.status(400).send({ status: false, msg: "please enter valid rating" })
            }
            let result1 = {
                _id: bookData._id,
                title: bookData.title,
                excerpt: bookData.excerpt,
                userId: bookData.userId,
                category: bookData.category,
                subcategory: bookData.subcategory,
                deleted: bookData.isDeleted,
                reviews: bookData.reviews,
                deletedAt: bookData.deletedAt,
                releasedAt: bookData.releasedAt,
                createdAt: bookData.createdAt,
                updatedAt: bookData.updatedAt
            }
        
            let data = await reviewModel.create(reviewData)
            let reviewCount = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } })
            let result = {
                _id: data._id,
                bookId: data.bookId,
                reviewedBy: data.reviewedBy,
                reviewedAt: data.reviewedAt,
                rating: data.rating,
                review: data.review
    
    
            }
            result1['reviewsData'] = result
            return res.status(201).send({ status: true, msg: 'successfully created', data: result1 })
    
    
    
        }
        catch (err) {
            return res.status(500).send({ status: false, msg: err.message })
        }
    }
  




const UpdateReview = async function (req, res) {

  
        try {
            let reviewData = req.body
            let { bookId, reviewId } = req.params
            if (!isValid(reviewData.reviewedBy)) {
                return res.status(400).send({ status: false, msg: "reviewer's name is required" })
            }
           
            let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
            if (!book) {
                return res.status(404).send({ status: false, msg: "review with this bookId not present" })
    
            }
            let review1 = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
            if (!review1) {
                return res.status(404).send({ status: false, msg: " this reviewId not found" })
            }
            if (!objectId.isValid(bookId)) {
                return res.status(400).send({ status: false, msg: " bookId is invalid" })
            }
            if (!objectId.isValid(reviewId)) {
                return res.status(400).send({ status: false, msg: " reviewId is invalid" })
            }
            if(!(reviewData.rating > 0 && reviewData.rating <=5) ){
                return res.status(400).send({ status: false, msg: "please enter valid rating" })
            }
            //get review details with books data
            book = book.toObject()
            let updated = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: { reviewedBy: reviewData.reviewedBy, review: reviewData.review, rating: reviewData.rating } }, { new: true })
    
            if (!updated) {
                book.reviewData = 'not review found for this book'
                return res.status(404).send({ status: false, msg: book })
    
            }
            book.reviewData = updated
            return res.status(200).send({ status:true, data: book })
        }
        catch (err) {
            return res.status(500).send({ status: false, msg: err.message })
        }
    
    }
   
        
    



const deleteReview = async function (req, res) {

    try {
        let { bookId, reviewId } = req.params
        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, msg: "review with this bookId not present" })

        }
        let review1 = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!review1) {
            return res.status(404).send({ status: false, msg: " this reviewId not found" })
        }
        if (!objectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: " bookId is invalid" })
        }
        if (!objectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: " reviewId is invalid" })
        }
        

        let deleteData = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: { isDeleted: true, deletedAt:Date.now() } }, { new: true })
        let reviewCountDec = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })
        return res.status(200).send({ status:true, msg: deleteData })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




module.exports.createReview = createReview
module.exports.UpdateReview = UpdateReview
module.exports.deleteReview = deleteReview 