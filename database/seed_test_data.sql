USE plymouthCrisis;

INSERT INTO users (
  password, name, surname, email, role, phoneNumber, birthday, createdAt,
  updatedAt, isActive, avgResponseTimeMins, pushNotifications, status
)
SELECT
  '$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a',
  'Test', 'Coordinator', 'coordinator@example.com', 'coordinator',
  '+447700900000', '1990-01-01', NOW(), NULL, TRUE, 0, TRUE, 'available'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'coordinator@example.com'
);

INSERT INTO users (
  password, name, surname, email, role, phoneNumber, birthday, createdAt,
  updatedAt, isActive, avgResponseTimeMins, pushNotifications, status
)
SELECT
  '$2b$12$hJyPnVKtymm8m8Jb3afBeOqlYDttIWJYupXNaHO4m8bJnD.FVGXsC',
  'Test', 'System Manager', 'manager@example.com', 'system_manager',
  '+447700900001', '1990-01-01', NOW(), NULL, TRUE, 0, TRUE, 'available'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manager@example.com'
);

SET @seed_user_id = (
  SELECT userId FROM users WHERE email = 'coordinator@example.com' LIMIT 1
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, availableAt, createdBy
)
SELECT
  'Flood response at Plymouth Barbican',
  'Help residents move supplies away from floodwater and report blocked access routes.',
  'Flood', 'Wear waterproof clothing', 'Meet beside the Mayflower Steps',
  50.3679000, -4.1343000, 'critical', TRUE, NOW(), NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Flood response at Plymouth Barbican'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, availableAt, createdBy
)
SELECT
  'Food parcel support in Devonport',
  'Sort emergency food parcels and assist with distribution to local families.',
  'Relief', 'Manual handling may be required', 'Report to the community aid desk',
  50.3781000, -4.1714000, 'high', TRUE, NOW(), NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Food parcel support in Devonport'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, availableAt, createdBy
)
SELECT
  'Storm damage checks near Mutley Plain',
  'Photograph reported storm damage and send safe access updates to the coordinator.',
  'Storm', 'Do not enter damaged buildings', 'Work in pairs',
  50.3842000, -4.1359000, 'normal', TRUE, NOW(), NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Storm damage checks near Mutley Plain'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, availableAt, createdBy
)
SELECT
  'Temporary shelter support in the city centre',
  'Welcome residents, organise donated supplies and direct people to available services.',
  'Shelter', 'Safeguarding briefing provided on arrival', 'Evening shift',
  50.3715000, -4.1427000, 'low', TRUE, NOW(), NOW(), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Temporary shelter support in the city centre'
);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, status, createdAt, availableAt, createdBy
)
SELECT
  'Scheduled welfare checks in Stonehouse',
  'Visit registered residents, confirm their welfare and report requests for additional support.',
  'Medical', 'Work in pairs and carry identification', 'Meet at the community centre reception',
  50.3728000, -4.1621000, 'normal', TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), @seed_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE title = 'Scheduled welfare checks in Stonehouse'
);

UPDATE incidents
SET availableAt = DATE_ADD(NOW(), INTERVAL 3 DAY)
WHERE title = 'Scheduled welfare checks in Stonehouse'
  AND endedAt IS NULL;

UPDATE incidents
SET requiredCertificate = 'First Aid'
WHERE title = 'Flood response at Plymouth Barbican';

UPDATE incidents
SET requiredCertificate = 'Safeguarding'
WHERE title = 'Temporary shelter support in the city centre';

INSERT INTO team (incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive)
SELECT
  incidentId, @seed_user_id, NULL, CONCAT('MAIN - ', title),
  'Coordinate volunteers assigned to this incident.', NOW(), TRUE
FROM incidents AS incident
WHERE incident.title IN (
  'Flood response at Plymouth Barbican',
  'Food parcel support in Devonport',
  'Storm damage checks near Mutley Plain',
  'Temporary shelter support in the city centre',
  'Scheduled welfare checks in Stonehouse'
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

INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, isActive)
SELECT
  team.teamId, 'Complete scheduled welfare checks',
  'Follow the assigned route and record each resident welfare outcome.',
  'normal', NOW(), NULL, TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
