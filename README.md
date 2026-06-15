# NewSimuladorR81

Simulador de financiamiento para asesores de Robledo81. El asesor elige nivel y
departamento, ve el precio de lista y los planes de pago, y genera una cotización en PDF.

Hecho con React + Vite. Único dato externo: `lucide-react` (iconos).

## Correr en local

```bash
npm install
npm run dev
```

Abre la URL que aparece (normalmente http://localhost:5173).

## Construir para producción

```bash
npm run build      # genera /dist
npm run preview    # prueba la build
```

## Estructura

```
public/planos/        Imágenes de los planos (N1, N2-N3, N4 ... N9)
src/components/SimuladorRobledo81.jsx   Componente principal
src/data/units.js     Inventario, precios, esquemas y rutas de imágenes
src/App.jsx           Monta el simulador
```

## Pendientes / siguientes pasos

- **Datos**: el inventario vive en `src/data/units.js` (congelado al 11 jun 2026), con los
  9 departamentos vendidos marcados. Si ya tienes un `units.ts`, conviene unificar a una
  sola fuente de datos.
- **Disponibilidad en vivo**: para que "vendido" se actualice solo, conectar al Google Sheet.
- **PDF**: el botón usa "Guardar como PDF" del navegador. Para descarga de un clic, usar
  `jspdf` + `html2canvas`.
