require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const errorHandler = require('./error-handler.js')

const foldersRouter = require('./folders/folders-router')
const notesRouter = require('./notes/notes-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
  }))
  app.use(cors())
  app.use(helmet())

app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)

app.get('/', (req,res) => {
    res.send('Hello, World!')
})

app.use(errorHandler)

module.exports = app