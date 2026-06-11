CREATE DATABASE IF NOT EXISTS plymouthCrisis;
USE plymouthCrisis;

CREATE TABLE IF NOT EXISTS users (
  userId INTEGER PRIMARY KEY AUTO_INCREMENT,
  password VARCHAR(255)  NOT NULL, 
  name VARCHAR(255)  NOT NULL,
  surname VARCHAR(255)  NOT NULL,
  email VARCHAR(255)  NOT NULL UNIQUE,
  role VARCHAR(255)  NOT NULL,
  phoneNumber VARCHAR(255)  NOT NULL,
  birthday DATETIME  NOT NULL,
  createdAt DATETIME  NOT NULL,
  updatedAt DATETIME ,
  isActive BOOLEAN  NOT NULL,
  avgResponseTimeMins INTEGER,
  pushNotifications BOOLEAN  NOT NULL,
  status VARCHAR(255)  NOT NULL
);


CREATE TABLE IF NOT EXISTS incidents (
  incidentId INTEGER PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(255) NOT NULL,
  importantData VARCHAR(255) NOT NULL,
  importantDataExtra VARCHAR(255) NOT NULL,
  latitude decimal(10,7) NOT NULL,
  longitude decimal(10,7) NOT NULL,
  priority VARCHAR(255) NOT NULL,
  requiredCertificate VARCHAR(255),
  status Bool,
  createdAt DATETIME NOT NULL,
  availableAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INTEGER NOT NULL, 
  endedAt DATETIME,
  endedBy INTEGER,
  INDEX idx_incidents_status_priority (status, priority),
  INDEX idx_incidents_available_at (availableAt),
  INDEX idx_incidents_location (latitude, longitude),
  INDEX idx_incidents_type (type),
  FOREIGN KEY (createdBy) REFERENCES users(userId),
  FOREIGN KEY (endedBy) REFERENCES users(userId)
);


CREATE TABLE IF NOT EXISTS skills (
  skillId INTEGER PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  skillType VARCHAR(255) NOT NULL,
  skillDescription TEXT , 
  proofOfCertificate TEXT ,
  certificateName VARCHAR(255) ,
  expirationDateCertificate DATETIME,
  courseTakenAt DATETIME,
  verificationStatus VARCHAR(32) NOT NULL DEFAULT 'under_review',
  reviewedBy INTEGER,
  reviewedAt DATETIME,
  FOREIGN KEY (reviewedBy) REFERENCES users(userId)
);


CREATE TABLE IF NOT EXISTS team (
  teamId INTEGER PRIMARY KEY AUTO_INCREMENT,
  incidentId INTEGER  NOT NULL,
  coordinatorId INTEGER  NOT NULL,
  teamLeaderId INTEGER,
  name VARCHAR(255) NOT NULL,
  task TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  isActive BOOLEAN NOT NULL,
  FOREIGN KEY (coordinatorId) REFERENCES users(userId),
  FOREIGN KEY (teamLeaderId) REFERENCES users(userId),
  FOREIGN KEY (incidentId) REFERENCES incidents(incidentId)
);

CREATE TABLE IF NOT EXISTS tasks (
  taskId INTEGER PRIMARY KEY AUTO_INCREMENT,
  teamId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  priority VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  isActive BOOLEAN NOT NULL,
  FOREIGN KEY (teamId) REFERENCES team(teamId)
);

-- Core: simulated team chat. Real-time/live chat delivery is an extension.
CREATE TABLE IF NOT EXISTS message(
  messageId INTEGER PRIMARY KEY AUTO_INCREMENT,
  teamId INTEGER NOT NULL,
  sentBy INTEGER NOT NULL,
  content TEXT NOT NULL,
  sendAt DATETIME NOT NULL,
  editedAt DATETIME,
  FOREIGN KEY (teamId) REFERENCES team(teamId),
  FOREIGN KEY (sentBy) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS incidentNotification(
  notificationId INTEGER  PRIMARY KEY AUTO_INCREMENT,
  incidentId INTEGER NOT NULL,
  title VARCHAR(50) NOT NULL,
  message TEXT,
  priority VARCHAR(255) NOT NULL DEFAULT 'normal',
  sentBy INTEGER,
  sentAt DATETIME NOT NULL,
  FOREIGN KEY (sentBy) REFERENCES users(userId),
  FOREIGN KEY (incidentId) REFERENCES incidents(incidentId)
);

CREATE TABLE IF NOT EXISTS userNotifications (
  notificationId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  readAt DATETIME,
  PRIMARY KEY (notificationId, userId),
  FOREIGN KEY (notificationId) REFERENCES incidentNotification(notificationId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS volunteerAvailability (
  availabilityId INTEGER PRIMARY KEY AUTO_INCREMENT,
  userId INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  availableFrom DATETIME,
  availableUntil DATETIME,
  updatedAt DATETIME NOT NULL,
  INDEX idx_availability_user_status (userId, status),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS userSettings (
  userId INTEGER PRIMARY KEY,
  pushNotifications BOOLEAN NOT NULL DEFAULT TRUE,
  locationSharing BOOLEAN NOT NULL DEFAULT FALSE,
  emergencyAlerts BOOLEAN NOT NULL DEFAULT TRUE,
  availability VARCHAR(255) NOT NULL DEFAULT 'available',
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS incidentVolunteers (
  incidentId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  joinedAt DATETIME NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'joined',
  responseTimeSeconds INTEGER,
  removedBy INTEGER,
  removedAt DATETIME,
  removalReason TEXT,
  PRIMARY KEY (incidentId, userId),
  INDEX idx_incident_volunteers_user (userId),
  FOREIGN KEY (incidentId) REFERENCES incidents(incidentId),
  FOREIGN KEY (userId) REFERENCES users(userId),
  FOREIGN KEY (removedBy) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS volunteerSkills (
  skillId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  PRIMARY KEY (skillId, userId),
  INDEX idx_volunteer_skills_user (userId),
  FOREIGN KEY (skillId) REFERENCES skills(skillId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS volunteeringTeams (
  teamId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  PRIMARY KEY (teamId, userId),
  FOREIGN KEY (teamId) REFERENCES team(teamId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
