ALTER TABLE noteful_folders
    RENAME COLUMN "name" 
    TO "folder_name";
        
ALTER TABLE noteful_notes
    RENAME COLUMN "name" 
    TO "note_name";