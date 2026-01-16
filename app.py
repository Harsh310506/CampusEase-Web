from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
import time
import json
import random
from supabase import create_client, Client
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Initialize Supabase client
supabase_url = "https://jfricqlqhddznvliwwpt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0"
supabase = create_client(supabase_url, supabase_key)

# Priority levels
PRIORITY_LEVELS = {
    3: "Critical",
    2: "High", 
    1: "Medium",
    0: "Low"
}

# Global dictionaries for dynamic weights (will be loaded from database)
CATEGORY_WEIGHTS = {}
IMPACT_WEIGHTS = {}
OCCURRENCE_WEIGHTS = {}

def load_weights_from_database():
    """Load weights dynamically from Supabase database"""
    global CATEGORY_WEIGHTS, IMPACT_WEIGHTS, OCCURRENCE_WEIGHTS
    
    try:
        # Load category weights
        cat_response = supabase.table('category_weights').select('*').eq('is_active', True).execute()
        if cat_response.data:
            CATEGORY_WEIGHTS = {item['category']: item['weight'] for item in cat_response.data}
            print(f"Loaded {len(CATEGORY_WEIGHTS)} category weights")
        
        # Load impact weights
        impact_response = supabase.table('impact_weights').select('*').eq('is_active', True).execute()
        if impact_response.data:
            IMPACT_WEIGHTS = {item['impact_scope']: item['weight'] for item in impact_response.data}
            print(f"Loaded {len(IMPACT_WEIGHTS)} impact weights")
        
        # Load occurrence weights
        occ_response = supabase.table('occurrence_weights').select('*').eq('is_active', True).execute()
        if occ_response.data:
            OCCURRENCE_WEIGHTS = {item['occurrence_pattern']: item['weight'] for item in occ_response.data}
            print(f"Loaded {len(OCCURRENCE_WEIGHTS)} occurrence weights")
            
        return True
    except Exception as e:
        print(f"Error loading weights from database: {e}")
        # Fall back to default weights
        CATEGORY_WEIGHTS = {
            "Infrastructure": 2,
            "IT/Technical": 2,
            "Academic": 1,
            "Administrative": 1,
            "Safety/Security": 3,
            "Maintenance": 2
        }
        IMPACT_WEIGHTS = {
            "Single person affected": 1,
            "Whole class affected": 2,
            "Everyone affected": 3
        }
        OCCURRENCE_WEIGHTS = {
            "First occurrence": 1,
            "Recurring issue": 2,
            "Daily": 3,
            "Weekly": 2
        }
        return False

def get_dynamic_field_options():
    """Fetch dynamic field options from database"""
    try:
        response = supabase.table('report_field_config').select('*').eq('is_active', True).execute()
        if response.data:
            field_options = {}
            for field in response.data:
                if field['field_type'] in ['select', 'multiselect'] and field['options']:
                    field_options[field['field_name']] = field['options']
            return field_options
        return {}
    except Exception as e:
        print(f"Error fetching field options: {e}")
        return {}

# Create a synthetic dataset for initial training
def create_synthetic_dataset(num_samples=100):
    """Create a synthetic dataset for training the model using dynamic categories"""
    # Load current weights from database
    load_weights_from_database()
    
    categories = list(CATEGORY_WEIGHTS.keys())
    impact_scopes = list(IMPACT_WEIGHTS.keys())
    occurrence_patterns = list(OCCURRENCE_WEIGHTS.keys())
    
    # Get dynamic field options
    field_options = get_dynamic_field_options()
    reporter_types = field_options.get('Reporter_Type', ["Student", "Faculty", "Admin", "Visitor"])
    locations = field_options.get('Location', ["Class", "Lab", "Center Square", "Hall", "Institute"])
    
    synthetic_data = []
    
    for i in range(num_samples):
        category = random.choice(categories)
        reporter_type = random.choice(reporter_types)
        location = random.choice(locations)
        impact = random.choice(impact_scopes)
        occurrence = random.choice(occurrence_patterns)
        
        # Calculate priority score based on rules
        category_weight = CATEGORY_WEIGHTS.get(category, 1)
        impact_weight = IMPACT_WEIGHTS.get(impact, 1)
        occurrence_weight = OCCURRENCE_WEIGHTS.get(occurrence, 1)
        
        priority_score = category_weight * impact_weight * occurrence_weight
        
        # Map to priority level
        if priority_score >= 12:
            priority_level = 3  # Critical
        elif priority_score >= 6:
            priority_level = 2  # High
        elif priority_score >= 3:
            priority_level = 1  # Medium
        else:
            priority_level = 0  # Low
            
        priority_text = PRIORITY_LEVELS[priority_level]
        
        # Create sample record
        record = {
            "id": i + 1,
            "Problem_Category": category,
            "Reporter_Type": reporter_type,
            "Location": location,
            "class_No": random.randint(100, 500) if location in ["Class", "Lab"] else None,
            "Impact_Scope": impact,
            "Occurrence_Pattern": occurrence,
            "priority_level": priority_level,
            "priority_text": priority_text
        }
        
        synthetic_data.append(record)
    
    return pd.DataFrame(synthetic_data)

