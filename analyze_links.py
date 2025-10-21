#!/usr/bin/env python3
"""
Script para analizar todos los links en el proyecto CUENTY
y detectar links rotos
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

# Colores para terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def find_files(directory, extensions):
    """Encuentra todos los archivos con las extensiones especificadas"""
    files = []
    for ext in extensions:
        files.extend(Path(directory).rglob(f'*.{ext}'))
    return [f for f in files if '.build' not in str(f) and 'node_modules' not in str(f)]

def extract_links(content, file_path):
    """Extrae todos los links de un archivo"""
    links = {
        'internal_routes': [],
        'api_routes': [],
        'external_links': [],
        'images': [],
        'router_navigation': []
    }
    
    # Patrones para buscar links
    # 1. href en Links y anchors
    href_pattern = r'href=["\'](.*?)["\']'
    for match in re.finditer(href_pattern, content):
        url = match.group(1)
        if url.startswith('http://') or url.startswith('https://'):
            links['external_links'].append(url)
        elif url.startswith('/api/'):
            links['api_routes'].append(url)
        elif url.startswith('/') or url.startswith('#'):
            links['internal_routes'].append(url)
    
    # 2. router.push y router.replace
    router_pattern = r'router\.(push|replace)\(["\']([^"\']+)["\']\)'
    for match in re.finditer(router_pattern, content):
        url = match.group(2)
        links['router_navigation'].append(url)
        if url.startswith('/api/'):
            links['api_routes'].append(url)
        elif url.startswith('/'):
            links['internal_routes'].append(url)
    
    # 3. fetch calls
    fetch_pattern = r'fetch\(["\']([^"\']+)["\']\)'
    for match in re.finditer(fetch_pattern, content):
        url = match.group(1)
        if url.startswith('/api/'):
            links['api_routes'].append(url)
    
    # 4. Image sources
    img_pattern = r'src=["\'](.*?\.(?:png|jpg|jpeg|svg|webp|gif))["\']'
    for match in re.finditer(img_pattern, content, re.IGNORECASE):
        links['images'].append(match.group(1))
    
    return links

def check_route_exists(route, nextjs_dir):
    """Verifica si una ruta existe en el sistema de archivos"""
    # Ignorar anchors
    if route.startswith('#'):
        return True
    
    # Limpiar query params
    route = route.split('?')[0]
    
    # Rutas especiales que siempre existen
    special_routes = ['/', '/api/auth/[...nextauth]']
    if route in special_routes:
        return True
    
    # Para rutas de API
    if route.startswith('/api/'):
        api_path = route[5:]  # Remover /api/
        # Verificar con route.ts
        full_path = nextjs_dir / 'app' / 'api' / api_path / 'route.ts'
        if full_path.exists():
            return True
        # Verificar rutas dinámicas
        parts = api_path.split('/')
        for i in range(len(parts)):
            test_parts = parts[:i+1]
            # Probar con [id]
            test_parts[-1] = '[id]'
            test_path = nextjs_dir / 'app' / 'api' / '/'.join(test_parts) / 'route.ts'
            if test_path.exists():
                return True
        return False
    
    # Para rutas normales
    route_path = route[1:] if route.startswith('/') else route
    
    # Verificar page.tsx directamente
    page_path = nextjs_dir / 'app' / route_path / 'page.tsx'
    if page_path.exists():
        return True
    
    # Verificar rutas dinámicas
    parts = route_path.split('/')
    for i in range(len(parts)):
        test_parts = parts[:i+1]
        # Probar con [id]
        test_parts[-1] = '[id]'
        test_path = nextjs_dir / 'app' / '/'.join(test_parts) / 'page.tsx'
        if test_path.exists():
            return True
    
    return False

def main():
    nextjs_dir = Path('/home/ubuntu/cuenty_mvp/nextjs_space')
    
    print(f"\n{Colors.BOLD}{Colors.BLUE}🔍 ANÁLISIS DE LINKS - PROYECTO CUENTY{Colors.ENDC}\n")
    print(f"{Colors.YELLOW}Analizando archivos...{Colors.ENDC}\n")
    
    # Encontrar todos los archivos
    files = find_files(nextjs_dir, ['tsx', 'ts', 'jsx', 'js'])
    
    all_links = defaultdict(lambda: defaultdict(list))
    broken_links = []
    
    # Analizar cada archivo
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            links = extract_links(content, file_path)
            
            relative_path = str(file_path.relative_to(nextjs_dir))
            
            for category, urls in links.items():
                for url in urls:
                    all_links[category][url].append(relative_path)
    
    # Verificar rutas internas
    print(f"{Colors.BOLD}📋 VERIFICANDO RUTAS INTERNAS...{Colors.ENDC}\n")
    internal_routes = set(all_links['internal_routes'].keys()) | set(all_links['router_navigation'].keys())
    
    for route in sorted(internal_routes):
        exists = check_route_exists(route, nextjs_dir)
        files_list = list(set(all_links['internal_routes'][route] + all_links['router_navigation'][route]))
        
        if exists:
            print(f"{Colors.GREEN}✓{Colors.ENDC} {route}")
        else:
            print(f"{Colors.RED}✗{Colors.ENDC} {route} {Colors.RED}[ROTO]{Colors.ENDC}")
            broken_links.append({
                'type': 'internal_route',
                'url': route,
                'files': files_list
            })
        
        # Mostrar archivos donde se usa (solo para rutas rotas o verbose)
        if not exists:
            for f in files_list[:3]:  # Mostrar máximo 3
                print(f"    └─ {Colors.YELLOW}{f}{Colors.ENDC}")
            if len(files_list) > 3:
                print(f"    └─ {Colors.YELLOW}... y {len(files_list) - 3} archivo(s) más{Colors.ENDC}")
    
    # Verificar rutas de API
    print(f"\n{Colors.BOLD}📋 VERIFICANDO RUTAS DE API...{Colors.ENDC}\n")
    api_routes = set(all_links['api_routes'].keys())
    
    for route in sorted(api_routes):
        exists = check_route_exists(route, nextjs_dir)
        files_list = list(set(all_links['api_routes'][route]))
        
        if exists:
            print(f"{Colors.GREEN}✓{Colors.ENDC} {route}")
        else:
            print(f"{Colors.RED}✗{Colors.ENDC} {route} {Colors.RED}[ROTO]{Colors.ENDC}")
            broken_links.append({
                'type': 'api_route',
                'url': route,
                'files': files_list
            })
            for f in files_list[:3]:
                print(f"    └─ {Colors.YELLOW}{f}{Colors.ENDC}")
    
    # Links externos (solo mostrar resumen)
    print(f"\n{Colors.BOLD}🌐 LINKS EXTERNOS ENCONTRADOS: {len(all_links['external_links'])}{Colors.ENDC}")
    external_domains = defaultdict(int)
    for url in all_links['external_links'].keys():
        domain = url.split('/')[2] if len(url.split('/')) > 2 else 'unknown'
        external_domains[domain] += 1
    
    for domain, count in sorted(external_domains.items()):
        print(f"  • {domain}: {count} referencias")
    
    # Imágenes
    print(f"\n{Colors.BOLD}🖼️  IMÁGENES REFERENCIADAS: {len(all_links['images'])}{Colors.ENDC}")
    local_images = [img for img in all_links['images'].keys() if not img.startswith('http')]
    external_images = [img for img in all_links['images'].keys() if img.startswith('http')]
    print(f"  • Locales: {len(local_images)}")
    print(f"  • Externas: {len(external_images)}")
    
    # Resumen final
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}📊 RESUMEN DEL ANÁLISIS{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    total_internal = len(internal_routes)
    total_api = len(api_routes)
    total_broken = len(broken_links)
    
    print(f"Total de rutas internas: {total_internal}")
    print(f"Total de rutas de API: {total_api}")
    print(f"Total de links externos: {len(all_links['external_links'])}")
    print(f"Total de imágenes: {len(all_links['images'])}")
    print(f"\n{Colors.BOLD}Links rotos encontrados: {Colors.RED if total_broken > 0 else Colors.GREEN}{total_broken}{Colors.ENDC}")
    
    if broken_links:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  LINKS ROTOS DETECTADOS:{Colors.ENDC}\n")
        for link in broken_links:
            print(f"{Colors.RED}• {link['type'].upper()}: {link['url']}{Colors.ENDC}")
            print(f"  Usado en {len(link['files'])} archivo(s)")
            for f in link['files'][:2]:
                print(f"    └─ {f}")
            if len(link['files']) > 2:
                print(f"    └─ ... y {len(link['files']) - 2} más")
            print()
    
    # Guardar reporte JSON
    report = {
        'summary': {
            'total_internal_routes': total_internal,
            'total_api_routes': total_api,
            'total_external_links': len(all_links['external_links']),
            'total_images': len(all_links['images']),
            'total_broken_links': total_broken
        },
        'broken_links': broken_links,
        'all_links': {k: dict(v) for k, v in all_links.items()}
    }
    
    report_path = nextjs_dir / 'link_analysis_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n{Colors.GREEN}✓ Reporte detallado guardado en: {report_path}{Colors.ENDC}\n")
    
    return total_broken

if __name__ == '__main__':
    broken_count = main()
    exit(0 if broken_count == 0 else 1)
