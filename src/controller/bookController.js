const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const userModel = require("../models/userModel")
const { default: mongoose } = require('mongoose')
let moment =require("moment")


const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim.length === 0) return false
    return true

}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}



const createBook = async function (req, res) {
    try {
        data = req.body
        const {
            title,
            excerpt,
            userId,
            ISBN,
            category,
            subcategory,
            reviews,
            deletedAt,
            isDeleted,
            releasedAt
        } = data


        let isValidUser = await userModel.findById(userId)
        if (!isValidUser) {
            return res.status(400).send({ status: false, msg: "you are not allow to create the data ! .. token is Wrong" })
        }
        //if (req.body.userId == req.decodedToken.userId){
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "plz enter some data" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "title  is required" })
        }
        const duplicateTitle = await bookModel.findOne({ title: data.title })
        //console.log(uniqe)
        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "duplicate key title" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "excerpt  is required" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false, msg: 'Its not valid Id'})
        }

        let id = await userModel.findById({ _id: userId })
        if (!id) {
            return res.status(400).send({ status: false, msg: "it not valid id" })
        }
        //console.log(id)
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN is required" })
        }
        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if
            (duplicateISBN) {
            return res.status(400).send({ status: false, msg: "duplicate key ISBN" })
        }
        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "category is required" })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcategory is required" })
        }
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt is required" })
        }

        if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: ' date should be "YYYY-MM-DD\" ' })
        }
        if (isDeleted == true) {
           
            return res.status(400).send({ status: false, data: deletedAt })
        }

     
      
        

        let saveData = await bookModel.create(data);
        res.status(201).send({ status: true, msg: "succefully Created", data: saveData })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

const getBook = async function (req, res) {
    try {
        const Query = { isDeleted: false, deletedAt: null }
        const queryParams = req.query
        const { userId, category, subcategory } = queryParams
       
        if (isValid(userId)) {
            Query['userId'] = userId                  
        }
       
        if (isValid(category)) {
            Query['category'] = category
        }
        if (isValid(subcategory)) {
            Query['subcategory'] = subcategory
        }
        const books = await bookModel.find(Query).select({ book_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        if (books.length === 0) {
            return res.status(404).send({ status: false, msg: "Invalid Data" })

        }
        if(Array.isArray(books) && books.length === 0){
              return res.status(404).send({status:false, msg:"No Book found"})
        }
        
       
        if (userId || category || subcategory) {
            let sortedBooks = await bookModel.find({ $and: [{ isDeleted: false, deletedAt: null }, { $or: [{ userId: userId, isDeleted: false }, { category: category }, { subcategory: subcategory }] }] }).sort({ "title": 1 })
            return res.status(200).send({ status: true, msg: "Sorted Book By Title" , data: sortedBooks})
        }



    } catch (error) {
        return res.status(500).send({ status: "failed", msg: error.message })
    }

}


const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (!bookId) {
            return res.status(400).send({ msg: "please input book ID." })
        }
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false, msg: 'Its not valid Id'})
        }

        let bookDetails = await bookModel.findById(bookId);
       
        if (!bookDetails)
            return res.status(404).send({ status: false, msg: "No such book exists" });
            if(!isValidObjectId(bookDetails)){
                return res.status(400).send({status:false, msg: 'Its not valid Id'})
            }
        //let id= bookDetails.toObject
        let data = JSON.parse(JSON.stringify(bookDetails))  // DEEP CLONNING          //parse = object return       //Object se javascript object convert
        console.log(data)
        const book_id = bookDetails._id

        let reviews = await reviewModel.find({ bookId: book_id }).  //[{}]
            select({ _id: true, bookId: true, reviewedBy: true, reviewedAt: true, rating: true, review: true })

        if (bookDetails.isDeleted == true)
            return res.status(404).send({ status: false, msg: "sorry! book is already deleted" });

        data = {
            _id: bookDetails._id, 
            title: bookDetails.title,
             excerpt: bookDetails.excerpt,
              userId: bookDetails.userId, 
              ISBN: bookDetails.ISBN,
            category: bookDetails.category, 
            subcategory: bookDetails.subcategory, 
            isDeleted: bookDetails.isDeleted,
             reviews: bookDetails.reviews, 
            releasedAT: bookDetails.releasedAT,
             createdAt: bookDetails.createdAt,
              updatedAt: bookDetails.updatedAt
        }

        data.reviewsData = [...reviews]   //reviewsData[{}]
        console.log(data.reviewsData)
        let x = reviews.length


        res.status(200).send({ status: true, msg: "book list", data: data, total: x });

    } catch (err) {

        res.status(500).send({ msg: "error", error: err.message })
    }
}


const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!isValid(bookId)) res.status(400).send({ status: false, msg: "bookId is required" })
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false, msg: 'Its not valid Id'})
        }
        let { title, excerpt, releasedAt, ISBN } = req.body

        let titleExist = await bookModel.findOne({ title: title })
        if (titleExist)
            return res.status(400).send({ status: false, msg: "title exist already" })

        let isbnExist = await bookModel.findOne({ ISBN: ISBN })
        if (isbnExist)
            return res.status(400).send({ status: false, msg: "ISBN exist already" })

        let data = await bookModel.findById(bookId)
        if (!data.isDeleted == false) {
            return res.status(404).send({ status: false, msg: "data is already deleted" })
        }

        let updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, req.body, { new: true })
        res.status(200).send({ status: true, data: updatedBook })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


const deleteById = async function (req, res) {
   
 try{
 
        let Id = req.params.bookId
        if(!isValid(Id)){
            return res.status(400).send({status:false, msg:"plz provide bookId"})
        }
        if(!isValidObjectId(Id)){
            return res.status(400).send({status:false, msg: 'Its not valid Id'})
        }

        let ifExists = await bookModel.findById(Id)
        if(!isValidObjectId(ifExists)){
            return res.status(400).send({status:false, msg: 'Its not valid Id'})
        }

        if (!ifExists) {
            return res.status(404).send({ Status: false, msg: "Data Not Found" })
        }
        let data = { isDeleted: true, deletedAt: moment() }
        if (ifExists.isDeleted !== true) {

     const deleteBook= await bookModel.findOneAndUpdate({ bookId: ifExists, isDeleted: false }, { $set: data }, { new: true })
            return res.status(200).send({ status: true, msg: deleteBook })

        } else {
            return res.status(400).send({ status: false, msg: "already deleted" })
        }


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
    

module.exports.createBook = createBook
module.exports.getBookById = getBookById
module.exports.getBook = getBook
module.exports.updateBooks = updateBooks
module.exports.deleteById = deleteById 