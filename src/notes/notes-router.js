const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    folderid: note.folderid,
    content: xss(note.content)
})

notesRouter.route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })

    .post(jsonParser, (req,res,next) => {

        const { note_name, folderid, content } = req.body
        const newNote = { note_name, folderid, content }

        for (const [key, value] of Object.entries(newNote))
            if (value == null)
            return res.status(400).json({
                error: { message: 'Missing ' + key + ' in request body.' }
            })

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, '/' + note.id))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter.route('/:note_id')

    .all ((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if (!note) {
                return res
                    .status(404)
                    .json({
                        error: { message: 'Note does not exist' }
                    })
            }
            res.note = note
            next()
        })
        .catch(next)
    })

    .get ((req, res, next) => {
        res.json(serializeNote(res.note))
    })

    .delete ((req, res, next) => {

        const { note_id } = req.params

        NotesService.deleteNote(
            req.app.get('db'),
            note_id
        )
        .then(numRowsAffected => {
            res
                .status(204)
                .end()
        })
        .catch(next)
    })

    .patch (jsonParser, (req, res, next) => {

        const { note_name, folderid, content } = req.body
        const noteToUpdate = { note_name, folderid, content }

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length

        if (numberOfValues === 0) {
            return res
                .status(400)
                .json({
                    error: { message: 'Request body must contain title, folder id, and content.' }
                })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
            )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end()
            })
            .catch(next)
    })

module.exports = notesRouter