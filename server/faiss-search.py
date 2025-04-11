import sys
import json
import os
import pickle
import random
import pandas as pd
import numpy as np

# Path to the data files
DATA_PATH = 'attached_assets/thirukkural_data.pkl'

# Load Thirukkural data from pickle file
def load_thirukkural_data():
    try:
        # Check if the file exists
        if not os.path.exists(DATA_PATH):
            return {"error": f"Data file not found at {DATA_PATH}"}
        
        # Load the data
        with open(DATA_PATH, 'rb') as f:
            data = pickle.load(f)
            
            # Convert DataFrame to list of dictionaries if needed
            if isinstance(data, pd.DataFrame):
                # Log to stderr so it doesn't affect our JSON output
                sys.stderr.write(f"Found DataFrame with columns: {data.columns.tolist()}\n")
                return data.to_dict('records')
            elif hasattr(data, 'thirukkurals') and isinstance(data.thirukkurals, pd.DataFrame):
                sys.stderr.write(f"Found DataFrame in data.thirukkurals\n")
                return data.thirukkurals.to_dict('records')
            else:
                sys.stderr.write(f"Data type: {type(data)}\n")
                # Try to handle other common formats
                if isinstance(data, dict) and 'thirukkurals' in data:
                    return data['thirukkurals']
                elif isinstance(data, list):
                    return data
                
                # If we can't determine the format, return as is and let downstream code handle it
                return data
    except Exception as e:
        return {"error": f"Failed to load data: {str(e)}"}

# Simple keyword-based search since we can't use FAISS
def simple_search(query, limit=5, data=None):
    try:
        if not data:
            data = load_thirukkural_data()
            
        if isinstance(data, dict) and "error" in data:
            return data
        
        # Convert DataFrame to dictionary list if needed
        if isinstance(data, pd.DataFrame):
            data = data.to_dict('records')
        
        # Map DataFrame column names to our expected format
        column_mapping = {
            'ID': 'number',
            'Kural': 'tamil',
            'Couplet': 'english',
            'Vilakam': 'tamil_explanation',
            'M_Varadharajanar': 'english_explanation',
            'Adhigaram_ID': 'chapter',
            'Adhigaram': 'chapter_name',
            'Paal': 'section_name'
        }
        
        # Normalize query
        query = query.lower()
        query_words = query.split()
        
        # Score each kural based on keyword matching
        scored_kurals = []
        for kural in data:
            if not isinstance(kural, dict):
                continue
            
            # Apply column mapping
            mapped_kural = {}
            for df_col, our_col in column_mapping.items():
                if df_col in kural:
                    mapped_kural[our_col] = kural[df_col]
            
            # Use either mapped values or original if available
            score = 0
            
            # Extract text fields for searching
            fields_to_search = []
            
            # Try both mapped and original field names
            for field in ['tamil', 'english', 'tamil_explanation', 'english_explanation',
                         'Kural', 'Couplet', 'Vilakam', 'M_Varadharajanar', 
                         'combined_text_tamil', 'combined_text_english',
                         'Parimezhalagar_Urai', 'Kalaingar_Urai', 'Solomon_Pappaiya']:
                if field in mapped_kural:
                    value = mapped_kural[field]
                elif field in kural:
                    value = kural[field]
                else:
                    continue
                
                # Convert to string and lowercase
                if value is not None:
                    if not isinstance(value, str):
                        value = str(value)
                    fields_to_search.append(value.lower())
            
            # Combine all text for searching
            all_text = " ".join(fields_to_search)
            
            # Score based on word matches
            for word in query_words:
                if word in all_text:
                    score += 1
            
            if score > 0:
                # Get number from mapped kural or original - fallback to ID
                if 'number' in mapped_kural:
                    kural_number = mapped_kural['number']
                elif 'ID' in kural:
                    kural_number = kural['ID']
                else:
                    kural_number = 0
                
                # Ensure we have a number, not a pandas object
                if hasattr(kural_number, 'item'):
                    kural_number = kural_number.item()
                
                scored_kurals.append({
                    "number": kural_number,
                    "score": score,
                    "relevance": score / len(query_words) if len(query_words) > 0 else 0
                })
        
        # Sort by score and take top results
        scored_kurals.sort(key=lambda x: x["score"], reverse=True)
        results = scored_kurals[:limit]
        
        # If no matches found, return random kurals
        if not results:
            try:
                random_indexes = random.sample(range(len(data)), min(limit, len(data)))
                results = []
                for idx in random_indexes:
                    if 0 <= idx < len(data):
                        kural = data[idx]
                        
                        # Get number field (mapped or original)
                        if 'ID' in kural:
                            kural_number = kural['ID']
                        elif 'number' in kural:
                            kural_number = kural['number']
                        else:
                            kural_number = idx + 1
                            
                        # Ensure we have a number, not a pandas object
                        if hasattr(kural_number, 'item'):
                            kural_number = kural_number.item()
                            
                        results.append({
                            "number": kural_number,
                            "score": 0,
                            "relevance": 0.1,
                            "is_random": True
                        })
            except Exception as e:
                sys.stderr.write(f"Error generating random results: {e}\n")
                results = []
        
        return results
    except Exception as e:
        sys.stderr.write(f"Error in search: {e}\n")
        return {"error": f"Search failed: {str(e)}"}

if __name__ == "__main__":
    # Get arguments
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
    
    # Special command to just load the data
    if sys.argv[1] == 'load_data_only':
        data = load_thirukkural_data()
        print(json.dumps(data))
        sys.exit(0)
    
    query = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    # Load data
    data = load_thirukkural_data()
    
    # Perform search
    results = simple_search(query, limit, data)
    
    # Return results as JSON
    print(json.dumps(results))
