USE plymouthCrisis;

INSERT INTO users (
  password, name, surname, email, role, phoneNumber, birthday, createdAt,
  updatedAt, isActive, avgResponseTimeMins, pushNotifications, status
)
SELECT
  '$2b$12$XDGA7HNC7CWKTnJbFPGCke2Yu8CugMLDdbFWe8r0y454tps0oHlF2',
  'Test', 'Coordinator', 'coordinator@example.com', 'coordinator',
  '+447700900000', '1990-01-01', NOW(), NULL, TRUE, 0, TRUE, 'available'
WHERE NOT EXISTS (SELECT 1 FROM users);

SET @seed_user_id = (SELECT MIN(userId) FROM users);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, createdBy
)
SELECT
  'Flood response at Plymouth Barbican',
  'Help residents move supplies away from floodwater and report blocked access routes.',
  'Flood', 'Wear waterproof clothing', 'Meet beside the Mayflower Steps',
  50.3679000, -4.1343000, 'critical', TRUE, NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Flood response at Plymouth Barbican'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, createdBy
)
SELECT
  'Food parcel support in Devonport',
  'Sort emergency food parcels and assist with distribution to local families.',
  'Relief', 'Manual handling may be required', 'Report to the community aid desk',
  50.3781000, -4.1714000, 'high', TRUE, NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Food parcel support in Devonport'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, createdBy
)
SELECT
  'Storm damage checks near Mutley Plain',
  'Photograph reported storm damage and send safe access updates to the coordinator.',
  'Storm', 'Do not enter damaged buildings', 'Work in pairs',
  50.3842000, -4.1359000, 'normal', TRUE, NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Storm damage checks near Mutley Plain'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, createdBy
)
SELECT
  'Temporary shelter support in the city centre',
  'Welcome residents, organise donated supplies and direct people to available services.',
  'Shelter', 'Safeguarding briefing provided on arrival', 'Evening shift',
  50.3715000, -4.1427000, 'low', TRUE, NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Temporary shelter support in the city centre'
);

INSERT INTO team (incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive)
SELECT
  incidentId, @seed_user_id, NULL, CONCAT('MAIN - ', title),
  'Coordinate volunteers assigned to this incident.', NOW(), TRUE
FROM incidents AS incident
WHERE incident.title IN (
  'Flood response at Plymouth Barbican',
  'Food parcel support in Devonport',
  'Storm damage checks near Mutley Plain',
  'Temporary shelter support in the city centre'
)
AND NOT EXISTS (
  SELECT 1
  FROM team
  WHERE team.incidentId = incident.incidentId
    AND team.name = CONCAT('MAIN - ', incident.title)
);

INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, isActive)
SELECT
  team.teamId, 'Move emergency supplies',
  'Move sandbags, bottled water and first-aid supplies to the dry staging area.',
  'critical', NOW(), NULL, TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
WHERE incidents.title = 'Flood response at Plymouth Barbican'
AND NOT EXISTS (
  SELECT 1 FROM tasks WHERE tasks.teamId = team.teamId AND tasks.name = 'Move emergency supplies'
);

INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, isActive)
SELECT
  team.teamId, 'Prepare food parcels',
  'Sort food by parcel checklist and prepare completed parcels for collection.',
  'high', NOW(), NULL, TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
WHERE incidents.title = 'Food parcel support in Devonport'
AND NOT EXISTS (
  SELECT 1 FROM tasks WHERE tasks.teamId = team.teamId AND tasks.name = 'Prepare food parcels'
);

INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, isActive)
SELECT
  team.teamId, 'Document storm damage',
  'Photograph damaged public areas and record whether pedestrian access is safe.',
  'normal', NOW(), NULL, TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
WHERE incidents.title = 'Storm damage checks near Mutley Plain'
AND NOT EXISTS (
  SELECT 1 FROM tasks WHERE tasks.teamId = team.teamId AND tasks.name = 'Document storm damage'
);

INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, isActive)
SELECT
  team.teamId, 'Organise shelter supplies',
  'Inventory donated bedding and hygiene supplies before the evening intake.',
  'low', NOW(), NULL, TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
WHERE incidents.title = 'Temporary shelter support in the city centre'
AND NOT EXISTS (
  SELECT 1 FROM tasks WHERE tasks.teamId = team.teamId AND tasks.name = 'Organise shelter supplies'
);