def train_model_with_dataset():
    """Train the ML model using a synthetic dataset"""
    try:
        print("Creating synthetic dataset for training...")
        df = create_synthetic_dataset(200)  # Create 200 synthetic samples
        
        # Save the synthetic dataset for reference
        df.to_csv('synthetic_training_data.csv', index=False)
        
        # Feature engineering
        df['category_weight'] = df['Problem_Category'].map(CATEGORY_WEIGHTS).fillna(1)
        df['impact_weight'] = df['Impact_Scope'].map(IMPACT_WEIGHTS).fillna(1)
        df['occurrence_weight'] = df['Occurrence_Pattern'].map(OCCURRENCE_WEIGHTS).fillna(1)
        
        # Create a priority score (target variable)
        df['priority_score'] = (df['category_weight'] * df['impact_weight'] * 
                               df['occurrence_weight']).astype(int)
        
        # Prepare features for training
        features = pd.get_dummies(
            df[['Problem_Category', 'Reporter_Type', 'Location', 'Impact_Scope', 'Occurrence_Pattern']], 
            drop_first=False
        )
        
        # Train the model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(features, df['priority_level'])
        
        # Model evaluation
        y_pred = model.predict(features)
        acc = accuracy_score(df['priority_level'], y_pred)
        report = classification_report(df['priority_level'], y_pred)
        cm = confusion_matrix(df['priority_level'], y_pred)
        print('Accuracy:', acc)
        print('Classification Report:', report)
        print('Confusion Matrix:', cm)
        
        # Save the model
        joblib.dump(model, 'priority_model.pkl')
        
        # Also save the feature columns for future prediction
        joblib.dump(features.columns.tolist(), 'feature_columns.pkl')
        
        # Save metrics to file
        with open('model_metrics.txt', 'w') as f:
            f.write(f'Accuracy: {acc}\n')
            f.write(f'Classification Report:\n{report}\n')
            f.write(f'Confusion Matrix:\n{cm}\n')
        
        print("Model trained successfully with synthetic data!")
        return True
    except Exception as e:
        print(f"Error training model with dataset: {e}")
        return False

def train_model_with_real_data():
    """Train the ML model based on existing data and rules"""
    try:
        # Fetch existing reports from Supabase
        response = supabase.table('report').select('*').execute()
        reports = response.data
        
        if not reports or len(reports) < 10:
            print("Not enough real reports for training. Using synthetic data instead.")
            return train_model_with_dataset()
            
        # Convert to DataFrame
        df = pd.DataFrame(reports)
        
        # Feature engineering
        df['category_weight'] = df['Problem_Category'].map(CATEGORY_WEIGHTS).fillna(1)
        df['impact_weight'] = df['Impact_Scope'].map(IMPACT_WEIGHTS).fillna(1)
        df['occurrence_weight'] = df['Occurrence_Pattern'].map(OCCURRENCE_WEIGHTS).fillna(1)
        
        # Create a priority score (target variable)
        df['priority_score'] = (df['category_weight'] * df['impact_weight'] * 
                               df['occurrence_weight']).astype(int)
        
        # Map priority scores to priority levels (0-3)
        df['priority_level'] = pd.cut(
            df['priority_score'], 
            bins=[0, 3, 6, 12, 100], 
            labels=[0, 1, 2, 3]
        ).astype(int)
        
        # Prepare features for training
        features = pd.get_dummies(
            df[['Problem_Category', 'Reporter_Type', 'Location', 'Impact_Scope', 'Occurrence_Pattern']], 
            drop_first=False
        )
        
        # Train the model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(features, df['priority_level'])
        
        # Model evaluation
        y_pred = model.predict(features)
        acc = accuracy_score(df['priority_level'], y_pred)
        report = classification_report(df['priority_level'], y_pred)
        cm = confusion_matrix(df['priority_level'], y_pred)
        print('Accuracy:', acc)
        print('Classification Report:', report)
        print('Confusion Matrix:', cm)
        
        # Save the model
        joblib.dump(model, 'priority_model.pkl')
        
        # Also save the feature columns for future prediction
        joblib.dump(features.columns.tolist(), 'feature_columns.pkl')
        
        # Save metrics to file
        with open('model_metrics.txt', 'w') as f:
            f.write(f'Accuracy: {acc}\n')
            f.write(f'Classification Report:\n{report}\n')
            f.write(f'Confusion Matrix:\n{cm}\n')
        
        print("Model trained successfully with real data!")
        return True
    except Exception as e:
        print(f"Error training model with real data: {e}")
        return train_model_with_dataset()  # Fall back to synthetic data

