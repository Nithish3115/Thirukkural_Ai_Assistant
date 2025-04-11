import { runPythonScript } from './python-bridge';
import { storage } from './storage';
import { type Thirukkural } from '@shared/schema';

export async function loadThirukkuralData() {
  try {
    console.log('Loading Thirukkural data from Python...');
    
    // Use our Python script to extract the data
    const thirukkuralData = await runPythonScript('faiss-search.py', ['load_data_only']);
    
    if (!Array.isArray(thirukkuralData)) {
      console.error('Failed to load Thirukkural data:', thirukkuralData);
      return false;
    }
    
    console.log(`Successfully loaded ${thirukkuralData.length} Thirukkural entries`);
    
    // Add each Thirukkural to storage
    let addedCount = 0;
    
    // Map DataFrame column names to our model
    const columnMapping = {
      'ID': 'number',
      'Kural': 'tamil',
      'Couplet': 'english',
      'Vilakam': 'tamilExplanation',
      'M_Varadharajanar': 'englishExplanation',
      'Adhigaram_ID': 'chapter',
      'Adhigaram': 'chapterName',
      'Paal': 'sectionName'
    };
    
    for (const item of thirukkuralData) {
      try {
        if (!item || typeof item !== 'object') continue;
        
        const thirukkural: Partial<Thirukkural> = {
          id: addedCount + 1, // Auto-increment ID
        };
        
        // Map fields based on column mapping
        for (const [dataField, schemaField] of Object.entries(columnMapping)) {
          if (dataField in item) {
            (thirukkural as any)[schemaField] = item[dataField];
          }
        }
        
        // Also try to directly map fields if they match our schema
        for (const field of ['number', 'chapter', 'chapterName', 'sectionName', 'tamil', 'english', 
                            'tamilExplanation', 'englishExplanation']) {
          if (field in item && !(thirukkural as any)[field]) {
            (thirukkural as any)[field] = item[field];
          }
        }
        
        // Ensure essential fields are present and have valid values
        if (!thirukkural.number) {
          // Try to get the number from 'ID' field
          if ('ID' in item) {
            thirukkural.number = typeof item.ID === 'number' ? item.ID : parseInt(String(item.ID), 10);
          } else {
            thirukkural.number = addedCount + 1;
          }
        }
        
        if (!thirukkural.chapter && 'Adhigaram_ID' in item) {
          thirukkural.chapter = typeof item.Adhigaram_ID === 'number' ? 
            item.Adhigaram_ID : parseInt(String(item.Adhigaram_ID), 10);
        }
        
        // Store the Thirukkural
        await storage.addThirukkural(thirukkural as Thirukkural);
        addedCount++;
      } catch (error) {
        console.error('Error processing Thirukkural item:', error);
      }
    }
    
    console.log(`Successfully added ${addedCount} Thirukkurals to storage`);
    return true;
  } catch (error) {
    console.error('Failed to initialize Thirukkural data:', error);
    return false;
  }
}