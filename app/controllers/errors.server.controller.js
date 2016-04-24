'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

function getMongoError (err) {
    switch (err.code) {
        case 16837:
            return err.message;
            break;
        case 11000:
            return 'duplicate';
            break;
        default:
            return 'Something went wrong during database operations.';
    }
}
/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';

    if (err.name === 'MongoError') {
        message = getMongoError(err);
    } else if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};
