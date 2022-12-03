const { assert } = require('chai');
const  getUserByEmail  = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.email, testUsers[expectedUserID].email)
  });
  it('should return undefined if an email doesnt exist', function() {
    const user = getUserByEmail("jank@email.com", testUsers);
    const expectedUserID = undefined
    assert.equal(user, expectedUserID)
  })
});