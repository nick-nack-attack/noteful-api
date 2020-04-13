function makeFoldersArray() {
    return [
        {
            id: 1,
            folder_name: "First Test Folder",
        },
        {
            id: 2,
            folder_name: "Second Test Folder",
        },
        {
            id: 3,
            folder_name: "Third Test Folder",
        },
        {
            id: 4,
            folder_name: "Fourth Test Folder",
        }
    ];
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    }
    const expectedFolder = {
        ...maliciousFolder,
        folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousFolder,
        expectedFolder
    }
}

module.exports = { 
    makeFoldersArray, 
    makeMaliciousFolder 
}


