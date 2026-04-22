import os
import re

color_map = {
    # Backgrounds
    "backgroundColor: '#000000'": "backgroundColor: '#FFFFFF'",
    "backgroundColor: '#111827'": "backgroundColor: '#F8FAFC'",
    "backgroundColor: '#0F172A'": "backgroundColor: '#F1F5F9'",
    "backgroundColor: '#1E293B'": "backgroundColor: '#E2E8F0'",
    "backgroundColor: 'transparent'": "backgroundColor: '#273951'",
    
    # Text and Border colors from gold to Dark Blue
    "'#FBBF24'": "'#273951'",
    "\"#FBBF24\"": "\"#273951\"",
    "'#D4AF37'": "'#273951'",
    "\"#D4AF37\"": "\"#273951\"",
    
    # Text from white to dark text
    "color: '#FFFFFF'": "color: '#0F172A'",
    "color=\"#FFFFFF\"": "color=\"#0F172A\"",
    "text: '#FFFFFF'": "text: '#0F172A'",
    
    # Muted text
    "color: '#94A3B8'": "color: '#475569'",
    
    # Borders
    "borderColor: '#334155'": "borderColor: '#CBD5E1'",
    "borderColor: '#1F2937'": "borderColor: '#E2E8F0'",
    
    # Theme overrides
    "background: '#000000'": "background: '#FFFFFF'",
    "card: '#000000'": "card: '#FFFFFF'",
    "border: '#334155'": "border: '#E2E8F0'",
    "notification: '#FBBF24'": "notification: '#273951'",
    "contentStyle: { backgroundColor: '#000000' }": "contentStyle: { backgroundColor: '#FFFFFF' }",
    
    # Status bar
    "style=\"light\"": "style=\"dark\"",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    # 1. Base color replacements
    for old, new in color_map.items():
        content = content.replace(old, new)
        
    # 2. Fix CTA Button Text: The text inside buttons should be White over Dark Blue.
    # Look for buttonText styles and force color to #FFFFFF
    content = re.sub(r'(buttonText:[^}]*color:\s*\')[^\']+(\')', r'\g<1>#FFFFFF\2', content)
    
    # 3. Fix background color of icon circles in cards
    # If the icon circle was black, we made it white, but let's make it a light grey #F1F5F9 for contrast with white cards
    content = re.sub(r"(iconCircle: \{[\s\S]*?backgroundColor:\s*)'#FFFFFF'([\s\S]*?\})", r"\1'#F1F5F9'\2", content)

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

# Process files
dirs_to_check = [
    r"c:\Users\admin\Desktop\Verdict\verdict\app", 
    r"c:\Users\admin\Desktop\Verdict\verdict\components", 
    r"c:\Users\admin\Desktop\Verdict\Verdict\constants"
]

for d in dirs_to_check:
    if os.path.exists(d):
        for root, dirs, files in os.walk(d):
            for f in files:
                if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.js'):
                    process_file(os.path.join(root, f))
