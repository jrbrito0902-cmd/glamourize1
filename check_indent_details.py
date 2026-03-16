
import os
import re

def check_indent_details(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    lines = content.splitlines()
                    
                    indent_counts = []
                    for line in lines:
                        if line.strip():
                            match = re.match(r'^( +)', line)
                            if match:
                                indent_counts.append(len(match.group(1)))
                    
                    if indent_counts:
                        # Find the GCD of indent counts or just common diffs
                        common_indent = 0
                        diffs = [indent_counts[i] - indent_counts[i-1] for i in range(1, len(indent_counts)) if indent_counts[i] != indent_counts[i-1]]
                        if diffs:
                            from collections import Counter
                            common_indent = Counter([abs(d) for d in diffs]).most_common(1)[0][0]
                        
                        print(f"{file}: Most common indent step seems to be {common_indent} spaces")

check_indent_details(r'C:\Users\Projeto Pogo\Documents\estilo-modas\estilo-vip-landing')
