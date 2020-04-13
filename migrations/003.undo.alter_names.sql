ALTER TABLE noteful_folders
    RENAME COLUMN "folder_name" 
    TO "name";
        
ALTER TABLE noteful_notes
    RENAME COLUMN "note_name" 
    TO "name";