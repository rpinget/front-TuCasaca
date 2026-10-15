# TuCasaca - Front

Front en React de **TuCasaca**, e-commerce de camisetas de fútbol.
Proyecto del Grupo 05 de Aplicaciones Interactivas (UADE).

El back (Spring Boot) está en otro repositorio: `back-TuCasaca`.

## Tecnologías

- React 19 + Vite
- React Router (navegación entre pantallas)
- Context API (sesión y carrito)
- CSS propio, responsive para celular, tablet y escritorio

## Cómo correrlo

Requisitos: Node.js instalado (`node -v` y `npm -v` tienen que responder).

```bash
npm install
npm run dev
```

Abrir http://localhost:5173/

Otros comandos:

```bash
npm run build     # genera la versión de producción en /dist
npm run preview   # sirve la versión de producción
npm run lint      # revisa el código con oxlint
```

### Con Docker (opcional)

```bash
docker compose up --build
```

Queda disponible en http://localhost:5173/

## Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio: portada, listado de casacas, filtro por liga y buscador | Público |
| `/casacas/:id` | Detalle de una casaca y agregar al carrito | Público (comprar requiere sesión) |
| `/login` | Iniciar sesión | Público |
| `/registro` | Crear cuenta | Público |
| `/carrito` | Carrito de compras | Usuario logueado |
| `/checkout` | Confirmar compra | Usuario logueado |
| `/admin` | Alta, edición y baja de casacas | Solo rol `ADMIN` |

## Estructura de carpetas

```
public/data/          Datos mock en JSON (ver más abajo)
src/
  main.jsx            Punto de entrada: Router y contextos
  App.jsx             Layout y definición de rutas
  index.css           Variables de diseño (colores, tipografías)
  context/
    AuthContext.jsx     Sesión del usuario (login, logout, rol)
    CarritoContext.jsx  Carrito de cada usuario
  components/
    Navbar              Buscador, categorías por liga, menú de usuario, carrito
    Footer
    CasacaCard          Tarjeta de casaca del listado
    CamisetaImg         Foto de la casaca o camiseta dibujada si no hay foto
  pages/
    Home, Detalle, Login, Registro, Carrito, Checkout, Admin, NotFound
```

## De dónde salen los datos (mock)

En esta etapa no se consume el back: los datos están en archivos JSON dentro de
`public/data` y se leen con `fetch` + `useEffect`. Cada archivo respeta la misma
forma que el JSON que devuelve el back, para que el cambio a la API real sea
cambiar solamente la URL.

| Archivo | Equivale a | DTO del back |
|---|---|---|
| `casacas.json` | `GET /api/casacas` | `CasacaDTO` (con `equipo` y `liga` anidados) |
| `ligas.json` | `GET /api/ligas` | `LigaDTO` |
| `equipos.json` | `GET /api/equipos` | `EquipoDTO` |
| `login.json` | respuesta de `POST /api/auth/login` | `LoginResponseDTO` |
| `usuario.json` | `GET /api/usuarios/me` | `UsuarioResponseDTO` |
| `carrito.json` | `GET /api/carritos/{usuarioId}` | `CarritoDTO` / `ItemCarritoDTO` |
| `usuarios-demo.json` | solo para simular el login | no existe en el back |

### Qué es simulado

- **Login:** se valida contra `usuarios-demo.json`. En el back real lo hace `POST /api/auth/login`.
- **Registro, alta/edición/baja de casacas y checkout:** las pantallas validan y actualizan
  el estado en memoria. Los lugares donde iría la llamada al back están marcados con
  un comentario `MOCK`.
- **Carrito:** se guarda en el navegador (`localStorage`), un carrito por usuario.
- **Admin:** los cambios se ven en la pantalla de administración y se pierden al recargar,
  porque los JSON de `public/data` son de solo lectura.

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@tucasaca.com | admin123 | ADMIN |
| ana.gomez@tucasaca.com | usuario123 | USUARIO |
| juan.perez@tucasaca.com | usuario123 | USUARIO |

## Conexión con el back (más adelante)

El back corre en http://localhost:8080 y ya tiene CORS habilitado para el front.
Para conectarlo hay que reemplazar las URLs `/data/*.json` por los endpoints
`/api/...` y enviar el token JWT en el header `Authorization: Bearer <token>`.