WHERE incidents.title = 'Scheduled welfare checks in Stonehouse'
AND NOT EXISTS (
  SELECT 1 FROM tasks
  WHERE tasks.teamId = team.teamId
    AND tasks.name = 'Complete scheduled welfare checks'
);

-- Expanded demonstration data. All accounts below use Coordinator123! so they
-- can be used during local testing without maintaining separate demo secrets.
INSERT INTO users (
  password, name, surname, email, role, phoneNumber, birthday, createdAt,
  updatedAt, isActive, avgResponseTimeMins, pushNotifications, status
)
VALUES
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Alex', 'Morgan', 'coordinator2@example.com', 'coordinator', '+447700900010', '1987-04-12', NOW(), NULL, TRUE, 8, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Maya', 'Patel', 'maya.patel@example.com', 'volunteer', '+447700900101', '1994-02-18', NOW(), NULL, TRUE, 11, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Oliver', 'Reed', 'oliver.reed@example.com', 'volunteer', '+447700900102', '1989-07-03', NOW(), NULL, TRUE, 16, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Sophie', 'Clarke', 'sophie.clarke@example.com', 'volunteer', '+447700900103', '1997-11-21', NOW(), NULL, TRUE, 7, TRUE, 'busy'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Noah', 'Williams', 'noah.williams@example.com', 'volunteer', '+447700900104', '1992-05-09', NOW(), NULL, TRUE, 14, FALSE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Amelia', 'Brown', 'amelia.brown@example.com', 'volunteer', '+447700900105', '1985-09-14', NOW(), NULL, TRUE, 9, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'George', 'Taylor', 'george.taylor@example.com', 'volunteer', '+447700900106', '1999-01-27', NOW(), NULL, TRUE, 19, TRUE, 'offline'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Isla', 'Davies', 'isla.davies@example.com', 'volunteer', '+447700900107', '1993-06-30', NOW(), NULL, TRUE, 6, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Leo', 'Evans', 'leo.evans@example.com', 'volunteer', '+447700900108', '1990-12-06', NOW(), NULL, TRUE, 13, TRUE, 'busy'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Freya', 'Wilson', 'freya.wilson@example.com', 'volunteer', '+447700900109', '1996-03-17', NOW(), NULL, TRUE, 10, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Arthur', 'Thomas', 'arthur.thomas@example.com', 'volunteer', '+447700900110', '1988-08-25', NOW(), NULL, TRUE, 18, FALSE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Grace', 'Roberts', 'grace.roberts@example.com', 'volunteer', '+447700900111', '1995-10-11', NOW(), NULL, TRUE, 5, TRUE, 'available'),
  ('$2b$12$0df4wOaCjpuZYECZGU5sl.Yo7POgmNTCC/OiFyOhXBZzaufqNmn8a', 'Jack', 'Lewis', 'jack.lewis@example.com', 'volunteer', '+447700900112', '1991-04-04', NOW(), NULL, TRUE, 12, TRUE, 'offline')
ON DUPLICATE KEY UPDATE email = VALUES(email);

SET @seed_coordinator_2 = (
  SELECT userId FROM users WHERE email = 'coordinator2@example.com' LIMIT 1
);

DROP TEMPORARY TABLE IF EXISTS demo_incidents;
CREATE TEMPORARY TABLE demo_incidents (
  title VARCHAR(255) PRIMARY KEY,
  description TEXT NOT NULL,
  type VARCHAR(255) NOT NULL,
  importantData VARCHAR(255) NOT NULL,
  importantDataExtra VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  priority VARCHAR(255) NOT NULL,
  requiredCertificate VARCHAR(255),
  availableOffsetDays INTEGER NOT NULL,
  coordinatorNumber INTEGER NOT NULL
);

