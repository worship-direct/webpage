#!/usr/bin/env python3
"""
Convert ASV Bible JSON from complex resultset format to nested JSON structure.

Input format: {"resultset": {"row": [{"field": [id, book_num, chapter, verse, text]}]}}
Output format: {"Book": {"Chapter": {"Verse": "Verse text"}}}
"""

import json
import os
import sys

# Bible book names mapping (book number to name)
BOOK_NAMES = {
    1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
    6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
    16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
    21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
    26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
    31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
    36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
    41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
    46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
    51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
    56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
    61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude",
    66: "Revelation"
}

def convert_asv_to_nested(input_file, output_file):
    """Convert ASV Bible from resultset format to nested JSON structure."""
    
    print(f"Reading ASV Bible from: {input_file}")
    
    # Read the input file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find input file: {input_file}")
        return False
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in input file: {e}")
        return False
    
    # Initialize the nested structure
    nested_bible = {}
    
    # Process each verse from the resultset
    if 'resultset' not in data or 'row' not in data['resultset']:
        print("Error: Input file does not have expected 'resultset.row' structure")
        return False
    
    total_verses = len(data['resultset']['row'])
    print(f"Processing {total_verses} verses...")
    
    for i, row in enumerate(data['resultset']['row']):
        if 'field' not in row:
            print(f"Warning: Row {i} missing 'field' property, skipping")
            continue
        
        field = row['field']
        if len(field) < 5:
            print(f"Warning: Row {i} field has less than 5 elements, skipping")
            continue
        
        # Extract verse information: [id, book_num, chapter, verse, text]
        verse_id, book_num, chapter, verse, text = field[0], field[1], field[2], field[3], field[4]
        
        # Get book name
        book_name = BOOK_NAMES.get(book_num)
        if not book_name:
            print(f"Warning: Unknown book number {book_num} for verse {verse_id}, skipping")
            continue
        
        # Convert to strings for JSON keys
        chapter_str = str(chapter)
        verse_str = str(verse)
        
        # Initialize nested structure if needed
        if book_name not in nested_bible:
            nested_bible[book_name] = {}
        if chapter_str not in nested_bible[book_name]:
            nested_bible[book_name][chapter_str] = {}
        
        # Add the verse
        nested_bible[book_name][chapter_str][verse_str] = text
        
        # Progress indicator
        if (i + 1) % 5000 == 0:
            print(f"Processed {i + 1}/{total_verses} verses...")
    
    print(f"Conversion complete. Writing to: {output_file}")
    
    # Write the output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(nested_bible, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error writing output file: {e}")
        return False
    
    # Print summary
    book_count = len(nested_bible)
    verse_count = sum(len(verses) for book in nested_bible.values() for verses in book.values())
    print(f"Successfully converted {book_count} books with {verse_count} verses.")
    
    return True

def main():
    """Main function."""
    # Get the script directory and set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    # Default paths
    input_file = os.path.join(repo_root, 'bible', 'asv.json')
    output_file = os.path.join(repo_root, 'bible', 'asv_nested.json')
    
    # Allow command line arguments for custom paths
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    
    print("ASV Bible JSON Converter")
    print("========================")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print()
    
    success = convert_asv_to_nested(input_file, output_file)
    
    if success:
        print("\n✅ Conversion completed successfully!")
        print(f"📖 Nested ASV Bible saved to: {output_file}")
    else:
        print("\n❌ Conversion failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()