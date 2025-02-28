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

    const values = [guest_id, limit]
    
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
// console.log(options)
    const queryParams = [];
    // 2
    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_reviews.property_id
    `;
    // const values = [limit || 10]
    const conditions = [];
// console.log(options.minimum_cost)
    if (options.city) {
        queryParams.push(`%${options.city}%`);
        conditions.push(` city LIKE $${queryParams.length}`);
    }

    if (options.owner_id) {
        queryParams.push(`${options.owner_id}`);
        conditions.push(`owner_id = $${queryParams.length}`);
    }

    if (options.minimum_price_per_night ) {
        queryParams.push(options.minimum_price_per_night * 100); // Convert to cents
        conditions.push(`properties.cost_per_night >= $${queryParams.length}`);
    }

    if (options.maximum_price_per_night) {
        queryParams.push (options.maximum_price_per_night * 100);
        conditions.push(`properties.cost_per_night <= $${queryParams.length}`)
    }

    if (conditions.length > 0) {
        queryString += `WHERE ${conditions.join(' AND ')} `;
    }

      // 4
      queryString += ` GROUP BY properties.id `;
      if (options.minimum_rating) {
          queryParams.push (options.minimum_rating)
          queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}
          `
        }
    queryParams.push(limit);
    queryString += `
    ORDER BY properties.cost_per_night
    LIMIT $${queryParams.length};
    `;
    // 5
    console.log(queryString, queryParams);

    //6
    return pool
    .query(
        queryString, queryParams)

    .then((result) => {
       console.log(result) 
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

  const queryString = "INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)"

  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code]
  
  return pool
  .query(
  queryString, values)

  .then((result) => {
      
    return Promise.resolve(result.rows[0]);
  })
  .catch((err) => {
    console.log(err.message);
  });

};


//   property.id = propertyId;
//   properties[propertyId] = property;

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
