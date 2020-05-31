INSERT INTO noteful_notes (id, note_name, modified, folderId, content)
VALUES
    (
        911, 
        "Nothing suspicious here...", 
        "2019-01-03T00:00:00.000Z", 
        1, 
        `This text contains an intentionally broken image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie); alert(''you just got pretend hacked! oh noes!'');">. The image will try to load, when it fails, <strong>it executes malicious JavaScript</strong>` 
    );