# Dynamic Report Configuration System

## Overview

The Dynamic Report Configuration System allows administrators and service heads to configure all aspects of the report submission form without modifying code. This includes:

- **Form Fields**: Add, edit, or remove report fields dynamically
- **Field Types**: Support for text, textarea, select, multiselect, number, and file inputs
- **ML Model Weights**: Configure machine learning weights for priority prediction
- **Real-time Sync**: Changes instantly sync to the Python ML service

---

## System Architecture

### Frontend Components

1. **Report Configuration Page** (`src/pages/ReportConfiguration.tsx`)
   - Admin UI for managing report form fields and ML weights
   - Tabs: "Form Fields" and "ML Weights"
   - Real-time CRUD operations on field configurations
   - Sync button to push weight updates to Python backend

2. **Report Configuration Service** (`src/services/reportConfigService.ts`)
   - Service layer for interacting with Supabase database
   - Functions for field and weight management
   - `syncWeightsToMLService()` - Communicates with Python backend

### Backend (Python Flask - app.py)

1. **Dynamic Weight Loading**
   - `load_weights_from_database()` - Loads ML weights from Supabase on startup
   - Automatically falls back to defaults if database unavailable

2. **API Endpoints**
   - `/sync_weights` (POST) - Reloads weights from database
   - `/train` (POST) - Trains model with current weights
   - `/predict` (POST) - Predicts priority for a single report
   - `/update_priorities` (POST) - Updates all report priorities

3. **Dynamic Field Options**
   - `get_dynamic_field_options()` - Fetches field options from database
   - Used for synthetic dataset generation and validation

### Database Tables

1. **`report_field_config`** - Stores field definitions
   ```sql
   - id: bigint (Primary Key)
   - field_name: text (Unique) - Internal field name
   - field_label: text - Display label shown to users
   - field_type: text - Type: text, textarea, select, multiselect, number, file
   - options: jsonb - Options array for select/multiselect fields
   - is_required: boolean - Whether field is mandatory
   - is_active: boolean - Whether field is currently enabled
   - display_order: integer - Order in which field appears in form
   ```

2. **`category_weights`** - ML weights for problem categories
   ```sql
   - id: bigint (Primary Key)
   - category: text (Unique) - Problem category name
   - weight: integer - Weight value (1-3)
   - is_active: boolean - Whether category is active
   ```

3. **`impact_weights`** - ML weights for impact scope
   ```sql
   - id: bigint (Primary Key)
   - impact_scope: text (Unique) - Impact scope description
   - weight: integer - Weight value (1-3)
   - is_active: boolean - Whether scope is active
   ```

4. **`occurrence_weights`** - ML weights for occurrence patterns
   ```sql
   - id: bigint (Primary Key)
   - occurrence_pattern: text (Unique) - Occurrence pattern description
   - weight: integer - Weight value (1-3)
   - is_active: boolean - Whether pattern is active
   ```

---

## Setup Instructions

### 1. Database Setup

Run the SQL schema file to create all required tables:

```sql
-- Execute report_config_schema.sql in your Supabase SQL Editor
-- This creates all tables and inserts default data
```

### 2. Python Backend Setup

1. Ensure your Python environment has all dependencies:
   ```bash
   pip install flask flask-cors pandas numpy scikit-learn joblib supabase
   ```

2. Start the Flask server:
   ```bash
   python app.py
   ```
   
   The server will:
   - Load weights from database on startup
   - Train initial ML model if none exists
   - Start on `localhost:5000`

### 3. Frontend Setup

No additional setup required. The system is ready to use once the route is added to your app.

---

## Usage Guide

### For Admins/Service Heads

#### Managing Form Fields

1. Navigate to **Report Config** in the admin navigation menu

2. **View Fields**: See all configured fields in a table
   - Field Name (internal identifier)
   - Field Label (shown to users)
   - Field Type (text, select, etc.)
   - Options (for select fields)
   - Required status
   - Active status
   - Display order

