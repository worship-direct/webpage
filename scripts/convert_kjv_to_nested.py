#!/usr/bin/env python3
"""
Convert KJV Bible JSON from flat key-value format to nested JSON structure.

Input format: {"Book Chapter:Verse": "Verse text"}
Output format: {"Book": {"Chapter": {"Verse": "Verse text"}}}
"""

import json
import os
import sys
import re

def parse_verse_key(key):
    """Parse a verse key like 'Genesis 1:1' into (book, chapter, verse)."""
    # Use regex to match "Book Chapter:Verse" pattern
    # Handle books with numbers and spaces like "1 Samuel", "Song of Solomon"
    match = re.match(r'^(.+?)\s+(\d+):(\d+)$', key.strip())
    
    if not match:
        return None, None, None
    
    book = match.group(1).strip()
    chapter = match.group(2)
    verse = match.group(3)
    
    return book, chapter, verse

def convert_kjv_to_nested(input_file, output_file):
    """Convert KJV Bible from flat format to nested JSON structure."""
    
    print(f"Reading KJV Bible from: {input_file}")
    
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
    
    total_verses = len(data)
    print(f"Processing {total_verses} verses...")
    
    skipped_count = 0
    
    for i, (verse_key, verse_text) in enumerate(data.items()):
        # Parse the verse key
        book, chapter, verse = parse_verse_key(verse_key)
        
        if not book or not chapter or not verse:
            print(f"Warning: Could not parse verse key '{verse_key}', skipping")
            skipped_count += 1
            continue
        
        # Initialize nested structure if needed
        if book not in nested_bible:
            nested_bible[book] = {}
        if chapter not in nested_bible[book]:
            nested_bible[book][chapter] = {}
        
        # Add the verse
        nested_bible[book][chapter][verse] = verse_text
        
        # Progress indicator
        if (i + 1) % 5000 == 0:
            print(f"Processed {i + 1}/{total_verses} verses...")
    
    if skipped_count > 0:
        print(f"Warning: Skipped {skipped_count} verses due to parsing issues")
    
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
    input_file = os.path.join(repo_root, 'bible', 'kjv.json')
    output_file = os.path.join(repo_root, 'bible', 'kjv_nested.json')
    
    # Allow command line arguments for custom paths
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    
    print("KJV Bible JSON Converter")
    print("========================")
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print()
    
    success = convert_kjv_to_nested(input_file, output_file)
    
    if success:
        print("\n✅ Conversion completed successfully!")
        print(f"📖 Nested KJV Bible saved to: {output_file}")
    else:
        print("\n❌ Conversion failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()