def predict_priority(report):
    """Predict priority level for a single report"""
    try:
        # Calculate rule-based score
        category_weight = CATEGORY_WEIGHTS.get(report.get('Problem_Category', ''), 1)
        impact_weight = IMPACT_WEIGHTS.get(report.get('Impact_Scope', ''), 1)
        occurrence_weight = OCCURRENCE_WEIGHTS.get(report.get('Occurrence_Pattern', ''), 1)
        
        # Rule-based score
        rule_score = category_weight * impact_weight * occurrence_weight
        
        # Convert to ML feature format
        report_df = pd.DataFrame([report])
        
        # Get the trained model
        if os.path.exists('priority_model.pkl') and os.path.exists('feature_columns.pkl'):
            model = joblib.load('priority_model.pkl')
            feature_columns = joblib.load('feature_columns.pkl')
            
            # Create one-hot encoded features
            report_dummies = pd.get_dummies(
                report_df[['Problem_Category', 'Reporter_Type', 'Location', 'Impact_Scope', 'Occurrence_Pattern']]
            )
            
            # Ensure all columns from training are present
            for col in feature_columns:
                if col not in report_dummies.columns:
                    report_dummies[col] = 0
            
            # Keep only the columns used during training
            report_features = report_dummies[feature_columns]
            
            # ML prediction
            proba = model.predict_proba(report_features)
            confidence = float(np.max(proba))
            ml_priority = model.predict(report_features)[0]
            final_priority = ml_priority
        else:
            # Fall back to rule-based scoring if no model exists
            if rule_score >= 12:
                final_priority = 3
            elif rule_score >= 6:
                final_priority = 2
            elif rule_score >= 3:
                final_priority = 1
            else:
                final_priority = 0
            confidence = 0.5
                
        return int(final_priority), PRIORITY_LEVELS[int(final_priority)], confidence
        
    except Exception as e:
        print(f"Error predicting priority: {e}")
        # Default to medium priority if prediction fails
        return 1, "Medium", 0.5

def update_report_priorities():
    """Update priority levels for all reports in the database"""
    try:
        # Get all reports
        response = supabase.table('report').select('*').execute()
        reports = response.data
        
        if not reports:
            print("No reports to update")
            return 0
            
        update_count = 0
        
        # Update priority for each report
        for report in reports:
            priority_level, priority_text, confidence = predict_priority(report)
            
            # Update the report with priority
            result = supabase.table('report').update({
                'priority_level': priority_level,
                'priority_text': priority_text
            }).eq('id', report['id']).execute()
            
            if result.data:
                update_count += 1
                
        print(f"Updated priorities for {update_count} reports")
        return update_count
        
    except Exception as e:
        print(f"Error updating report priorities: {e}")
        return 0

@app.route('/train', methods=['POST'])
def train_endpoint():
    """API endpoint to trigger model training"""
    # Reload weights from database before training
    load_weights_from_database()
    
    use_synthetic = request.args.get('synthetic', 'false').lower() == 'true'
    
    if use_synthetic:
        success = train_model_with_dataset()
    else:
        success = train_model_with_real_data()
        
    if success:
        return jsonify({"status": "success", "message": "Model trained successfully"})
    else:
        return jsonify({"status": "error", "message": "Model training failed"}), 500

@app.route('/sync_weights', methods=['POST'])
def sync_weights():
    """Reload ML weights from database"""
    try:
        success = load_weights_from_database()
        if success:
            return jsonify({
                "status": "success",
                "message": "Weights reloaded from database successfully",
                "weights": {
                    "categories": CATEGORY_WEIGHTS,
                    "impact": IMPACT_WEIGHTS,
                    "occurrence": OCCURRENCE_WEIGHTS
                }
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to load weights from database"
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/update_priorities', methods=['POST'])
def update_priorities_endpoint():
    """API endpoint to update all report priorities"""
    # Reload weights from database before updating priorities
    load_weights_from_database()
    
    count = update_report_priorities()
    return jsonify({"status": "success", "message": f"Updated {count} reports"})

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    """API endpoint to predict priority for a single report"""
    try:
        report = request.json
        priority_level, priority_text, confidence = predict_priority(report)
        return jsonify({
            "status": "success",
            "priority_level": priority_level,
            "priority_text": priority_text,
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    # Load weights from database on startup
    print("Loading weights from database...")
    load_weights_from_database()
    
    # Check if model exists, if not create it
    if not os.path.exists('priority_model.pkl'):
        print("No existing model found. Training new model...")
        train_model_with_dataset()
    
    # Get port from environment variable (Render sets PORT automatically)
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV', 'production') != 'production'
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=port, debug=debug_mode) 