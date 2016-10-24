'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/iqslideshow-dev',
	assets: {
		lib: {
			css: [],
			js: []
		},
		css: [],
		js: [],
        sharedJs: [],
        admin: { css: ['public/dist/css/admin.min.css'], js: ['public/dist/js/admin.min.js'] },
        player: { css: ['public/dist/css/player.min.css'], js: ['public/dist/js/player.min.js'] }
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
	meetingRooms: {
		endpoint: process.env.MEETING_ROOMS_ENDPOINT || 'https://stg-mrapp.iquestgroup.com/meetingroom/api/rooms/status',
		username: process.env.MEETING_ROOMS_USERNAME || 'e9cfeac7284528d98eebe7627083b7cbf6de0fe6d7fe67a0e341a04fd3bca3a36f79dac27878745c50c6fa40929e427d3339952b7b57cbaf26955ef8fb45e5fd',
		password: process.env.MEETING_ROOMS_PASSWORD || 'db1168866df94f7e6330400d047d27d342804b66579851114bf973e0216722a7548eae9cd29b1c6916ac2eb0ba437cc309cb1c4947968454a66105173b71f6a4'
	}
};

