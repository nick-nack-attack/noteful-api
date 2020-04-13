const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures')

describe(' Notes Endpoints ', () => {

    let db

    before(' make knex instance ', () => {

        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)

    })

    after(' disconnect from db ', () => db.destroy())
    before(' clean the table ', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))
    afterEach(' cleanup ', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    describe(' GET /api/notes ', () => {

        context('given NO notes', () => {

            it(' responds with 200 + empty array ', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })

        })

        context('given folders ARE in db', () => {

            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(' insert notes ', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
                    


            })

            it(' responds with 200 + all notes ', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })

        })

    })
})