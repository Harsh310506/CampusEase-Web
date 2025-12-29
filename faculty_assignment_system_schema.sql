-- ==========================================
-- Faculty Assignment System - Complete Schema
-- ==========================================
-- Purpose: Manage faculty-class-subject assignments with proper relationships
-- Version: 1.0
-- Date: 2024

-- ==========================================
-- 1. Create faculty_classes table
-- ==========================================
-- This table links faculty to classes and subjects they teach
-- Replaces the old faculty_class_assignments approach

DROP TABLE IF EXISTS faculty_classes CASCADE;

CREATE TABLE faculty_classes (
    id SERIAL PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    subject_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES class_details(class_id) ON DELETE CASCADE,
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT unique_faculty_class_subject UNIQUE (faculty_id, class_id, subject_id)
);

-- Create indexes for performance
CREATE INDEX idx_faculty_classes_faculty ON faculty_classes(faculty_id) WHERE is_active = TRUE;
CREATE INDEX idx_faculty_classes_class ON faculty_classes(class_id) WHERE is_active = TRUE;
CREATE INDEX idx_faculty_classes_subject ON faculty_classes(subject_id) WHERE is_active = TRUE;

-- Add comments
COMMENT ON TABLE faculty_classes IS 'Links faculty members to the classes and subjects they teach';
COMMENT ON COLUMN faculty_classes.faculty_id IS 'Reference to faculty member user_id';
COMMENT ON COLUMN faculty_classes.class_id IS 'Reference to class identifier';
COMMENT ON COLUMN faculty_classes.subject_id IS 'Reference to subject being taught';
COMMENT ON COLUMN faculty_classes.is_active IS 'Soft delete flag - FALSE means assignment is removed';

-- ==========================================
-- 2. Create comprehensive view for assignments
-- ==========================================
-- This view provides a complete picture of faculty assignments

CREATE OR REPLACE VIEW faculty_assignment_view AS
SELECT 
    fc.id,
    fc.faculty_id,
    CONCAT(f.fname, ' ', f.lname) AS faculty_name,
    f.department AS faculty_department,
    fc.class_id,
    c.class_name,
    c.department AS class_department,
    c.semester,
    c.academic_year,
    fc.subject_id,
    s.name AS subject_name,
    s.code AS subject_code,
    fc.assigned_at,
    fc.is_active
FROM faculty_classes fc
JOIN faculty f ON fc.faculty_id = f.user_id
JOIN class_details c ON fc.class_id = c.class_id
JOIN subjects s ON fc.subject_id = s.id;

COMMENT ON VIEW faculty_assignment_view IS 'Comprehensive view of faculty-class-subject assignments with all related details';

-- ==========================================
-- 3. Database Functions for Assignment Management
-- ==========================================

-- Function: Get all classes assigned to a faculty member
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
        c.class_id,
        c.class_name,
        c.department,
        c.semester,
        c.academic_year,
        COUNT(DISTINCT fc.subject_id) AS subject_count
    FROM class_details c
    JOIN faculty_classes fc ON c.class_id = fc.class_id
    WHERE fc.faculty_id = p_faculty_id
      AND fc.is_active = TRUE
    GROUP BY c.class_id, c.class_name, c.department, c.semester, c.academic_year
    ORDER BY c.department, c.semester, c.class_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_faculty_classes IS 'Returns all classes assigned to a specific faculty member with subject count';

-- Function: Get subjects a faculty teaches for a specific class
CREATE OR REPLACE FUNCTION get_faculty_subjects_for_class(
    p_faculty_id VARCHAR,
    p_class_id VARCHAR
)
RETURNS TABLE (
    subject_id INT,
    subject_name VARCHAR,
    subject_code VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.code,
        s.description
    FROM subjects s
    JOIN faculty_classes fc ON s.id = fc.subject_id
    WHERE fc.faculty_id = p_faculty_id
      AND fc.class_id = p_class_id
      AND fc.is_active = TRUE
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_faculty_subjects_for_class IS 'Returns subjects a faculty teaches for a specific class';

-- Function: Check if faculty can teach a subject to a class
CREATE OR REPLACE FUNCTION can_faculty_teach_subject_to_class(
    p_faculty_id VARCHAR,
    p_class_id VARCHAR,
    p_subject_id INT
)
RETURNS BOOLEAN AS $$
DECLARE
    assignment_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM faculty_classes
        WHERE faculty_id = p_faculty_id
          AND class_id = p_class_id
          AND subject_id = p_subject_id
          AND is_active = TRUE
    ) INTO assignment_exists;
    
    RETURN assignment_exists;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_faculty_teach_subject_to_class IS 'Checks if a faculty member is authorized to teach a subject to a specific class';

-- Function: Get faculty assignment statistics
CREATE OR REPLACE FUNCTION get_faculty_assignment_stats(p_faculty_id VARCHAR)
RETURNS TABLE (
    total_classes BIGINT,
    total_subjects BIGINT,
    total_assignments BIGINT,
    departments TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT fc.class_id) AS total_classes,
        COUNT(DISTINCT fc.subject_id) AS total_subjects,
        COUNT(*) AS total_assignments,
        ARRAY_AGG(DISTINCT c.department) AS departments
    FROM faculty_classes fc
    JOIN class_details c ON fc.class_id = c.class_id
    WHERE fc.faculty_id = p_faculty_id
      AND fc.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_faculty_assignment_stats IS 'Returns statistics about faculty assignments';

-- ==========================================
-- 4. Grant Permissions (Optional)
-- ==========================================

-- Grant appropriate permissions (adjust based on your security model)
-- GRANT SELECT ON faculty_classes TO authenticated;
-- GRANT SELECT ON faculty_assignment_view TO authenticated;
-- GRANT ALL ON faculty_classes TO service_role;

-- ==========================================
-- 5. Verification Queries (Commented - For Testing)
-- ==========================================

-- Check assignments
-- SELECT * FROM faculty_assignment_view WHERE is_active = TRUE ORDER BY faculty_name, class_name;

-- Check faculty's classes (replace 'FACULTY_ID' with actual faculty user_id)
-- SELECT * FROM get_faculty_classes('FACULTY_ID');

-- Check faculty's subjects for a class
-- SELECT * FROM get_faculty_subjects_for_class('FACULTY_ID', 'CLASS_ID');

-- Check if faculty can teach
-- SELECT can_faculty_teach_subject_to_class('FACULTY_ID', 'CLASS_ID', SUBJECT_ID);

-- Get faculty stats
-- SELECT * FROM get_faculty_assignment_stats('FACULTY_ID');

-- ==========================================
-- 6. Migration Notes (Optional)
-- ==========================================

-- If you have existing data in faculty_subjects table, you can migrate it:
-- INSERT INTO faculty_classes (faculty_id, class_id, subject_id)
-- SELECT DISTINCT 
--     fs.faculty_id,
--     'DEFAULT-CLASS' AS class_id,  -- You'll need to determine appropriate class
--     fs.subject_id
-- FROM faculty_subjects fs
-- WHERE NOT EXISTS (
--     SELECT 1 FROM faculty_classes fc 
--     WHERE fc.faculty_id = fs.faculty_id 
--     AND fc.subject_id = fs.subject_id
-- );

-- ==========================================
-- END OF SCHEMA
-- ==========================================