3. **Add New Field**:
   - Click "Add New Field" button
   - Fill in the form:
     - **Field Name**: Internal name (e.g., `Location`)
     - **Field Label**: Display label (e.g., `Report Location`)
     - **Field Type**: Choose from dropdown
     - **Options**: For select/multiselect, enter comma-separated values
     - **Display Order**: Number determining field position
     - **Required**: Check if field is mandatory
   - Click "Add Field"

4. **Edit Field**:
   - Click edit icon (✏️) on any field row
   - Modify field properties
   - Click "Update Field"

5. **Toggle Active Status**:
   - Click toggle switch to activate/deactivate field
   - Inactive fields won't appear in report form

6. **Delete Field**:
   - Click delete icon (🗑️)
   - Confirm deletion in dialog
   - Field is permanently removed

#### Managing ML Weights

1. Switch to **ML Weights** tab

2. **Category Weights**:
   - View all problem categories
   - Adjust weight (1-3) for each category
   - Higher weights = higher priority prediction
   - Click "Update" to save changes

3. **Impact Weights**:
   - Adjust weights for different impact scopes
   - Examples: Single person, Whole class, Everyone

4. **Occurrence Weights**:
   - Adjust weights for occurrence patterns
   - Examples: First occurrence, Recurring, Daily, Weekly

5. **Sync to ML Service**:
   - After making weight changes, click "Sync to ML Service"
   - This sends updated weights to Python backend
   - Backend immediately reloads weights from database
   - ML model uses new weights for priority predictions

---

## ML Model Integration

### How Priority Prediction Works

1. **Weight Calculation**:
   ```
   priority_score = category_weight × impact_weight × occurrence_weight
   ```

2. **Priority Level Mapping**:
   - `priority_score >= 12`: **Critical** (Level 3)
   - `priority_score >= 6`: **High** (Level 2)
   - `priority_score >= 3`: **Medium** (Level 1)
   - `priority_score < 3`: **Low** (Level 0)

3. **ML Model Training**:
   - Model uses RandomForestClassifier
   - Features: Problem_Category, Reporter_Type, Location, Impact_Scope, Occurrence_Pattern
   - Target: priority_level (0-3)
   - Automatically retrains with new weights when `/train` is called

### API Flow

```
1. Admin updates weights in UI
   ↓
2. Frontend calls syncWeightsToMLService()
   ↓
3. POST request to Python /sync_weights endpoint
   ↓
4. Python calls load_weights_from_database()
   ↓
5. Weights reloaded from Supabase
   ↓
6. All future predictions use new weights
```

---

## Default Configuration

### Default Fields

The system comes pre-configured with these fields:

1. **Problem_Category** (select)
   - Options: Infrastructure, IT/Technical, Academic, Administrative, Safety/Security, Maintenance

2. **Reporter_Type** (select)
   - Options: Student, Faculty, Admin, Visitor

3. **Location** (select)
   - Options: Class, Lab, Center Square, Hall, Institute

4. **Impact_Scope** (select)
   - Options: Single person affected, Whole class affected, Everyone affected

5. **Occurrence_Pattern** (select)
   - Options: First occurrence, Recurring issue, Daily, Weekly

6. **Description** (textarea)
   - Long-form text input for detailed description

7. **Photos** (file)
   - Upload supporting images/documents

### Default Weights

**Category Weights:**
- Infrastructure: 2
- IT/Technical: 2
- Academic: 1
- Administrative: 1
- Safety/Security: 3
- Maintenance: 2

**Impact Weights:**
- Single person affected: 1
- Whole class affected: 2
- Everyone affected: 3

**Occurrence Weights:**
- First occurrence: 1
- Recurring issue: 2
- Daily: 3
- Weekly: 2

---

## Advanced Features

### Field Types Explained

1. **text**: Single-line text input
   - Use for: Names, short descriptions, IDs

