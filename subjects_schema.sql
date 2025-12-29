-- Create subjects table for centralized subject management
CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  department VARCHAR(50),
  semester INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_subjects_department_semester ON subjects(department, semester);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);

-- Add comment to table
COMMENT ON TABLE subjects IS 'Centralized subject management - all subjects are created here and referenced across the system';

-- Insert default subjects
INSERT INTO subjects (name, code, description, department, semester) VALUES
  ('Data Structures', 'CS101', 'Fundamental data structures and algorithms', 'CS', 2),
  ('Database Management', 'CS201', 'Database design and SQL', 'CS', 3),
  ('Computer Networks', 'CS301', 'Network protocols and architecture', 'CS', 4),
  ('Operating Systems', 'CS302', 'OS concepts and implementation', 'CS', 4),
  ('Software Engineering', 'CS401', 'Software development methodologies', 'CS', 5),
  ('Web Development', 'CS501', 'Full-stack web development', 'CS', 5),
  ('Machine Learning', 'CS601', 'ML algorithms and applications', 'CS', 6),
  ('Computer Graphics', 'CS602', 'Graphics programming and visualization', 'CS', 6),
  ('Cyber Security', 'CS701', 'Security principles and practices', 'CS', 7),
  ('Mobile App Development', 'CS702', 'Native and cross-platform development', 'CS', 7),
  ('Mathematics', 'MATH101', 'Discrete mathematics and calculus', 'CS', 1),
  ('Physics', 'PHY101', 'Physics fundamentals', 'CS', 1),
  ('Chemistry', 'CHM101', 'Chemistry essentials', 'CS', 1),
  ('Object-Oriented Programming', 'CS102', 'OOP concepts and design patterns', 'CS', 2),
  ('Web Technologies', 'CS202', 'HTML, CSS, JavaScript fundamentals', 'CS', 3)
ON CONFLICT DO NOTHING;
