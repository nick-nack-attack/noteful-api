const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe(' Folders Endpoints ', function() {

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))
    afterEach('cleanup',() => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    describe('GET /api/folders', () => {

        context('given NO folders', () => {

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                .get('/api/folders')
                .expect(200, [])
            })

        })

        context('given folders ARE in database', () => {

            const testFolders = makeFoldersArray()
            
            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 200 + all folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })

        })

        context('given a XSS ATTACK folder', () => {

            const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

            beforeEach('insert MALICIOUS folder', () => {
                return db
                    .into('noteful_folders')
                    .insert(maliciousFolder)
            })

            it('removes XSS ATTACK content', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name)
                    })
            })

        })

    })

    describe('GET /api/folders/:folder_id', () => {

        context('given NO folders', () => {

            it('responds with 404', () => {
                const folder_id = 1000
                return supertest(app)
                    .get('/api/folders/' + folder_id)
                    .expect(404, { error: { message: 'Folder does not exist' } })
            })

        })

        context('given there ARE folders in database', () => {

            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 200 + the specific article', () => {

                const folder_id = 2
                const expectedFolder = testFolders[folder_id - 1]

                return supertest(app)
                    .get('/api/folders/' + folder_id)
                    .expect(200, expectedFolder)
            })

        })

        context('given a XSS ATTACK folder', () => {

            const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

            beforeEach('insert MALICIOUS folder', () => {
                return db
                    .into('noteful_folders')
                    .insert(maliciousFolder)
            })

            it('removes XSS ATTACK content', () => {
                return supertest(app)
                    .get('/api/folders/' + maliciousFolder.id)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                    })

            })

        })

    })

    describe('POST /api/folders', () => {
       
        it('creates folder + responds with 201 + new folder returned', () => {

            const newFolder = {
                folder_name: "What could grapes replace?"
            }

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                })
                .then(res => 
                    supertest(app)
                        .get('/api/folders/' + res.body.id)
                        .expect(res.body)    
                )
                
        })

        it('responds with 400 + error when folder name is missing', () => {
            
            const newFolder = {}

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect( 400, {
                    error: { message: 'Folder name is required' }
                })

        })

        it('removes CSS attack content from response', () => {

            const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

            return supertest(app)
                .post('/api/folders')
                .send(maliciousFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                })

        })

    })

    describe('DELETE /api/folders/:folder_id', () => {

        context('given NO articles', () => {

            it('responds with 404', () => {
                const folder_id = 1000
                return supertest(app)
                    .delete('/api/folders/' + folder_id)
                    .expect(404, { error: { message: 'Folder does not exist' } })
            })

        })

        context('given there ARE articles in the database', () => {

            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 204 + removes the folder', () => {

                const idToRemove = 2
                const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/folders/${idToRemove}` )
                    .expect(204)
                    .then(() => 
                        supertest(app)
                        .get('/api/folders')
                        .expect(expectedFolders)
                    )

            })

        })

    })

    describe('PATCH /api/folders/:folder_id', () => {

        context('given there are NO folders in db', () => {


            it('responds with 404', () => {
                const folder_id = 1000
                return supertest(app)
                    .patch('/api/folders/' + folder_id)
                    .expect(404, {
                        error: { message: 'Folder does not exist' }
                    })
            })

        })

        context('given there ARE folders in db', () => {

            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 204 + updates folder', () => {
                const idToUpdate = 1
                const updatedFolder = {
                    folder_name: "Hot Bagels Aren't Explicitly Threatening"
                }
                const expectedFolder = {
                    ...testFolders[idToUpdate - 1],
                    ...updatedFolder
                }
                return supertest(app)
                    .patch('/api/folders/' + idToUpdate)
                    .send(updatedFolder)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/folders/' + idToUpdate)
                            .expect(expectedFolder)
                    )
            })

            it('responds with 400 when no fields applied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch('/api/folders/' + idToUpdate)
                    .send({ irrelevantField: 'potatoes' })
                    .expect(400, {
                        error: { message: "Request body requires folder name" }
                    })

            })

            // it responds with 204 when updating only subset

        })

    })

})
