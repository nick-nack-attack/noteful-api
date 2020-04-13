function makeNotesArray() {
    return [
        {
            id: 1,
            note_name: "Test Note 1",
            modified: new Date().toISOString(),
            folderid: 2,
            content: "Test Content 1"
        },
        {
            id: 2,
            note_name: "Test Note 2",
            modified: new Date().toISOString(),
            folderid: 3,
            content: "Test Content 2"
        }
    ]
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 3,
        note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        modified: new Date().toISOString(),
        folderid: "1",
        content: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
    }
    const expectedNote = {
        ...maliciousNote,
        note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: 'Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.'
    }
    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = { 
    
    makeNotesArray,
    makeMaliciousNote

}
