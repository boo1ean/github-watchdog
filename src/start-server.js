var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var log = require('./log');
var Watchdog = require('./watchdog');

module.exports = function startServer (opts) {
	var app = express();
	var port = opts.port || process.env.PORT || 3333;
	var watchdog = new Watchdog(opts);

	app.use(bodyParser.json());

	app.post('/push', function (req, res) {
		log.info('Start handling push event');

		var repo = req.body.repository.full_name;
		var commits = req.body.commits;

		if (!commits || !repo) {
			log.info('No commits or repo - nothing to do with that');
			return responseSuccess();
		}

		watchdog.assert(repo, commits)
			.then(responseSuccess)
			.catch(responseError);

		function responseSuccess () {
			log.info('Successfully handled push event');
			res.end();
		}

		function responseError(error) {
			log.error(error);
			res.status(500).end();
		}
	})

	app.listen(port);
	log.info('Github watchdog started at port %s', port);
};