INSERT INTO demo_incidents VALUES
  ('Medical support at Central Park', 'Support the first-aid post and direct residents to the appropriate treatment queue.', 'Medical', 'Bring photo identification', 'Check in beside the Life Centre entrance', 50.3886000, -4.1511000, 'high', 'First Aid', 0, 1),
  ('River debris clearance near Laira', 'Clear lightweight debris from marked paths and report larger obstructions to the council team.', 'Infrastructure', 'Gloves and high-visibility clothing required', 'Do not enter the water', 50.3817000, -4.1089000, 'normal', 'Manual Handling', 0, 2),
  ('Search support around Saltram', 'Walk assigned search sectors and report observations using the incident team channel.', 'Search and Rescue', 'Remain with your assigned partner', 'Meet at the main car park', 50.3813000, -4.0837000, 'high', NULL, 0, 1),
  ('Fire recovery supplies in Coxside', 'Distribute bottled water, masks and emergency information to affected households.', 'Fire', 'Avoid cordoned streets', 'Collect supplies from the response van', 50.3671000, -4.1245000, 'critical', NULL, 0, 2),
  ('Flood barrier inspection in Lipson', 'Inspect temporary barriers and photograph any movement, leakage or access obstruction.', 'Flood', 'Waterproof boots recommended', 'Report defects immediately', 50.3811000, -4.1209000, 'high', 'Water Rescue', 0, 1),
  ('Relief collection point at North Prospect', 'Receive donations, sort essential items and prepare family supply packs.', 'Relief', 'Use safe lifting technique', 'Morning and afternoon shifts available', 50.3973000, -4.1659000, 'normal', 'Manual Handling', 0, 2),
  ('Scheduled evacuation exercise in Keyham', 'Assist residents during a planned evacuation exercise and record accessibility requirements.', 'Infrastructure', 'This is a planned exercise', 'Briefing starts 30 minutes before deployment', 50.3898000, -4.1777000, 'normal', NULL, 3, 1),
  ('Scheduled first-aid station at Royal Parade', 'Staff a planned public first-aid station and maintain the treatment log.', 'Medical', 'Current First Aid certificate required', 'Meet outside the Guildhall', 50.3707000, -4.1437000, 'high', 'First Aid', 3, 2),
  ('Scheduled storm preparation in Plymstock', 'Deliver preparedness leaflets and check vulnerable residents have emergency contact details.', 'Storm', 'Travel in pairs', 'Route sheets provided at briefing', 50.3598000, -4.0906000, 'normal', NULL, 4, 1),
  ('Scheduled shelter setup in Crownhill', 'Prepare sleeping areas, registration desks and safeguarding information before opening.', 'Shelter', 'Safeguarding certificate required', 'Use the rear service entrance', 50.4115000, -4.1469000, 'high', 'Safeguarding', 4, 2),
  ('Scheduled coastal safety patrol at Hoe Park', 'Support a planned coastal safety patrol and direct visitors away from restricted areas.', 'Search and Rescue', 'Wear weather-appropriate clothing', 'Meet at Smeaton Tower', 50.3645000, -4.1423000, 'normal', NULL, 5, 1),
  ('Scheduled food distribution in Efford', 'Prepare and distribute food parcels during the weekly resilience programme.', 'Relief', 'Manual handling may be required', 'Report to the community hub', 50.3853000, -4.1141000, 'low', 'Manual Handling', 5, 2),
  ('Scheduled drainage checks in Honicknowle', 'Check identified drains and photograph blockages before forecast heavy rain.', 'Storm', 'Do not lift drain covers', 'Upload all photographs to the incident record', 50.4062000, -4.1652000, 'normal', NULL, 6, 1),
  ('Scheduled water safety drill at Mount Batten', 'Assist with shore-based logistics during a planned water rescue drill.', 'Search and Rescue', 'Water Rescue certificate required', 'Personal flotation equipment supplied', 50.3567000, -4.1283000, 'high', 'Water Rescue', 6, 2),
  ('Scheduled community check-in at Peverell', 'Visit listed residents and confirm medication, heating and food support needs.', 'Medical', 'Do not enter homes without consent', 'Use the secure digital checklist', 50.3904000, -4.1581000, 'normal', 'Safeguarding', 7, 1),
  ('Scheduled sandbag store inventory in Estover', 'Count, inspect and stack emergency flood supplies ready for deployment.', 'Flood', 'Working at Height certificate required for upper storage', 'Safety briefing on arrival', 50.4007000, -4.0996000, 'low', 'Working at Height', 7, 2),
  ('Scheduled bridge access survey at Cattedown', 'Record pedestrian access issues and damaged signage around key crossing routes.', 'Infrastructure', 'Stay within marked public areas', 'Submit survey before end of shift', 50.3699000, -4.1183000, 'normal', NULL, 8, 1),
  ('Scheduled emergency bedding delivery in Stoke', 'Deliver packaged bedding to temporary storage points and confirm quantities received.', 'Shelter', 'Manual handling certificate preferred', 'Delivery route supplied on the day', 50.3819000, -4.1710000, 'normal', 'Manual Handling', 8, 2),
  ('Scheduled fire safety leafleting in Greenbank', 'Deliver fire recovery and prevention information to designated residential streets.', 'Fire', 'Do not enter damaged properties', 'Return undelivered packs to the hub', 50.3779000, -4.1322000, 'low', NULL, 9, 1),
  ('Scheduled resilience fair support in Mannamead', 'Set up information stands and guide visitors to local resilience services.', 'Relief', 'Public-facing role', 'Morning briefing at the library entrance', 50.3883000, -4.1328000, 'low', NULL, 10, 2);

