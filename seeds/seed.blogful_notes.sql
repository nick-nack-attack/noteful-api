TRUNCATE TABLE noteful_notes;

INSERT INTO "noteful_notes" ("id", "note_name", "folderid", "content")
	VALUES
	(1, 'Check out PKIN', 1, 'It is the big building in the middle of downtown Warsaw. Cannot miss it!'),
	(2, 'See the River!', 1, 'Can not remember what it is called but it is a thing and it is there.'),
	(3, 'Leave via the Warsawza Centralna', 1, 'You have seen everything so now it is time to get out!'),
	(4, 'Get all the money in the world', 2, 'Use your excellent charisma to have them fork it over.'),
	(5, 'Enslave human species', 2, 'After this, all the grapes and incumbent bicycles are yours.'),
	(6, 'Explosions', 3, 'Big or small. They be eardrum busters.'),
	(7, 'Yelling', 3, 'Because you deserve it, that is why.'),
	(8, 'Jackhammer', 3, 'It starts at 6am on a street near you.'),
	(9, 'Roaring Jet Engines', 3, 'There are two or more of those suckers on them big boys.');
