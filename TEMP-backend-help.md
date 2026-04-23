###### Systems

SQLIte: The actual database system
SQLAlchemy: Python tool to allow easier usage of SQLite
Flask-SQLAlchemy: Flask wrapper for SQLAlchemy
Flask-Migrate: Tool to keep track changes to database structure (important)

###### Installation requirements

- Git pull
- pip install -r requirements.txt

###### What is the database?

- Contains that raw data, sorted into tables
- On my side, app.db
- Likely the same for the others
- .db is **NOT** shared through git
- Each person will have a slightly different database

###### What is shared vs not-shared

- Code, models and migration info are shared
- Actual database content is not shared

###### SQLAlchemy

- Uses a python to create a table of objects
- Translates python to cringe SQL instructions

###### Models

```
class User(db.Model):
	__tablename__ = "users"

	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(120), unique=True, nullable=False)
	username = db.Column(db.String(50), unique=True, nullable=False)
	password = db.Column(db.String(128), nullable=False)
	wins = db.Column(db.Integer, default=0)
	streak = db.Column(db.Integer, default=0)
```

- This is ONE model that creates ONE table called "users"
  - Individual users are records, or rows in the users table
- Creating ANOTHER class will create ANOTHER table
- These can be referenced easily object by object

###### Models and Migrations

- This model does not instantly create the table, it just creates instructions for the structure
- To turn it into a real table in the database, use migrations
- Write model in python --> Generate migration --> Apply migration --> Table created in app.db
- Migrations are like version control for our database structure
  - They are committed to Github and we share the structure, just not the contents
- When you change anything to do with the structure of the database
  - Names, tables, columns, constraints
  - `flask db migrate -m "initial" `
    - This command compares your models.py file and the database and generates a script to change the database accordingly
  - `flask db upgrade `
    - Runs that script to update the structure of the database

###### How the app will use these models

```
new_user = User(
	email="sam@email.com",
	username="sam",
	password="hashedpassword"
	wins=0
	streak=1
)

db.session.add(new_user)
db.session.commit()
```

- This would live inside the **routes.py** file that controls interactions with the database
- Creates a new user, then adds it to the database, then commits those changes

```
user.wins += 1
db.session.commit()
```

- This is how to add a win to a user, for example
- **Always have to db.session.commit() changes**
  - Very common source of error
  - One commit per logical action (create, update or delete)

###### What is db.session?

- Basically just a staging area for changes to the database, all create, update or delete changes must be staged here first

###### Database, Working Together and Github

- Our individual .db file that contains the database information are NOT shared
  - Would lead to horrible testing and development
- Soooo only the STRUCTURE is shared
  - Models
  - Migrations
  - App code
- Each person has their own SQLite .db file for database
- The structure for that database is updated and shared with github via models.py and migrations
- Means we need to be careful and considered with database changes
  - Especially changing existing tables

###### File Information and Flow

- config.py
  - Defines where the sql database lives
- init.py
  - Creates the Flask app and attaches migration and SQLAlchemy features
- models.py
  - Defines the structure of the tables
- When you are changing models
  - flask db migrate
  - flask db upgrade
  - This updates YOUR database
  - Everyone needs to run this after git pull (if models.py is changed)
    - This is to update THEIR database
- routes.py
  - Uses the models to create/read/update/delete users, or other database information
