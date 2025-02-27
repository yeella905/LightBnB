const { Pool } = require("pg");

const pool = new Pool({
  user: "development",
  password: "development",
  host: "localhost",
  database: "lightbnb",
});

const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  let resolvedUser = null;
  const queryString = `SELECT * FROM users 
  WHERE email = $1 
  `

  const values = [email]
  
  return pool
  .query(
  queryString, values)

  .then((result) => {
      console.log(result)
    return Promise.resolve(result.rows[0]);
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {

    const queryString = `SELECT * FROM users 
  WHERE id = $1 
  `
  
  const values = [id]
  
  return pool
  .query(
  queryString, values)

  .then((result) => {
      console.log(result)
    return Promise.resolve(result.rows[0]);
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const userId = Object.keys(users).length + 1;
  user.id = userId;
  
  const queryString = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)"

  const values = [user.name, user.email, user.password]
  
  return pool
  .query(
  queryString, values)

  .then((result) => {
      
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });

};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
    const queryString = `SELECT * FROM reservations
    INNER JOIN properties on reservations.property_id = properties.id WHERE reservations.guest_id = $1
    LIMIT $2`

    const values = [820, limit]
    
    return pool
    .query(
    queryString, values)

    .then((result) => {
        console.log(result); 
      return Promise.resolve(result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit) {

    const queryString = `SELECT * FROM properties 
    LIMIT $1`

    const values = [limit || 10]
    
    return pool
    .query(
    queryString, values)

    .then((result) => {
        
      return Promise.resolve(result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
