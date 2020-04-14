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
                    .expect(200, )
            })

        })

        context(' given an XSS ATTACK note', () => {

            const testFolders = makeFoldersArray()
            const { maliciousNote, expectedNote } = makeMaliciousNote()

            beforeEach(' insert malicious article ', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert( [maliciousNote] )
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].note_name).to.eql(expectedNote.note_name)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })

        })

    })

    describe(' GET /api/notes/:note_id ', () => {

        context('given NO articles', () => {

            it('responds with 404', () => {
                const note_id = 1000
                return supertest(app)
                    .get('/api/notes/' + note_id)
                    .expect(404, { error: { message: 'Note does not exist' } })
            })

        })

        context('given there ARE notes in db', () => {

            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(' insert folders + notes ', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(' responds 200 + article ', () => {
                const note_id = 1
                const expectedNote = testNotes[note_id - 1]
                return supertest(app)
                    .get('/api/notes/' + note_id)
                    .expect(200, expectedNote)
            })

        })

        context(' given XSS ATTACK note ', () => {

            const testFolders = makeFoldersArray()
            const { maliciousNote, expectedNote } = makeMaliciousNote()

            beforeEach(' insert malicious note ', () => {
                return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('noteful_notes')
                        .insert(maliciousNote)
                })

            })
                
            it('removes XSS ATTACK content', () => {
                return supertest(app)
                    .get('/api/notes/' + maliciousNote.id)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.note_name).to.eql(expectedNote.note_name)
                        expect(res.body.content).to.eql(expectedNote.content)
                    })
            })

        })

    })

    describe(' POST /api/notes ', () => {

        const testFolders = makeFoldersArray()

        beforeEach(' insert notes ', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })

        it(' creates note + responds with 201 + new note returned ', () => {

            const newNote = {
                note_name: "Get Christmas Decorations",
                folderid: 2,
                content: "I am feeling very festive so, you know, why not spruce things up a bit?"
            }

            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name)
                    expect(res.body.folderid).to.eql(newNote.folderid)
                    expect(res.body.content).to.eql(newNote.content)
                })
                .then(res =>
                    supertest(app)
                        .get('/api/notes/' + res.body.id)
                        .expect(res.body)
                )

        })

        const requiredFields = ['note_name', 'folderid', 'content']

        requiredFields.forEach(field => {
            const newNote = {
                note_name: 'New Note Name',
                folderid: 1,
                content: 'New note content here...'
            }

            it('responds with 400 + error message when ' + field + ' is missing.', () => {

                delete newNote[field]

                return supertest(app)
                    .post('/api/notes')
                    .send(newNote)
                    .expect(400, {
                        error: { message: 'Missing ' + field + ' in request body.' }
                    })
            })

        })

        it(' removes XSS content from response ', () => {

            const { maliciousNote, expectedNote } = makeMaliciousNote()

            return supertest(app)
                .post('/api/notes')
                .send(maliciousNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(expectedNote.note_name)
                    expect(res.body.content).to.eql(expectedNote.content)
                })

        })

    })

    describe(' DELETE /api/notes/:note_id ', () => {

        context('Given no notes', () => {

            it('responds with 404', () => {
                const note_id = 1000
                return supertest(app)
                    .delete('/api/notes/' + note_id)
                    .expect(404, { error: { message: 'Note does not exist' } })
            })
        
        })

        context('given there ARE articles in the db', () => {

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

            it('responds with 204 + removes the article', () => {

                const idToRemove = 2
                const expectedNotes = testNotes.filter(note => note.id !== idToRemove)

                return supertest(app)
                    .delete('/api/notes/' + idToRemove)
                    .expect(204)
                    .then(() =>
                        supertest(app)
                            .get('/api/notes')
                            .expect(expectedNotes)
                    )
                            
            })

        })

    })

    describe(' PATCH /api/notes/:note_id ', () => {

        context('given NO notes', () => {

            it('responds with 404', () => {

                const note_id = 1000
                return supertest(app)
                    .patch('/api/notes/' + note_id)
                    .expect(404, {
                        error: { message: 'Note does not exist' }
                    })

            })

        })

        context('given there ARE notes in db', () => {

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

            it('responds 204 + updates note', () => {

                const idToUpdate = 2
                const updateNote = {
                    note_name: "CHANGE TEST NOTE NAME",
                    folderid: 1,
                    content: "THIS IS NOW IN A NEW FOLDER"
                }
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updateNote
                }

                return supertest(app)
                    .patch('/api/notes/' + idToUpdate)
                    .send(updateNote)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/notes/' + idToUpdate)
                            .expect(expectedNote)
                    )
            })

            it('responds with 400 when no required fields are supplied', () => {

                const idToUpdate = 2
                
                return supertest(app)
                    .patch('/api/notes/' + idToUpdate)
                    .send({ irrelevantField: 'cake'})
                    .expect(400, {
                        error: { message: "Request body must contain title, folder id, and content." }
                    })
            })

            it('responds 204 when updating only one field', () => {

                const idToUpdate = 1
                const updateNote = {
                    note_name: 'DIFFERENT NAME'
                }
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updateNote
                }

                return supertest(app)
                    .patch('/api/notes/' + idToUpdate)
                    .send({
                        ...updateNote,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/notes/' + idToUpdate)
                            .expect(expectedNote)
                    )

            })

            it('reponds with 204 when nothing is updated')

        })

    })

})