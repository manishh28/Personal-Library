'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function(app) {

  app.route('/api/books')

    .get(async function(req, res) {
      try {
        const books = await Book.find({});
        res.json(books.map(b => ({
          _id:          b._id,
          title:        b.title,
          commentcount: b.comments.length
        })));
      } catch(err) {
        res.json({ error: 'could not get books' });
      }
    })

    .post(async function(req, res) {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');
      try {
        const book = new Book({ title });
        const saved = await book.save();
        res.json({ _id: saved._id, title: saved.title });
      } catch(err) {
        res.send('could not save book');
      }
    })

    .delete(async function(req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch(err) {
        res.send('could not delete books');
      }
    });


  app.route('/api/books/:id')

    .get(async function(req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');
      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch(err) {
        res.send('no book exists');
      }
    })

    .post(async function(req, res) {
      const bookid  = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');
      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch(err) {
        res.send('no book exists');
      }
    })

    .delete(async function(req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) return res.send('no book exists');
        res.send('delete successful');
      } catch(err) {
        res.send('no book exists');
      }
    });
};
