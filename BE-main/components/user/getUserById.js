const connection = require('../../services/connection');

module.exports = async function getUserById(req, res) {
    const sql = 'SELECT id, name, email, role FROM homebuild.users WHERE email = ?;';

    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error getting user data');
        }

        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        return res.status(200).send(result[0]);
    });
};
