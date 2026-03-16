
import os

def check_indentation(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.ts', '.tsx', '.html', '.css', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    has_tabs = False
                    has_spaces = False
                    for line in lines:
                        if line.startswith('\t'):
                            has_tabs = True
                        if line.startswith(' '):
                            has_spaces = True
                    if has_tabs and has_spaces:
                        print(f"{path}: Mixed tabs and spaces")
                    elif has_tabs:
                        print(f"{path}: Uses tabs")
                    elif has_spaces:
                        print(f"{path}: Uses spaces")

check_indentation(r'C:\Users\Projeto Pogo\Documents\estilo-modas\estilo-vip-landing')
