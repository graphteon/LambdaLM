module.exports = ({ length }) => {
    // Define the characters to be included in the password
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&()';

    // Ensure 'length' is a number and greater than 0
    if (typeof length === 'number' && length > 0) {
        var password = '';
        for (var i = 0; i < length; i++) {
            // Add a random character from 'characters' to the password
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    } else {
        throw new Error('Invalid parameter. Ensure "length" is a positive number.');
    }
}