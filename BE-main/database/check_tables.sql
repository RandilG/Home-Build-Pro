-- Check if necessary tables exist
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check projects table structure
DESCRIBE projects;

-- Check expenses table structure
DESCRIBE expenses;

-- Check if there are any users
SELECT COUNT(*) as user_count FROM users;

-- Check if there are any projects
SELECT COUNT(*) as project_count FROM projects;

-- Check if there are any expenses
SELECT COUNT(*) as expense_count FROM expenses;

-- Check sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM projects LIMIT 5;
SELECT * FROM expenses LIMIT 5;