INSERT INTO incidents (
  title, description, type, importantData, importantDataExtra, latitude,
  longitude, priority, requiredCertificate, status, createdAt, availableAt,
  createdBy
)
SELECT
  demo.title,
  demo.description,
  demo.type,
  demo.importantData,
  demo.importantDataExtra,
  demo.latitude,
  demo.longitude,
  demo.priority,
  demo.requiredCertificate,
  TRUE,
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_ADD(NOW(), INTERVAL demo.availableOffsetDays DAY),
  CASE
    WHEN demo.coordinatorNumber = 2 THEN @seed_coordinator_2
    ELSE @seed_user_id
  END
FROM demo_incidents AS demo
WHERE NOT EXISTS (
  SELECT 1 FROM incidents WHERE incidents.title = demo.title
);

-- Refresh future demo dates whenever the seed is run so scheduled incidents
-- remain visible for several days during development.
UPDATE incidents
JOIN demo_incidents ON demo_incidents.title = incidents.title
SET incidents.availableAt = DATE_ADD(NOW(), INTERVAL demo_incidents.availableOffsetDays DAY)
WHERE demo_incidents.availableOffsetDays > 0
  AND incidents.endedAt IS NULL;

INSERT INTO team (
  incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive
)
SELECT
  incidents.incidentId,
  incidents.createdBy,
  NULL,
  CONCAT('MAIN - ', incidents.title),
  'Coordinate volunteers and report progress for this incident.',
  NOW(),
  TRUE
FROM incidents
JOIN demo_incidents ON demo_incidents.title = incidents.title
WHERE NOT EXISTS (
  SELECT 1
  FROM team
  WHERE team.incidentId = incidents.incidentId
    AND team.name = CONCAT('MAIN - ', incidents.title)
);

INSERT INTO tasks (
  teamId, name, description, priority, createdAt, updatedAt, isActive
)
SELECT
  team.teamId,
  CONCAT('Prepare response for ', incidents.type),
  'Review the briefing, check equipment and confirm attendance with the coordinator.',
  incidents.priority,
  NOW(),
  NULL,
  TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
JOIN demo_incidents ON demo_incidents.title = incidents.title
WHERE NOT EXISTS (
  SELECT 1
  FROM tasks
  WHERE tasks.teamId = team.teamId
    AND tasks.name = CONCAT('Prepare response for ', incidents.type)
);

INSERT INTO tasks (
  teamId, name, description, priority, createdAt, updatedAt, isActive
)
SELECT
  team.teamId,
  'Submit end-of-shift update',
  'Record completed work, unresolved issues and any follow-up support required.',
  'normal',
  NOW(),
  NULL,
  TRUE
FROM team
JOIN incidents ON incidents.incidentId = team.incidentId
JOIN demo_incidents ON demo_incidents.title = incidents.title
WHERE NOT EXISTS (
  SELECT 1
  FROM tasks
  WHERE tasks.teamId = team.teamId
    AND tasks.name = 'Submit end-of-shift update'
);

INSERT INTO incidentNotification (
  incidentId, title, message, priority, sentBy, sentAt
)
SELECT
  incidents.incidentId,
  LEFT(incidents.title, 50),
  CASE
    WHEN incidents.availableAt > NOW()
      THEN CONCAT('Scheduled response opens ', DATE_FORMAT(incidents.availableAt, '%d %b at %H:%i'))
    ELSE 'An active incident needs volunteer support.'
  END,
  incidents.priority,
  incidents.createdBy,
  NOW()
