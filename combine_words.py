from pathlib import Path

word_folder = Path("app/word_data")
output_file = word_folder / "words.txt"

all_words = set()

for file_path in word_folder.glob("*.txt"):
    # Avoid reading the output file if it already exists
    if file_path.name == "words.txt":
        continue

    with file_path.open("r", encoding="utf-8") as file:
        for line in file:
            word = line.strip().lower()

            # Skip blank lines
            if not word:
                continue

            # Optional: only keep alphabetic words
            if not word.isalpha():
                continue

            all_words.add(word)

with output_file.open("w", encoding="utf-8") as file:
    for word in sorted(all_words):
        file.write(word + "\n")

print(f"Combined {len(all_words)} unique words into {output_file}")