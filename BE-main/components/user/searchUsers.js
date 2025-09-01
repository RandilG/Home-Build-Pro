const connection = require('../../services/connection');

module.exports = function searchUsers(req, res) {
  const { q } = req.query;
  
  console.log('Search query:', q);
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const searchTerm = `%${q}%`;
  
  connection.query(
    `SELECT id, name, email, profileImage as avatar 
     FROM users 
     WHERE (name LIKE ? OR email LIKE ?) 
     AND is_verified = 1
     LIMIT 20`,
    [searchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error searching users:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      console.log('Search results found:', results.length);
      return res.json(results);
    }
  );
};