FROM incidents
JOIN demo_incidents ON demo_incidents.title = incidents.title
WHERE NOT EXISTS (
  SELECT 1
  FROM incidentNotification
  WHERE incidentNotification.incidentId = incidents.incidentId
);

INSERT INTO volunteerAvailability (
  userId, status, availableFrom, availableUntil, updatedAt
)
SELECT
  users.userId,
  users.status,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  NOW()
FROM users
WHERE users.role = 'volunteer'
  AND users.email LIKE '%@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM volunteerAvailability
    WHERE volunteerAvailability.userId = users.userId
  );

INSERT INTO incidentVolunteers (
  incidentId, userId, joinedAt, status, responseTimeSeconds
)
SELECT
  incidents.incidentId,
  users.userId,
  DATE_SUB(NOW(), INTERVAL MOD(users.userId, 45) MINUTE),
  'joined',
  180 + MOD(users.userId * incidents.incidentId, 1500)
FROM incidents
JOIN demo_incidents ON demo_incidents.title = incidents.title
JOIN users ON users.role = 'volunteer'
  AND users.email LIKE '%@example.com'
  AND MOD(users.userId + incidents.incidentId, 4) = 0
WHERE demo_incidents.availableOffsetDays = 0
  AND NOT EXISTS (
    SELECT 1
    FROM incidentVolunteers
    WHERE incidentVolunteers.incidentId = incidents.incidentId
      AND incidentVolunteers.userId = users.userId
  );

INSERT INTO volunteeringTeams (teamId, userId)
SELECT
  team.teamId,
  incidentVolunteers.userId
FROM team
JOIN incidentVolunteers
  ON incidentVolunteers.incidentId = team.incidentId
WHERE NOT EXISTS (
  SELECT 1
  FROM volunteeringTeams
  WHERE volunteeringTeams.teamId = team.teamId
    AND volunteeringTeams.userId = incidentVolunteers.userId
);

INSERT INTO skills (
  title, description, skillType, skillDescription, proofOfCertificate,
  certificateName, expirationDateCertificate, courseTakenAt,
  verificationStatus, reviewedBy, reviewedAt
)
SELECT
  certificate.title,
  CONCAT(certificate.title, ' demonstration certificate'),
  'certified',
  CONCAT('Verified ', certificate.title, ' capability for demonstration data.'),
  CONCAT(LOWER(REPLACE(certificate.title, ' ', '-')), '-demo.pdf'),
  CONCAT(certificate.title, ' Certificate'),
  DATE_ADD(NOW(), INTERVAL 1 YEAR),
  DATE_SUB(NOW(), INTERVAL 6 MONTH),
  'verified',
  (SELECT userId FROM users WHERE email = 'manager@example.com' LIMIT 1),
  NOW()
FROM (
  SELECT 'First Aid' AS title
  UNION ALL SELECT 'Water Rescue'
  UNION ALL SELECT 'Safeguarding'
  UNION ALL SELECT 'Manual Handling'
  UNION ALL SELECT 'Working at Height'
) AS certificate
WHERE NOT EXISTS (
  SELECT 1
  FROM skills
  WHERE skills.description = CONCAT(certificate.title, ' demonstration certificate')
);

INSERT INTO volunteerSkills (skillId, userId)
SELECT
  skills.skillId,
  users.userId
FROM skills
JOIN users
  ON users.role = 'volunteer'
  AND users.email LIKE '%@example.com'
  AND MOD(users.userId + skills.skillId, 3) = 0
WHERE skills.description LIKE '%demonstration certificate'
  AND NOT EXISTS (
    SELECT 1
    FROM volunteerSkills
    WHERE volunteerSkills.skillId = skills.skillId
      AND volunteerSkills.userId = users.userId
  );

INSERT IGNORE INTO certificateSubmissionTypes (userId, certificateType, skillId)
SELECT
  volunteerSkills.userId,
  skills.title,
  volunteerSkills.skillId
FROM volunteerSkills
JOIN skills ON skills.skillId = volunteerSkills.skillId
WHERE skills.skillType = 'certified';

DROP TEMPORARY TABLE demo_incidents;
