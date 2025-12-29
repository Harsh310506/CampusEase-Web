-- Faculty Class Assignment Schema
-- This schema manages which classes are assigned to which faculty members

-- Create faculty_classes table to link faculty to classes
CREATE TABLE IF NOT EXISTS faculty_classes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  faculty_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  subject_id BIGINT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(faculty_id, class_id, subject_id),
  CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES class_details(class_id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_classes_faculty_id ON faculty_classes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_classes_class_id ON faculty_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_faculty_classes_subject_id ON faculty_classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_classes_active ON faculty_classes(is_active);

-- Add comments
COMMENT ON TABLE faculty_classes IS 'Links faculty members to classes and subjects they teach';
COMMENT ON COLUMN faculty_classes.faculty_id IS 'References faculty.user_id';
COMMENT ON COLUMN faculty_classes.class_id IS 'References class_details.class_id';
COMMENT ON COLUMN faculty_classes.subject_id IS 'References subjects.id - which subject the faculty teaches to this class';
COMMENT ON COLUMN faculty_classes.is_active IS 'Whether this assignment is currently active';

-- Update faculty_subjects table if it exists (add foreign key to subjects table)
-- First check if we need to add the subject_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faculty_subjects' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE faculty_subjects ADD COLUMN subject_id BIGINT;
    
    -- Try to match existing records to subjects table by subject_code
    UPDATE faculty_subjects fs
    SET subject_id = s.id
    FROM subjects s
    WHERE fs.subject_code = s.code;
    
    -- Add foreign key constraint
    ALTER TABLE faculty_subjects 
    ADD CONSTRAINT fk_faculty_subjects_subject 
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create view for easy querying of faculty assignments
CREATE OR REPLACE VIEW faculty_assignment_view AS
SELECT 
  fc.id,
  fc.faculty_id,
  f.fname || ' ' || f.lname AS faculty_name,
  f.department AS faculty_department,
  fc.class_id,
  cd.class_name,
  cd.department AS class_department,
  cd.semester,
  cd.academic_year,
  fc.subject_id,
  s.name AS subject_name,
  s.code AS subject_code,
  fc.assigned_at,
  fc.is_active
FROM faculty_classes fc
LEFT JOIN faculty f ON fc.faculty_id = f.user_id
LEFT JOIN class_details cd ON fc.class_id = cd.class_id
LEFT JOIN subjects s ON fc.subject_id = s.id
WHERE fc.is_active = true;

COMMENT ON VIEW faculty_assignment_view IS 'Comprehensive view of faculty class and subject assignments';

-- Function to get classes for a faculty member
CREATE OR REPLACE FUNCTION get_faculty_classes(p_faculty_id VARCHAR)
RETURNS TABLE (
  class_id VARCHAR,
  class_name VARCHAR,
  department VARCHAR,
  semester INT,
  academic_year VARCHAR,
  subject_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cd.class_id,
    cd.class_name,
    cd.department,
    cd.semester,
    cd.academic_year,
    COUNT(DISTINCT fc.subject_id) as subject_count
  FROM faculty_classes fc
  JOIN class_details cd ON fc.class_id = cd.class_id
  WHERE fc.faculty_id = p_faculty_id
    AND fc.is_active = true
  GROUP BY cd.class_id, cd.class_name, cd.department, cd.semester, cd.academic_year;
END;
$$ LANGUAGE plpgsql;

-- Function to get subjects for a faculty member for a specific class
CREATE OR REPLACE FUNCTION get_faculty_subjects_for_class(
  p_faculty_id VARCHAR,
  p_class_id VARCHAR
)
RETURNS TABLE (
  subject_id BIGINT,
  subject_name VARCHAR,
  subject_code VARCHAR,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    s.id,
    s.name,
    s.code,
    s.description
  FROM faculty_classes fc
  JOIN subjects s ON fc.subject_id = s.id
  WHERE fc.faculty_id = p_faculty_id
    AND fc.class_id = p_class_id
    AND fc.is_active = true
    AND s.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check if faculty can teach a subject to a class
CREATE OR REPLACE FUNCTION can_faculty_teach_subject_to_class(
  p_faculty_id VARCHAR,
  p_class_id VARCHAR,
  p_subject_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM faculty_classes
    WHERE faculty_id = p_faculty_id
      AND class_id = p_class_id
      AND subject_id = p_subject_id
      AND is_active = true
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional - comment out in production)
-- Assumes you have faculty with user_id 'FAC001' and classes exist
/*
INSERT INTO faculty_classes (faculty_id, class_id, subject_id)
SELECT 'FAC001', 'CS-4-A', s.id
FROM subjects s
WHERE s.code IN ('CS101', 'CS201', 'CS301')
ON CONFLICT (faculty_id, class_id, subject_id) DO NOTHING;
*/
