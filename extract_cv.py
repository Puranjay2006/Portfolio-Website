import PyPDF2
import sys

pdf_path = r"c:\Users\puran\OneDrive - Massey University\Documents\Portfolio Website\Puranjay_Gambhir_CV_.pdf"

try:
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    
    # Write to file to avoid encoding issues
    with open('cv_content.txt', 'w', encoding='utf-8') as out:
        out.write(text)
    print("CV content extracted successfully to cv_content.txt")
except Exception as e:
    print(f"Error: {e}")
