// ==========================================
// OntologyHub.AI V2 - Ontology Schema (v1)
// ==========================================

// ------------------------------------------
// 1. Constraints (Uniqueness)
// ------------------------------------------

// Person: Email must be unique
CREATE CONSTRAINT person_email_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.email IS UNIQUE;

// Organization: Name should be unique for simplicity in this version
CREATE CONSTRAINT org_name_unique IF NOT EXISTS
FOR (o:Organization) REQUIRE o.name IS UNIQUE;

// Skill: Name must be unique
CREATE CONSTRAINT skill_name_unique IF NOT EXISTS
FOR (s:Skill) REQUIRE s.name IS UNIQUE;

// Interest: Topic must be unique
CREATE CONSTRAINT interest_topic_unique IF NOT EXISTS
FOR (i:Interest) REQUIRE i.topic IS UNIQUE;

// Event: EventID should be unique (if generated externally)
CREATE CONSTRAINT event_id_unique IF NOT EXISTS
FOR (e:Event) REQUIRE e.id IS UNIQUE;


// ------------------------------------------
// 2. Indexes (Performance)
// ------------------------------------------

// Index on Person names for faster lookup
CREATE INDEX person_name_index IF NOT EXISTS
FOR (p:Person) ON (p.name);

// Index on Event dates for timeline queries
CREATE INDEX event_date_index IF NOT EXISTS
FOR (e:Event) ON (e.date);

// Index on Interest topics
CREATE INDEX interest_topic_index IF NOT EXISTS
FOR (i:Interest) ON (i.topic);


// ==========================================
// 3. Schema Documentation (Comments)
// ==========================================
/*
Nodes:
- (:Person {name, email, birthDate, gender, etc.})
- (:Event {id, title, date, description, type, sentiment_score})
- (:Skill {name, proficiency_level})
- (:Interest {topic, category})
- (:Organization {name, type})
- (:Location {name, coordinates})

Relationships:
- (:Person)-[:EXPERIENCED {role, impact}]->(:Event)
- (:Person)-[:HAS_SKILL {level, verified}]->(:Skill)
- (:Person)-[:INTERESTED_IN {since, intensity}]->(:Interest)
- (:Person)-[:BELONGS_TO {start_date, end_date, role}]->(:Organization)
- (:Event)-[:OCCURRED_AT]->(:Location)
- (:Event)-[:RELATED_TO]->(:Person) // Other people involved
*/
