const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.resolve(__dirname, './pos.db')

const DB = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, connected)

function connected(err) {
	if(err) {
		return console.log(err.message)
	}

	console.log('🟢 Connected to the SQLite database')
}



module.exports = DB