2. **textarea**: Multi-line text input
   - Use for: Long descriptions, comments, notes

3. **select**: Dropdown with single selection
   - Use for: Categories, types, single-choice options
   - Requires: `options` array

4. **multiselect**: Dropdown with multiple selection
   - Use for: Tags, multiple categories, multiple choices
   - Requires: `options` array

5. **number**: Numeric input
   - Use for: Class numbers, room numbers, quantities

6. **file**: File upload
   - Use for: Photos, documents, evidence

### Field Ordering

- `display_order` determines the order fields appear in the form
- Lower numbers appear first (e.g., 1, 2, 3)
- Fields with same order are sorted alphabetically by field_name

### Required vs Optional Fields

- **Required fields** (`is_required: true`): Must be filled before form submission
- **Optional fields** (`is_required: false`): Can be left empty

### Active vs Inactive Fields

- **Active fields** (`is_active: true`): Visible in report form
- **Inactive fields** (`is_active: false`): Hidden but preserved in database
  - Useful for temporarily disabling fields without losing configuration

---

## Troubleshooting

### Issue: Weights not syncing to Python

**Solution:**
1. Ensure Python Flask server is running on `localhost:5000`
2. Check browser console for CORS errors
3. Verify Python console shows "Loaded X category weights" on startup
4. Try clicking "Sync to ML Service" button again

### Issue: ML predictions not reflecting new weights

**Solution:**
1. After syncing weights, retrain the model:
   - POST to `http://localhost:5000/train?synthetic=true`
2. Or update all report priorities:
   - POST to `http://localhost:5000/update_priorities`

### Issue: New field not appearing in report form

**Solution:**
1. Verify field has `is_active: true`
2. Check `display_order` is set
3. Ensure report submission page is fetching fields from `report_field_config` table

### Issue: Database connection errors

**Solution:**
1. Verify Supabase credentials in `app.py`
2. Check internet connection
3. Ensure tables exist in Supabase dashboard
4. Run `report_config_schema.sql` if tables are missing

---

## API Reference

### Frontend Service Functions

```typescript
// Fetch all active field configurations
fetchReportFieldConfigs(): Promise<ReportFieldConfig[]>

// Create new field
createFieldConfig(config: Omit<ReportFieldConfig, 'id'>): Promise<void>

// Update existing field
updateFieldConfig(id: number, updates: Partial<ReportFieldConfig>): Promise<void>

// Delete field
deleteFieldConfig(id: number): Promise<void>

// Fetch category weights
fetchCategoryWeights(): Promise<CategoryWeight[]>

// Update category weight
updateCategoryWeight(id: number, weight: number): Promise<void>

// Fetch impact weights
fetchImpactWeights(): Promise<ImpactWeight[]>

// Update impact weight
updateImpactWeight(id: number, weight: number): Promise<void>

// Fetch occurrence weights
fetchOccurrenceWeights(): Promise<OccurrenceWeight[]>

// Update occurrence weight
updateOccurrenceWeight(id: number, weight: number): Promise<void>

// Sync weights to Python ML service
syncWeightsToMLService(): Promise<boolean>
```

### Python API Endpoints

```python
# Reload weights from database
POST /sync_weights
Response: {
  "status": "success",
  "message": "Weights reloaded from database successfully",
  "weights": {
    "categories": {...},
    "impact": {...},
    "occurrence": {...}
  }
}

# Train ML model
POST /train?synthetic=true
Response: {
  "status": "success",
  "message": "Model trained successfully"
}

# Predict priority for single report
POST /predict
Body: {
  "Problem_Category": "Infrastructure",
  "Reporter_Type": "Student",
  "Location": "Class",
  "Impact_Scope": "Whole class affected",
  "Occurrence_Pattern": "Recurring issue"
}
Response: {
  "status": "success",
  "priority_level": 2,
  "priority_text": "High",
  "confidence": 0.85
}

# Update all report priorities
POST /update_priorities
Response: {
  "status": "success",
  "message": "Updated 42 reports"
}

# Health check
GET /health
Response: {
  "status": "healthy"
}
```

