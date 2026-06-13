const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(10000);

  let testBookId;

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Title is sent', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'Test Book');
            testBookId = res.body._id;
            done();
          });
      });

      test('No title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });

    });

    suite('GET /api/books => array of books', function() {

      test('Get an array of books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'commentcount');
            done();
          });
      });

    });

    suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test with valid id in db', function(done) {
        chai.request(server)
          .get('/api/books/' + testBookId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments);
            done();
          });
      });

      test('Test with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/000000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test with comment', function(done) {
        chai.request(server)
          .post('/api/books/' + testBookId)
          .send({ comment: 'Great book!' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments);
            assert.include(res.body.comments, 'Great book!');
            done();
          });
      });

      test('Test without comment field', function(done) {
        chai.request(server)
          .post('/api/books/' + testBookId)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test with invalid id', function(done) {
        chai.request(server)
          .post('/api/books/000000000000000000000000')
          .send({ comment: 'test' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test valid id in db', function(done) {
        chai.request(server)
          .delete('/api/books/' + testBookId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test with invalid id', function(done) {
        chai.request(server)
          .delete('/api/books/000000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });

});
