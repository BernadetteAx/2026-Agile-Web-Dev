"""
Word service module for loading and selecting words from the local word list.
Replaces external API calls with a local word bank for better performance and reliability.
"""

import random
import os

# Module-level cache for loaded words
_words_cache = None


def load_words_from_file():
    """
    Load and validate words from word_data/words.txt on app startup.
    Words are cached in memory for fast access.
    Filters words to 4-8 letters and alphabetic characters only.
    Converts all words to uppercase for consistency.
    
    Returns:
        list: List of validated words in uppercase
    Raises:
        FileNotFoundError: If words.txt cannot be found
        ValueError: If no valid words found after filtering
    """
    global _words_cache
    
    # Return cached words if already loaded
    if _words_cache is not None:
        return _words_cache
    
    # Construct path to words.txt
    words_file = os.path.join(
        os.path.dirname(__file__),
        '..',
        'word_data',
        'words.txt'
    )
    
    # Read and validate words
    try:
        with open(words_file, 'r', encoding='utf-8') as f:
            all_words = f.read().strip().split('\n')
    except FileNotFoundError:
        raise FileNotFoundError(f"Words file not found at {words_file}")
    
    # Filter: alphabetic only, 4-8 letters, convert to uppercase
    valid_words = [
        word.upper() 
        for word in all_words 
        if word and word.isalpha() and 4 <= len(word) <= 8
    ]
    
    if not valid_words:
        raise ValueError("No valid words found in words.txt after filtering")
    
    # Cache the validated words
    _words_cache = valid_words
    return _words_cache


def get_random_word():
    """
    Get a random word from the loaded word list.
    
    Returns:
        str: A random word in uppercase
    Raises:
        RuntimeError: If words have not been loaded yet
    """
    global _words_cache
    
    # Ensure words are loaded
    if _words_cache is None:
        load_words_from_file()
    
    if not _words_cache:
        raise RuntimeError("No words available in word list")
    
    return random.choice(_words_cache)
