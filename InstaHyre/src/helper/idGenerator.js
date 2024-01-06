const { ObjectId } = require('mongodb');

module.exports = getNewId = () => {
    // TODO try catch
    try {
        return new ObjectId().toString();
    }
    catch (err) {
        throw err;
    }
};