---

## Best Practices

### For Field Configuration

1. **Naming Conventions**:
   - Use clear, descriptive field names
   - Use snake_case for field_name (e.g., `problem_category`)
   - Use proper capitalization for field_label (e.g., `Problem Category`)

2. **Field Organization**:
   - Group related fields together using display_order
   - Place important/required fields at the top
   - Place optional fields (like Description, Photos) at the bottom

3. **Options Management**:
   - Keep option lists concise (5-10 items max)
   - Use clear, unambiguous option text
   - Order options logically (alphabetically or by importance)

### For ML Weight Configuration

1. **Weight Assignment**:
   - Use weight 3 for critical/urgent items
   - Use weight 2 for important items
   - Use weight 1 for standard items

2. **Testing Changes**:
   - After changing weights, test with sample reports
   - Verify priority predictions make sense
   - Adjust weights iteratively based on results

3. **Retraining**:
   - Retrain ML model after significant weight changes
   - Use synthetic data for testing: `/train?synthetic=true`
   - Use real data for production: `/train?synthetic=false`

---

## Future Enhancements

### Potential Features

1. **Field Validation Rules**:
   - Min/max length for text fields
   - Min/max values for number fields
   - Allowed file types for file fields
   - Regex patterns for validation

2. **Conditional Fields**:
   - Show/hide fields based on other field values
   - Example: Show "Class_No" only if Location is "Class" or "Lab"

3. **Field Dependencies**:
   - Link fields to dynamically populate options
   - Example: Select Institute → Load Locations for that institute

4. **Version History**:
   - Track configuration changes over time
   - Rollback to previous configurations
   - Audit log of who changed what

5. **Field Groups**:
   - Organize fields into logical sections/tabs
   - Collapsible sections for better UX

6. **Multi-language Support**:
   - Translate field labels and options
   - Support multiple languages for international users

7. **Field Templates**:
   - Save and reuse common field configurations
   - Import/export field setups

---

## Security Considerations

1. **Access Control**:
   - Only admins and service heads can access Report Configuration page
   - Protect `/report-configuration` route with AdminRoute wrapper

2. **Input Validation**:
   - Validate all field inputs before saving
   - Sanitize user-provided option values
   - Prevent SQL injection in field names/labels

3. **Database Permissions**:
   - Ensure proper RLS (Row Level Security) policies in Supabase
   - Restrict write access to configuration tables

4. **API Security**:
   - Python backend should validate all incoming requests
   - Implement rate limiting on ML endpoints
   - Use HTTPS in production

---

## Support & Maintenance

### Monitoring

1. **Database Health**:
   - Monitor table sizes and query performance
   - Check for orphaned/unused fields
   - Review active vs inactive field ratios

2. **ML Service Health**:
   - Monitor `/health` endpoint
   - Track prediction accuracy over time
   - Review model training logs

3. **User Activity**:
   - Track configuration change frequency
   - Monitor field usage in report submissions
   - Analyze most common field values

### Maintenance Tasks

1. **Regular Cleanup**:
   - Archive old, unused fields
   - Remove duplicate options
   - Optimize field ordering

2. **Model Retraining**:
   - Retrain ML model weekly with real data
   - Update weights based on priority feedback
   - Monitor prediction accuracy

3. **Documentation Updates**:
   - Keep this guide in sync with code changes
   - Document new field types or features
   - Update API reference as endpoints change

---

## Conclusion

The Dynamic Report Configuration System provides complete flexibility in managing report forms and ML priority predictions without touching code. By leveraging this system, administrators can adapt the report submission process to changing institutional needs, ensuring the system remains relevant and effective over time.

For additional support or feature requests, consult the development team.
